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

    const { planId, userId } = await req.json();

    console.log('Creating FastSpring session:', { 
      planId, 
      userId,
      timestamp: new Date().toISOString()
    });

    if (!userId || !planId) {
      throw new Error('Missing required fields');
    }

    const username = Deno.env.get('FASTSPRING_API_USERNAME');
    const password = Deno.env.get('FASTSPRING_API_PASSWORD');
    
    if (!username || !password) {
      throw new Error('FastSpring API credentials not configured');
    }

    // Get user email from Supabase
    const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(userId);
    
    if (userError || !userData) {
      throw new Error('Failed to get user data');
    }

    // Map plan IDs to FastSpring product paths
    const productMap: Record<string, string> = {
      'basic': 'basic',
      'pro': 'pro',
      'enterprise': 'enterprise'
    };

    const productPath = productMap[planId];
    if (!productPath) {
      throw new Error(`Invalid plan ID: ${planId}`);
    }

    // Create session payload
    const sessionPayload = {
      items: [{
        product: productPath,
        quantity: 1
      }],
      tags: {
        user_id: userId,
        plan_id: planId
      }
    };

    // Create a session using FastSpring Sessions API
    const authHeader = 'Basic ' + btoa(`${username}:${password}`);
    const fastspringResponse = await fetch('https://api.fastspring.com/sessions', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sessionPayload)
    });

    if (!fastspringResponse.ok) {
      const errorData = await fastspringResponse.text();
      console.error('FastSpring API error:', errorData);
      throw new Error(`FastSpring Error: ${errorData}`);
    }

    const sessionData = await fastspringResponse.json();
    console.log('FastSpring session created:', sessionData);

    return new Response(
      JSON.stringify({ 
        success: true,
        sessionId: sessionData.id,
        productPath
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Session creation error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to create session' 
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
