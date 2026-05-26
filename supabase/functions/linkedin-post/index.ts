import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Publish a UGC post on LinkedIn. Used both by direct user posting and by the cron publisher.
export async function publishToLinkedIn(args: {
  accessToken: string;
  authorUrn: string; // urn:li:person:{id}
  text: string;
  imageUrl?: string | null;
}) {
  const { accessToken, authorUrn, text, imageUrl } = args;

  let media: Array<{ status: string; media: string }> | undefined;

  if (imageUrl) {
    // 1) Register upload
    const regRes = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
          owner: authorUrn,
          serviceRelationships: [
            { relationshipType: "OWNER", identifier: "urn:li:userGeneratedContent" },
          ],
        },
      }),
    });
    const regJson = await regRes.json();
    if (!regRes.ok) throw new Error(`registerUpload failed: ${JSON.stringify(regJson)}`);

    const uploadUrl =
      regJson.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]
        .uploadUrl;
    const asset = regJson.value.asset as string;

    // 2) Download image bytes
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error(`Failed to fetch image: ${imgRes.status}`);
    const imgBytes = new Uint8Array(await imgRes.arrayBuffer());

    // 3) Upload bytes
    const upRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: imgBytes,
    });
    if (!upRes.ok) {
      const errTxt = await upRes.text();
      throw new Error(`Image upload failed: ${upRes.status} ${errTxt}`);
    }
    media = [{ status: "READY", media: asset }];
  }

  // Create UGC post
  const body = {
    author: authorUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text },
        shareMediaCategory: media ? "IMAGE" : "NONE",
        ...(media ? { media } : {}),
      },
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
  };

  const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });
  const postJson = await postRes.json().catch(() => ({}));
  if (!postRes.ok) throw new Error(`ugcPosts failed: ${postRes.status} ${JSON.stringify(postJson)}`);
  const postId = (postJson.id as string) || postRes.headers.get("x-restli-id") || "";
  return {
    postId,
    postUrl: postId ? `https://www.linkedin.com/feed/update/${postId}/` : null,
  };
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

    const { text, image_url, schedule_for, source } = await req.json();
    if (!text || typeof text !== "string" || !text.trim()) {
      return new Response(JSON.stringify({ error: "Missing text" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (text.length > 3000) {
      return new Response(JSON.stringify({ error: "Text exceeds 3000 chars" }), {
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
      const { data, error } = await admin.from("linkedin_posts").insert({
        user_id: user.id,
        text,
        image_url: image_url || null,
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
      .from("linkedin_connections")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (connErr) throw connErr;
    if (!conn) {
      return new Response(JSON.stringify({ error: "LinkedIn not connected" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (new Date(conn.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ error: "LinkedIn token expired. Please reconnect." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { postId, postUrl } = await publishToLinkedIn({
      accessToken: conn.access_token,
      authorUrn: `urn:li:person:${conn.linkedin_user_id}`,
      text,
      imageUrl: image_url || null,
    });

    const { data: row } = await admin.from("linkedin_posts").insert({
      user_id: user.id,
      text,
      image_url: image_url || null,
      status: "posted",
      posted_at: new Date().toISOString(),
      linkedin_post_id: postId,
      linkedin_post_url: postUrl,
      source: source || null,
    }).select().single();

    return new Response(JSON.stringify({ posted: true, postUrl, post: row }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("linkedin-post error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
