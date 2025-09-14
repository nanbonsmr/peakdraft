import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, planId, paymentDetails, provider } = await req.json();

    console.log('Processing payment:', { userId, planId, provider });

    // Verify payment with PayPal (in production, you'd verify with PayPal API)
    if (!paymentDetails || !paymentDetails.id) {
      throw new Error('Invalid payment details');
    }

    // Plan configurations
    const planConfigs = {
      basic: { words_limit: 10000, subscription_plan: 'basic' },
      pro: { words_limit: 50000, subscription_plan: 'pro' },
      enterprise: { words_limit: 200000, subscription_plan: 'enterprise' }
    };

    const config = planConfigs[planId as keyof typeof planConfigs];
    if (!config) {
      throw new Error('Invalid plan ID');
    }

    // Calculate subscription dates
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);

    // Update user profile with new subscription
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        subscription_plan: config.subscription_plan,
        words_limit: config.words_limit,
        words_used: 0, // Reset usage on new subscription
        subscription_start_date: now.toISOString(),
        subscription_end_date: endDate.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw new Error('Failed to update subscription');
    }

    // Log the payment transaction (optional - you could create a payments table)
    console.log('Payment processed successfully:', {
      userId,
      planId,
      paymentId: paymentDetails.id,
      provider,
      timestamp: now.toISOString()
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment processed successfully',
        subscription: {
          plan: config.subscription_plan,
          words_limit: config.words_limit,
          start_date: now.toISOString(),
          end_date: endDate.toISOString()
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Payment processing error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Payment processing failed' 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});