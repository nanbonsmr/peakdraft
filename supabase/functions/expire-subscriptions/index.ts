import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting subscription expiration check...')

    // Get all profiles with expired subscriptions
    const { data: expiredProfiles, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .not('subscription_end_date', 'is', null)
      .lt('subscription_end_date', new Date().toISOString())
      .neq('subscription_plan', 'free')

    if (fetchError) {
      console.error('Error fetching expired profiles:', fetchError)
      throw fetchError
    }

    console.log(`Found ${expiredProfiles?.length || 0} expired subscriptions`)

    if (!expiredProfiles || expiredProfiles.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No expired subscriptions found',
          processed: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Update expired profiles to free plan
    const expiredUserIds = expiredProfiles.map(profile => profile.id)
    
    const { data: updatedProfiles, error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_plan: 'free',
        subscription_start_date: null,
        subscription_end_date: null,
        words_limit: 500, // Reset to free plan limit
        updated_at: new Date().toISOString()
      })
      .in('id', expiredUserIds)
      .select()

    if (updateError) {
      console.error('Error updating expired profiles:', updateError)
      throw updateError
    }

    console.log(`Successfully downgraded ${updatedProfiles?.length || 0} users to free plan`)

    // Log the downgraded users for monitoring
    expiredProfiles.forEach(profile => {
      console.log(`Downgraded user ${profile.user_id} from ${profile.subscription_plan} to free plan. Expired on: ${profile.subscription_end_date}`)
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed ${updatedProfiles?.length || 0} expired subscriptions`,
        processed: updatedProfiles?.length || 0,
        downgraded_users: updatedProfiles?.map(p => ({ 
          user_id: p.user_id, 
          previous_plan: expiredProfiles.find(ep => ep.id === p.id)?.subscription_plan,
          expired_date: expiredProfiles.find(ep => ep.id === p.id)?.subscription_end_date
        }))
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Subscription expiration error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to process subscription expirations' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})