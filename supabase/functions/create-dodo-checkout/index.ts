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

    const { planId, userId, userEmail } = await req.json();

    console.log('Creating Dodo Payments checkout:', { 
      planId, 
      userId,
      userEmail,
      timestamp: new Date().toISOString()
    });

    if (!userId || !planId) {
      throw new Error('Missing required fields');
    }

    const dodoApiKey = Deno.env.get('DODO_PAYMENTS_API_KEY');
    
    if (!dodoApiKey) {
      throw new Error('Dodo Payments API key not configured');
    }

    // Get user profile from the profiles table (since we use Clerk, not Supabase Auth)
    let email = userEmail;
    let displayName = 'Customer';
    
    if (!email) {
      const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .select('display_name')
        .eq('user_id', userId)
        .single();
      
      if (profileData) {
        displayName = profileData.display_name || 'Customer';
      }
    }

    if (!email) {
      throw new Error('User email is required for checkout');
    }

    // Map plan IDs to Dodo product IDs
    const productMap: Record<string, string> = {
      'basic': Deno.env.get('DODO_BASIC_PRODUCT_ID') || '',
      'pro': Deno.env.get('DODO_PRO_PRODUCT_ID') || '',
      'enterprise': Deno.env.get('DODO_ENTERPRISE_PRODUCT_ID') || ''
    };

    const productId = productMap[planId];
    if (!productId) {
      throw new Error(`Invalid plan ID: ${planId}`);
    }

    // Use test mode URL (change to live.dodopayments.com when ready for production)
    const baseUrl = 'https://test.dodopayments.com';

    // Create checkout session with Dodo Payments API
    const checkoutResponse = await fetch(`${baseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dodoApiKey}`,
      },
      body: JSON.stringify({
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: { 
          email: email,
          name: displayName
        },
        return_url: `${req.headers.get('origin') || 'https://peakdraftapp.netlify.app'}/app?payment=success`,
        metadata: {
          user_id: userId,
          plan_id: planId
        }
      }),
    });

    if (!checkoutResponse.ok) {
      const errorData = await checkoutResponse.text();
      console.error('Dodo Payments API error:', errorData);
      throw new Error(`Failed to create checkout session: ${errorData}`);
    }

    const checkoutData = await checkoutResponse.json();
    console.log('Checkout session created:', checkoutData);

    return new Response(
      JSON.stringify({ 
        success: true,
        checkoutUrl: checkoutData.checkout_url,
        sessionId: checkoutData.id
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Checkout creation error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to create checkout' 
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
