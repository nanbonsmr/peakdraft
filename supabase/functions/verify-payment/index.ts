import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, planId, paymentId } = await req.json();

    console.log('Verifying payment:', { 
      userId, 
      planId,
      paymentId,
      timestamp: new Date().toISOString()
    });

    if (!userId || !planId) {
      throw new Error('Missing required fields: userId and planId');
    }

    const dodoApiKey = Deno.env.get('DODO_PAYMENTS_API_KEY');
    if (!dodoApiKey) {
      throw new Error('Dodo Payments API key not configured');
    }

    // Verify payment with Dodo Payments API by checking recent payments for this user
    const baseUrl = 'https://live.dodopayments.com';
    
    // Get recent payments to find one matching this user and plan
    const paymentsResponse = await fetch(`${baseUrl}/payments?limit=10`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${dodoApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!paymentsResponse.ok) {
      const errorText = await paymentsResponse.text();
      console.error('Failed to fetch payments from Dodo:', errorText);
      throw new Error('Failed to verify payment with payment provider');
    }

    const paymentsData = await paymentsResponse.json();
    console.log('Recent payments from Dodo:', JSON.stringify(paymentsData, null, 2));

    // Find a successful payment for this user and plan
    const payments = paymentsData.items || paymentsData || [];
    const validPayment = payments.find((payment: any) => {
      const metadata = payment.metadata || {};
      const isCorrectUser = metadata.user_id === userId;
      const isCorrectPlan = metadata.plan_id === planId;
      const isSuccessful = payment.status === 'succeeded' || payment.status === 'completed';
      
      // Check if payment was made within the last hour
      const paymentDate = new Date(payment.created_at || payment.created);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const isRecent = paymentDate > oneHourAgo;

      console.log('Checking payment:', {
        paymentId: payment.id,
        status: payment.status,
        metadata,
        isCorrectUser,
        isCorrectPlan,
        isSuccessful,
        isRecent
      });

      return isCorrectUser && isCorrectPlan && isSuccessful && isRecent;
    });

    if (!validPayment) {
      console.log('No valid payment found for user:', userId, 'plan:', planId);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No valid payment found. Please complete the payment process.',
          verified: false
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Valid payment found:', validPayment.payment_id);

    // Verify the payment amount is greater than 0 (not a test/free payment)
    if (validPayment.total_amount <= 0) {
      console.log('Payment amount is 0 or negative, rejecting:', validPayment.total_amount);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid payment amount. Please complete a valid payment.',
          verified: false
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Map plan IDs to subscription details
    const planConfig: Record<string, { words_limit: number; plan_name: string }> = {
      'basic': { words_limit: 50000, plan_name: 'basic' },
      'pro': { words_limit: 100000, plan_name: 'pro' },
      'enterprise': { words_limit: 200000, plan_name: 'enterprise' }
    };

    const config = planConfig[planId];
    if (!config) {
      throw new Error(`Unknown plan ID: ${planId}`);
    }

    // Check current user profile (use maybeSingle to handle non-existent profiles)
    const { data: currentProfile, error: fetchError } = await supabaseClient
      .from('profiles')
      .select('subscription_plan, subscription_start_date')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      throw fetchError;
    }

    // If no profile exists, we can't update subscription
    if (!currentProfile) {
      console.error('No profile found for user:', userId);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'User profile not found. Please contact support.',
          verified: false
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if already on this plan (avoid duplicate updates)
    if (currentProfile.subscription_plan === config.plan_name) {
      const startDate = currentProfile.subscription_start_date ? new Date(currentProfile.subscription_start_date) : null;
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      if (startDate && startDate > fiveMinutesAgo) {
        console.log('Subscription already updated recently, skipping');
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Subscription already active',
            plan: config.plan_name,
            verified: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Calculate subscription dates
    const subscriptionStart = new Date();
    const subscriptionEnd = new Date();
    subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);

    // Update user's profile with new subscription
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        subscription_plan: config.plan_name,
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

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Subscription updated successfully',
        plan: config.plan_name,
        words_limit: config.words_limit,
      paymentId: validPayment.payment_id
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );

  } catch (error) {
    console.error('Payment verification error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to verify payment',
        verified: false
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
