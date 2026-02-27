import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Create admin client with service role for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the JWT token from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate the token explicitly
    const token = authHeader.replace('Bearer ', '');
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.log('Invalid or expired token:', claimsError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    const userEmail = claimsData.claims.email;

    console.log(`Admin operation requested by verified user: ${userId} (${userEmail})`);

    // Server-side admin verification using the database role
    const { data: adminRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError) {
      console.error('Error checking admin role:', roleError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify admin status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!adminRole) {
      console.log(`Access denied - user ${userId} is not an admin`);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get request body for the action
    const { action, data } = await req.json();
    
    console.log(`Admin operation: ${action} by admin: ${userId}`);

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

      // Pinned Templates operations
      case 'get-pinned-templates': {
        const { data: pinnedTemplates, error } = await supabaseAdmin
          .from('pinned_templates')
          .select('*')
          .order('pinned_at', { ascending: false });

        if (error) {
          console.error('Error fetching pinned templates:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch pinned templates' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ pinnedTemplates }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'pin-template': {
        const { templateId } = data;
        
        if (!templateId) {
          return new Response(
            JSON.stringify({ error: 'Template ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabaseAdmin
          .from('pinned_templates')
          .insert({
            template_id: templateId,
            pinned_by: userId
          });

        if (error) {
          // Check if already pinned
          if (error.code === '23505') {
            return new Response(
              JSON.stringify({ error: 'Template is already pinned' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          console.error('Error pinning template:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to pin template' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Template pinned: ${templateId}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'unpin-template': {
        const { templateId } = data;
        
        if (!templateId) {
          return new Response(
            JSON.stringify({ error: 'Template ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabaseAdmin
          .from('pinned_templates')
          .delete()
          .eq('template_id', templateId);

        if (error) {
          console.error('Error unpinning template:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to unpin template' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Template unpinned: ${templateId}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Promotion operations
      case 'get-promotions': {
        const { data: promotions, error } = await supabaseAdmin
          .from('promotions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching promotions:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch promotions' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ promotions }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create-promotion': {
        const { title, message, button_text, button_link, image_url, show_on_landing, show_on_dashboard, target_users, start_date, end_date } = data;
        
        if (!title || !message) {
          return new Response(
            JSON.stringify({ error: 'Title and message are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: promotion, error } = await supabaseAdmin
          .from('promotions')
          .insert({
            title,
            message,
            button_text: button_text || 'Learn More',
            button_link,
            image_url,
            show_on_landing: show_on_landing ?? true,
            show_on_dashboard: show_on_dashboard ?? true,
            target_users: target_users || 'free',
            start_date,
            end_date,
            is_active: false
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating promotion:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to create promotion' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Promotion created: ${promotion.id}`);
        return new Response(
          JSON.stringify({ success: true, promotion }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update-promotion': {
        const { promotionId, updates } = data;
        
        if (!promotionId) {
          return new Response(
            JSON.stringify({ error: 'Promotion ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabaseAdmin
          .from('promotions')
          .update(updates)
          .eq('id', promotionId);

        if (error) {
          console.error('Error updating promotion:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to update promotion' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Promotion updated: ${promotionId}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'toggle-promotion': {
        const { promotionId, isActive } = data;
        
        const { error } = await supabaseAdmin
          .from('promotions')
          .update({ is_active: !isActive })
          .eq('id', promotionId);

        if (error) {
          console.error('Error toggling promotion:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to toggle promotion' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Promotion toggled: ${promotionId}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete-promotion': {
        const { promotionId } = data;
        
        const { error } = await supabaseAdmin
          .from('promotions')
          .delete()
          .eq('id', promotionId);

        if (error) {
          console.error('Error deleting promotion:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to delete promotion' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Promotion deleted: ${promotionId}`);
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
