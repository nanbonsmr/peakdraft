import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { publishToInstagram } from "../instagram-post/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: due, error } = await admin
      .from("instagram_posts")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .limit(25);
    if (error) throw error;

    const results: any[] = [];
    for (const post of due || []) {
      try {
        const { data: conn } = await admin
          .from("instagram_connections")
          .select("*")
          .eq("user_id", post.user_id)
          .maybeSingle();
        if (!conn) throw new Error("No Instagram connection");
        if (new Date(conn.expires_at).getTime() < Date.now()) {
          throw new Error("Instagram token expired");
        }
        if (!post.image_url) throw new Error("Missing image_url");

        const { mediaId, permalink } = await publishToInstagram({
          igUserId: conn.ig_user_id,
          pageAccessToken: conn.page_access_token,
          caption: post.caption,
          imageUrl: post.image_url,
        });
        await admin.from("instagram_posts").update({
          status: "posted",
          posted_at: new Date().toISOString(),
          ig_media_id: mediaId,
          ig_permalink: permalink,
          error: null,
        }).eq("id", post.id);
        results.push({ id: post.id, status: "posted" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown";
        await admin.from("instagram_posts").update({
          status: "failed",
          error: msg,
        }).eq("id", post.id);
        results.push({ id: post.id, status: "failed", error: msg });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("instagram-publish-due error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
