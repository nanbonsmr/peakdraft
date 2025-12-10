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
