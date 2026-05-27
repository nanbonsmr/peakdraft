import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GRAPH = "https://graph.facebook.com/v21.0";

export async function publishToInstagram(args: {
  igUserId: string;
  pageAccessToken: string;
  caption: string;
  imageUrl: string;
}) {
  const { igUserId, pageAccessToken, caption, imageUrl } = args;

  // 1) Create media container
  const createRes = await fetch(`${GRAPH}/${igUserId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      image_url: imageUrl,
      caption,
      access_token: pageAccessToken,
    }),
  });
  const createJson = await createRes.json();
  if (!createRes.ok || !createJson.id) {
    throw new Error(`Container creation failed: ${JSON.stringify(createJson)}`);
  }
  const creationId = createJson.id as string;

  // 2) Poll until container is FINISHED (image download/processing)
  for (let i = 0; i < 12; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const st = await fetch(`${GRAPH}/${creationId}?fields=status_code&access_token=${pageAccessToken}`);
    const stJson = await st.json();
    if (stJson.status_code === "FINISHED") break;
    if (stJson.status_code === "ERROR") throw new Error(`Container errored: ${JSON.stringify(stJson)}`);
  }

  // 3) Publish
  const pubRes = await fetch(`${GRAPH}/${igUserId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      creation_id: creationId,
      access_token: pageAccessToken,
    }),
  });
  const pubJson = await pubRes.json();
  if (!pubRes.ok || !pubJson.id) {
    throw new Error(`Publish failed: ${JSON.stringify(pubJson)}`);
  }
  const mediaId = pubJson.id as string;

  // 4) Fetch permalink
  let permalink: string | null = null;
  try {
    const pl = await fetch(`${GRAPH}/${mediaId}?fields=permalink&access_token=${pageAccessToken}`);
    const plJson = await pl.json();
    permalink = plJson.permalink || null;
  } catch (_) {}

  return { mediaId, permalink };
}

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

    const { caption, image_url, schedule_for, source } = await req.json();
    if (!caption || typeof caption !== "string" || !caption.trim()) {
      return new Response(JSON.stringify({ error: "Missing caption" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!image_url || typeof image_url !== "string") {
      return new Response(JSON.stringify({ error: "Instagram requires an image URL" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (caption.length > 2200) {
      return new Response(JSON.stringify({ error: "Caption exceeds 2200 chars" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Schedule path
    if (schedule_for) {
      const when = new Date(schedule_for);
      if (isNaN(when.getTime()) || when.getTime() < Date.now() - 60_000) {
        return new Response(JSON.stringify({ error: "Invalid schedule date" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data, error } = await admin.from("instagram_posts").insert({
        user_id: user.id,
        caption,
        image_url,
        status: "pending",
        scheduled_for: when.toISOString(),
        source: source || null,
      }).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ scheduled: true, post: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Post now
    const { data: conn, error: connErr } = await admin
      .from("instagram_connections")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (connErr) throw connErr;
    if (!conn) {
      return new Response(JSON.stringify({ error: "Instagram not connected" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (new Date(conn.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ error: "Instagram token expired. Please reconnect." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { mediaId, permalink } = await publishToInstagram({
      igUserId: conn.ig_user_id,
      pageAccessToken: conn.page_access_token,
      caption,
      imageUrl: image_url,
    });

    const { data: row } = await admin.from("instagram_posts").insert({
      user_id: user.id,
      caption,
      image_url,
      status: "posted",
      posted_at: new Date().toISOString(),
      ig_media_id: mediaId,
      ig_permalink: permalink,
      source: source || null,
    }).select().single();

    return new Response(JSON.stringify({ posted: true, permalink, post: row }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("instagram-post error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
