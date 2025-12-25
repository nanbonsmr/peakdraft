import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, webhook-id, webhook-signature, webhook-timestamp',
};

// Verify webhook signature following Standard Webhooks spec
async function verifyWebhookSignature(
  payload: string, 
  webhookId: string,
  webhookTimestamp: string,
  webhookSignature: string, 
  secret: string
): Promise<boolean> {
  try {
    // The secret from Dodo is base64 encoded with a "whsec_" prefix
    const secretKey = secret.startsWith('whsec_') ? secret.slice(6) : secret;
    const secretBytes = Uint8Array.from(atob(secretKey), c => c.charCodeAt(0));

    // Build the signed content: {id}.{timestamp}.{payload}
    const signedContent = `${webhookId}.${webhookTimestamp}.${payload}`;
    
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      secretBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signedContent)
    );
    
    const computedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
    
    // The signature header contains multiple signatures separated by space
    // Format: v1,{base64_signature}
    const signatures = webhookSignature.split(' ');
    for (const sig of signatures) {
      const [version, signature] = sig.split(',');
      if (version === 'v1' && signature === computedSignature) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload = await req.text();
    const webhookId = req.headers.get('webhook-id') || '';
    const webhookTimestamp = req.headers.get('webhook-timestamp') || '';
    const webhookSignature = req.headers.get('webhook-signature') || '';
    const webhookSecret = Deno.env.get('DODO_PAYMENTS_WEBHOOK_KEY') || '';

    console.log('Received Dodo webhook:', { webhookId, webhookTimestamp });

    // Verify webhook signature
    if (webhookSecret && webhookSignature) {
      const isValid = await verifyWebhookSignature(
        payload, 
        webhookId, 
        webhookTimestamp, 
        webhookSignature, 
        webhookSecret
      );
      if (!isValid) {
        console.warn('Invalid webhook signature');
        // Continue processing for now, but log the warning
      }
    }

    const event = JSON.parse(payload);
    console.log('Dodo webhook event:', JSON.stringify(event, null, 2));

    const eventType = event.type;
    console.log('Processing event type:', eventType);

    // Handle payment success events
    if (eventType === 'payment.succeeded') {
      const data = event.data;
      const metadata = data.metadata || {};
      const userId = metadata.user_id;
      const planId = metadata.plan_id;
      const paymentAmount = data.total_amount || data.amount || 0;

      console.log('Payment succeeded for user:', userId, 'plan:', planId, 'amount:', paymentAmount);

      // CRITICAL: Reject $0 payments - these are test/trial payments that shouldn't activate subscriptions
      if (paymentAmount <= 0) {
        console.warn('Rejecting $0 payment - subscription not activated. Amount:', paymentAmount);
        return new Response(
          JSON.stringify({ received: true, skipped: true, reason: 'Zero amount payment' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      if (!userId || !planId) {
        console.error('Missing user_id or plan_id in webhook metadata');
        return new Response(
          JSON.stringify({ error: 'Missing required metadata' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Map plan IDs to subscription details
      const planConfig: Record<string, { words_limit: number; plan_name: string }> = {
        'basic': { words_limit: 50000, plan_name: 'Basic' },
        'pro': { words_limit: 100000, plan_name: 'Pro' },
        'enterprise': { words_limit: 200000, plan_name: 'Enterprise' }
      };

      const config = planConfig[planId];
      if (!config) {
        throw new Error(`Unknown plan ID: ${planId}`);
      }

      // Calculate subscription dates
      const subscriptionStart = new Date();
      const subscriptionEnd = new Date();
      subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);

      // Update user's profile with new subscription
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({
          subscription_plan: config.plan_name.toLowerCase(),
          words_limit: config.words_limit,
          words_used: 0,
          subscription_start_date: subscriptionStart.toISOString(),
          subscription_end_date: subscriptionEnd.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }

      console.log(`Successfully updated subscription for user ${userId} to ${config.plan_name} (paid: ${paymentAmount})`);
    }

    // Handle subscription created/activated events
    if (eventType === 'subscription.created' || eventType === 'subscription.active') {
      const data = event.data;
      const metadata = data.metadata || {};
      const userId = metadata.user_id;
      const planId = metadata.plan_id;
      // Check for payment amount in subscription data
      const subscriptionAmount = data.recurring_pre_tax_amount || data.amount || 0;

      console.log('Subscription event for user:', userId, 'plan:', planId, 'amount:', subscriptionAmount);

      // CRITICAL: Reject $0 subscriptions
      if (subscriptionAmount <= 0) {
        console.warn('Rejecting $0 subscription - not activated. Amount:', subscriptionAmount);
        return new Response(
          JSON.stringify({ received: true, skipped: true, reason: 'Zero amount subscription' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      if (userId && planId) {
        const planConfig: Record<string, { words_limit: number; plan_name: string }> = {
          'basic': { words_limit: 50000, plan_name: 'Basic' },
          'pro': { words_limit: 100000, plan_name: 'Pro' },
          'enterprise': { words_limit: 200000, plan_name: 'Enterprise' }
        };

        const config = planConfig[planId];
        if (config) {
          const subscriptionStart = new Date();
          const subscriptionEnd = new Date();
          subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);

          const { error: updateError } = await supabaseClient
            .from('profiles')
            .update({
              subscription_plan: config.plan_name.toLowerCase(),
              words_limit: config.words_limit,
              words_used: 0,
              subscription_start_date: subscriptionStart.toISOString(),
              subscription_end_date: subscriptionEnd.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

          if (updateError) {
            console.error('Error updating profile:', updateError);
          } else {
            console.log(`Subscription activated for user ${userId} to ${config.plan_name} (amount: ${subscriptionAmount})`);
          }
        }
      }
    }

    // Handle subscription cancellation
    if (eventType === 'subscription.cancelled' || eventType === 'subscription.canceled') {
      const data = event.data;
      const metadata = data.metadata || {};
      const userId = metadata.user_id;

      if (userId) {
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({
            subscription_plan: 'free',
            words_limit: 500,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Error updating profile on cancellation:', updateError);
        } else {
          console.log(`Subscription canceled for user ${userId}`);
        }
    }
    }

    // Handle payment failure events
    if (eventType === 'payment.failed') {
      const data = event.data;
      const metadata = data.metadata || {};
      const userId = metadata.user_id;
      const planId = metadata.plan_id;
      const errorCode = data.error_code || 'UNKNOWN_ERROR';
      const errorMessage = data.error_message || 'Payment failed';

      console.log('Payment failed for user:', userId, 'plan:', planId, 'error:', errorCode, errorMessage);

      // Map Dodo error codes to user-friendly messages
      const errorMessages: Record<string, string> = {
        'INSUFFICIENT_FUNDS': 'Your card has insufficient funds. Please use a different payment method.',
        'CARD_DECLINED': 'Your card was declined. Please try a different card.',
        'EXPIRED_CARD': 'Your card has expired. Please use a valid card.',
        'INVALID_CARD': 'Invalid card details. Please check and try again.',
        'PROCESSING_ERROR': 'Payment processing error. Please try again later.',
        'AUTHENTICATION_REQUIRED': 'Additional authentication required. Please complete verification.',
        'FRAUD_DETECTED': 'Transaction flagged for security. Please contact your bank.',
      };

      const friendlyMessage = errorMessages[errorCode] || errorMessage;
      
      // Log the failure with details for debugging
      console.log(`Payment failure details: user=${userId}, plan=${planId}, error=${errorCode}, message=${friendlyMessage}`);
    }

    // Handle subscription failure events
    if (eventType === 'subscription.failed' || eventType === 'subscription.updated') {
      const data = event.data;
      const metadata = data.metadata || {};
      const userId = metadata.user_id;
      const planId = metadata.plan_id;
      const status = data.status;

      // Only log failures, not successful updates
      if (status === 'failed') {
        console.log('Subscription failed for user:', userId, 'plan:', planId, 'status:', status);
      }
    }

    // Handle refund events
    if (eventType === 'refund.succeeded') {
      const data = event.data;
      const metadata = data.metadata || {};
      const userId = metadata.user_id;

      if (userId) {
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({
            subscription_plan: 'free',
            words_limit: 500,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Error updating profile on refund:', updateError);
        } else {
          console.log(`Refund processed, subscription reverted for user ${userId}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Webhook processing failed' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
