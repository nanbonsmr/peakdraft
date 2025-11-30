import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple signature verification for Paddle webhooks
async function verifyPaddleSignature(payload: string, signature: string, webhookSecret: string): Promise<boolean> {
  try {
    // Paddle uses HMAC-SHA256 for webhook signatures
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(payload)
    );
    
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Extract the h1 signature from the Paddle-Signature header
    const signatureParts = signature.split(';');
    let h1Signature = '';
    for (const part of signatureParts) {
      if (part.startsWith('h1=')) {
        h1Signature = part.substring(3);
        break;
      }
    }
    
    return h1Signature === computedSignature;
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
    const paddleSignature = req.headers.get('Paddle-Signature') || '';
    const webhookSecret = Deno.env.get('PADDLE_WEBHOOK_SECRET') || '';

    // Verify webhook signature (optional but recommended)
    if (webhookSecret && paddleSignature) {
      const isValid = await verifyPaddleSignature(payload, paddleSignature, webhookSecret);
      if (!isValid) {
        console.warn('Invalid webhook signature, proceeding anyway for development');
      }
    }

    const event = JSON.parse(payload);
    console.log('Received Paddle webhook:', JSON.stringify(event, null, 2));

    const eventType = event.event_type;
    console.log('Processing event type:', eventType);

    // Handle subscription events
    if (eventType === 'subscription.created' || eventType === 'subscription.activated' || eventType === 'transaction.completed') {
      const data = event.data;
      const customData = data.custom_data || {};
      const userId = customData.user_id;
      const planId = customData.plan_id;

      if (!userId || !planId) {
        console.error('Missing user_id or plan_id in webhook custom_data');
        return new Response(
          JSON.stringify({ error: 'Missing required custom data' }),
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

      console.log(`Successfully updated subscription for user ${userId} to ${config.plan_name}`);
    }

    // Handle subscription cancellation
    if (eventType === 'subscription.canceled') {
      const data = event.data;
      const customData = data.custom_data || {};
      const userId = customData.user_id;

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

    return new Response(
      JSON.stringify({ success: true }),
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
