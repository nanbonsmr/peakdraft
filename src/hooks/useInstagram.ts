import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Public — safe to ship in client code
export const META_APP_ID_FALLBACK = ""; // resolved at runtime via edge fn if blank
export const INSTAGRAM_SCOPES = [
  "instagram_basic",
  "instagram_content_publish",
  "pages_show_list",
  "pages_read_engagement",
  "business_management",
].join(",");

export function getInstagramRedirectUri() {
  return `${window.location.origin}/instagram/callback`;
}

// We resolve APP_ID from a non-secret env at runtime. Falls back to a build-time constant.
// Since META_APP_ID is server-only, we fetch it via the edge function on connect.
async function fetchAppId(): Promise<string> {
  const { data, error } = await supabase.functions.invoke("instagram-oauth-callback", {
    body: { action: "get_app_id" },
  });
  if (error || !data?.app_id) {
    // The callback function doesn't expose app_id; require manual ID instead.
    return "";
  }
  return data.app_id;
}

export function buildInstagramAuthUrl(appId: string, state: string) {
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: getInstagramRedirectUri(),
    state,
    response_type: "code",
    scope: INSTAGRAM_SCOPES,
  });
  return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
}

export interface InstagramConnection {
  id: string;
  ig_user_id: string;
  ig_username: string | null;
  page_id: string;
  page_name: string | null;
  expires_at: string;
  scope: string | null;
}

export function useInstagram() {
  const { user } = useAuth();
  const [connection, setConnection] = useState<InstagramConnection | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setConnection(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await (supabase as any)
      .from("instagram_connections")
      .select("id, ig_user_id, ig_username, page_id, page_name, expires_at, scope")
      .eq("user_id", user.id)
      .maybeSingle();
    setConnection(data || null);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const connect = useCallback(async (appId: string) => {
    if (!appId) throw new Error("Missing Meta App ID");
    const state = crypto.randomUUID();
    sessionStorage.setItem("instagram_oauth_state", state);
    sessionStorage.setItem("instagram_oauth_return", window.location.pathname);
    window.location.href = buildInstagramAuthUrl(appId, state);
  }, []);

  const disconnect = useCallback(async () => {
    if (!user) return;
    await (supabase as any).from("instagram_connections").delete().eq("user_id", user.id);
    setConnection(null);
  }, [user]);

  const isExpired = connection ? new Date(connection.expires_at).getTime() < Date.now() : false;
  const isConnected = !!connection && !isExpired;

  return { connection, loading, isConnected, isExpired, connect, disconnect, refresh };
}

export async function postToInstagram(args: {
  caption: string;
  image_url: string;
  schedule_for?: string | null;
  source?: string;
}) {
  const { data, error } = await supabase.functions.invoke("instagram-post", { body: args });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as { posted?: boolean; scheduled?: boolean; permalink?: string; post?: any };
}
