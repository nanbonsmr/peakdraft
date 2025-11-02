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

    const payload = await req.json();
    console.log('Received FastSpring webhook:', JSON.stringify(payload, null, 2));

    // FastSpring sends different event types
    const eventType = payload.events?.[0]?.type || payload.type;
    
    console.log('Processing event type:', eventType);

    // Handle order completed event
    if (eventType === 'order.completed' || eventType === 'subscription.activated') {
      const order = payload.events?.[0]?.data || payload.data;
      const tags = order.tags || {};
      const userId = tags.user_id;
      const planId = tags.plan_id;

      if (!userId || !planId) {
        console.error('Missing user_id or plan_id in webhook tags');
        return new Response(
          JSON.stringify({ error: 'Missing required tags' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Map plan IDs to subscription details
      const planConfig: Record<string, { words_limit: number; plan_name: string }> = {
        'basic': { words_limit: 10000, plan_name: 'Basic' },
        'pro': { words_limit: 50000, plan_name: 'Pro' },
        'enterprise': { words_limit: -1, plan_name: 'Enterprise' }
      };

      const config = planConfig[planId];
      if (!config) {
        throw new Error(`Unknown plan ID: ${planId}`);
      }

      // Calculate subscription dates (30 days)
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
          subscription_start: subscriptionStart.toISOString(),
          subscription_end: subscriptionEnd.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }

      console.log(`Successfully updated subscription for user ${userId} to ${config.plan_name}`);
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
