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

    // Map plan IDs to Dodo product IDs and expected prices (in cents)
    const planConfig: Record<string, { productId: string; minPrice: number; planName: string }> = {
      'basic': { 
        productId: Deno.env.get('DODO_BASIC_PRODUCT_ID') || '', 
        minPrice: 100, // $1 minimum 
        planName: 'Basic'
      },
      'pro': { 
        productId: Deno.env.get('DODO_PRO_PRODUCT_ID') || '', 
        minPrice: 100, // $1 minimum
        planName: 'Pro'
      },
      'enterprise': { 
        productId: Deno.env.get('DODO_ENTERPRISE_PRODUCT_ID') || '', 
        minPrice: 100, // $1 minimum
        planName: 'Enterprise'
      }
    };

    const config = planConfig[planId];
    if (!config || !config.productId) {
      throw new Error(`Invalid plan ID or missing product configuration: ${planId}`);
    }

    // Use live/production mode
    const baseUrl = 'https://live.dodopayments.com';

    // Verify the product exists and has a valid price before creating checkout
    console.log('Verifying product configuration for:', config.productId);
    const productResponse = await fetch(`${baseUrl}/products/${config.productId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${dodoApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!productResponse.ok) {
      const productError = await productResponse.text();
      console.error('Failed to verify product:', productError);
      throw new Error(`Product configuration error: Unable to verify ${config.planName} plan. Please contact support.`);
    }

    const productData = await productResponse.json();
    console.log('Product data:', JSON.stringify(productData, null, 2));

    // Validate product has a valid price
    const productPrice = productData.price?.amount || productData.price || 0;
    console.log('Product price:', productPrice, 'Minimum required:', config.minPrice);

    if (productPrice < config.minPrice) {
      console.error('Product price too low or not configured:', productPrice);
      throw new Error(`Price configuration error: ${config.planName} plan price is not properly configured. Please contact support.`);
    }

    const origin = req.headers.get('origin') || 'https://peakdraftapp.netlify.app';
    
    // Create checkout session with Dodo Payments API
    // return_url is ONLY used after successful payment
    // For cancelled/failed payments, user stays on Dodo or goes to cancel_url
    const checkoutResponse = await fetch(`${baseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dodoApiKey}`,
      },
      body: JSON.stringify({
        product_cart: [{ product_id: config.productId, quantity: 1 }],
        customer: { 
          email: email,
          name: displayName
        },
        payment_link: false,
        success_url: `${origin}/app?payment=success&plan=${planId}&uid=${userId}`,
        return_url: `${origin}/app?payment=success&plan=${planId}&uid=${userId}`,
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

    // Validate checkout amount is greater than 0
    const checkoutAmount = checkoutData.total_amount || checkoutData.amount || 0;
    if (checkoutAmount <= 0) {
      console.error('Checkout created with zero amount:', checkoutAmount);
      throw new Error('Payment configuration error: Invalid checkout amount. Please contact support.');
    }

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
