import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GRAPH = "https://graph.facebook.com/v21.0";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { code, redirect_uri } = await req.json();
    if (!code || !redirect_uri) {
      return new Response(JSON.stringify({ error: "Missing code or redirect_uri" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const appId = Deno.env.get("META_APP_ID")!;
    const appSecret = Deno.env.get("META_APP_SECRET")!;

    // 1) Exchange code → short-lived user token
    const tokenUrl = `${GRAPH}/oauth/access_token?` + new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri,
      code,
    }).toString();
    const tokenRes = await fetch(tokenUrl);
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("Token exchange failed:", tokenJson);
      return new Response(JSON.stringify({ error: "Token exchange failed", details: tokenJson }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const shortToken = tokenJson.access_token as string;

    // 2) Exchange short → long-lived user token (~60 days)
    const llRes = await fetch(`${GRAPH}/oauth/access_token?` + new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortToken,
    }).toString());
    const llJson = await llRes.json();
    if (!llRes.ok) {
      console.error("Long-lived exchange failed:", llJson);
      return new Response(JSON.stringify({ error: "Long-lived token exchange failed", details: llJson }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userAccessToken = llJson.access_token as string;
    const expiresIn = (llJson.expires_in as number) || 60 * 24 * 3600;

    // 3) Fetch user's Facebook Pages
    const pagesRes = await fetch(`${GRAPH}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${userAccessToken}`);
    const pagesJson = await pagesRes.json();
    if (!pagesRes.ok) {
      console.error("Pages fetch failed:", pagesJson);
      return new Response(JSON.stringify({ error: "Failed to fetch Facebook Pages", details: pagesJson }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pages = (pagesJson.data || []) as Array<any>;
    const pageWithIG = pages.find((p) => p.instagram_business_account?.id);
    if (!pageWithIG) {
      return new Response(JSON.stringify({
        error: "No Instagram Business account found. Connect an Instagram Business or Creator account to one of your Facebook Pages, then try again.",
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const igUserId = pageWithIG.instagram_business_account.id as string;
    const pageId = pageWithIG.id as string;
    const pageName = pageWithIG.name as string;
    const pageAccessToken = pageWithIG.access_token as string;

    // 4) Fetch IG username for display
    const igRes = await fetch(`${GRAPH}/${igUserId}?fields=username,profile_picture_url&access_token=${pageAccessToken}`);
    const igJson = await igRes.json();
    const igUsername = igJson?.username || null;

    const admin = createClient(supabaseUrl, serviceKey);
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    const { error: upsertErr } = await admin
      .from("instagram_connections")
      .upsert({
        user_id: user.id,
        ig_user_id: igUserId,
        ig_username: igUsername,
        page_id: pageId,
        page_name: pageName,
        page_access_token: pageAccessToken,
        user_access_token: userAccessToken,
        expires_at: expiresAt,
        scope: "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,business_management",
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (upsertErr) throw upsertErr;

    return new Response(JSON.stringify({
      success: true,
      username: igUsername,
      page_name: pageName,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("instagram-oauth-callback error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
