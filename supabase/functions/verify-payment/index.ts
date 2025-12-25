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

    const { userId, planId } = await req.json();

    console.log('Verifying payment and updating subscription:', { 
      userId, 
      planId,
      timestamp: new Date().toISOString()
    });

    if (!userId || !planId) {
      throw new Error('Missing required fields: userId and planId');
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

    // Check current user profile
    const { data: currentProfile, error: fetchError } = await supabaseClient
      .from('profiles')
      .select('subscription_plan, subscription_start_date')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      throw fetchError;
    }

    // Check if already on this plan (avoid duplicate updates)
    if (currentProfile?.subscription_plan === config.plan_name) {
      // Check if subscription was updated within the last 5 minutes
      const startDate = currentProfile.subscription_start_date ? new Date(currentProfile.subscription_start_date) : null;
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      if (startDate && startDate > fiveMinutesAgo) {
        console.log('Subscription already updated recently, skipping');
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Subscription already active',
            plan: config.plan_name
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
        words_limit: config.words_limit
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment verification error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to verify payment' 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
