import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Admin emails - server-side verification
const ADMIN_EMAILS = ['nanbondev@gmail.com'];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get request body
    const { action, userId, userEmail, data } = await req.json();
    
    console.log(`Admin operation requested: ${action} by user: ${userId}`);
    
    // Server-side admin verification
    if (!userEmail || !ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
      console.log(`Access denied for email: ${userEmail}`);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ensure admin role exists in database
    const { data: existingRole } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (!existingRole) {
      // Auto-create admin role for verified admin email
      await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' });
      console.log(`Admin role created for user: ${userId}`);
    }

    // Handle different admin operations
    switch (action) {
      case 'check-admin': {
        return new Response(
          JSON.stringify({ isAdmin: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create-notification': {
        const { title, message, type, target_users } = data;
        
        if (!title || !message) {
          return new Response(
            JSON.stringify({ error: 'Title and message are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: notification, error } = await supabaseAdmin
          .from('notifications')
          .insert({
            title,
            message,
            type: type || 'info',
            target_users: target_users || 'all',
            is_active: true
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating notification:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to create notification' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Notification created: ${notification.id}`);
        return new Response(
          JSON.stringify({ success: true, notification }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get-notifications': {
        const { data: notifications, error } = await supabaseAdmin
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching notifications:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch notifications' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ notifications }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'toggle-notification': {
        const { notificationId, isActive } = data;
        
        const { error } = await supabaseAdmin
          .from('notifications')
          .update({ is_active: !isActive })
          .eq('id', notificationId);

        if (error) {
          console.error('Error toggling notification:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to toggle notification' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Notification toggled: ${notificationId}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete-notification': {
        const { notificationId } = data;
        
        const { error } = await supabaseAdmin
          .from('notifications')
          .delete()
          .eq('id', notificationId);

        if (error) {
          console.error('Error deleting notification:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to delete notification' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Notification deleted: ${notificationId}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // User management actions
      case 'get-users': {
        // Get all profiles with their subscription info
        const { data: profiles, error: profilesError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch users' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get user roles
        const { data: roles, error: rolesError } = await supabaseAdmin
          .from('user_roles')
          .select('user_id, role');

        if (rolesError) {
          console.error('Error fetching roles:', rolesError);
        }

        // Combine profiles with roles
        const usersWithRoles = profiles?.map(profile => {
          const userRole = roles?.find(r => r.user_id === profile.user_id);
          return {
            ...profile,
            role: userRole?.role || 'user'
          };
        }) || [];

        return new Response(
          JSON.stringify({ users: usersWithRoles }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get-user-stats': {
        // Get subscription stats
        const { data: profiles, error } = await supabaseAdmin
          .from('profiles')
          .select('subscription_plan, words_used, words_limit');

        if (error) {
          console.error('Error fetching user stats:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch user stats' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const totalUsers = profiles?.length || 0;
        const freeUsers = profiles?.filter(p => p.subscription_plan === 'free').length || 0;
        const basicUsers = profiles?.filter(p => p.subscription_plan === 'basic').length || 0;
        const proUsers = profiles?.filter(p => p.subscription_plan === 'pro').length || 0;
        const enterpriseUsers = profiles?.filter(p => p.subscription_plan === 'enterprise').length || 0;
        const totalWordsUsed = profiles?.reduce((sum, p) => sum + (p.words_used || 0), 0) || 0;

        return new Response(
          JSON.stringify({
            stats: {
              totalUsers,
              freeUsers,
              basicUsers,
              proUsers,
              enterpriseUsers,
              premiumUsers: basicUsers + proUsers + enterpriseUsers,
              totalWordsUsed
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update-user-plan': {
        const { targetUserId, newPlan, wordsLimit } = data;

        const planLimits: Record<string, number> = {
          'free': 500,
          'basic': 50000,
          'pro': 150000,
          'enterprise': 500000
        };

        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_plan: newPlan,
            words_limit: wordsLimit || planLimits[newPlan] || 500,
            subscription_start_date: newPlan !== 'free' ? new Date().toISOString() : null,
            subscription_end_date: newPlan !== 'free' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
          })
          .eq('user_id', targetUserId);

        if (error) {
          console.error('Error updating user plan:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to update user plan' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`User plan updated: ${targetUserId} -> ${newPlan}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'reset-user-words': {
        const { targetUserId } = data;

        const { error } = await supabaseAdmin
          .from('profiles')
          .update({ words_used: 0 })
          .eq('user_id', targetUserId);

        if (error) {
          console.error('Error resetting user words:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to reset user words' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`User words reset: ${targetUserId}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'toggle-user-role': {
        const { targetUserId, makeAdmin } = data;

        if (makeAdmin) {
          // Add admin role
          const { error } = await supabaseAdmin
            .from('user_roles')
            .upsert({ user_id: targetUserId, role: 'admin' }, { onConflict: 'user_id,role' });

          if (error) {
            console.error('Error adding admin role:', error);
            return new Response(
              JSON.stringify({ error: 'Failed to update user role' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else {
          // Remove admin role
          const { error } = await supabaseAdmin
            .from('user_roles')
            .delete()
            .eq('user_id', targetUserId)
            .eq('role', 'admin');

          if (error) {
            console.error('Error removing admin role:', error);
            return new Response(
              JSON.stringify({ error: 'Failed to update user role' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        console.log(`User role updated: ${targetUserId} -> ${makeAdmin ? 'admin' : 'user'}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Admin operation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
