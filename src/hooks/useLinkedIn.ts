import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const LINKEDIN_CLIENT_ID = "786p5if4pz5764";
export const LINKEDIN_SCOPES = "openid profile email w_member_social";

export function getLinkedInRedirectUri() {
  return `${window.location.origin}/linkedin/callback`;
}

export function buildLinkedInAuthUrl(state: string) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: getLinkedInRedirectUri(),
    state,
    scope: LINKEDIN_SCOPES,
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

export interface LinkedInConnection {
  id: string;
  linkedin_user_id: string;
  name: string | null;
  email: string | null;
  picture: string | null;
  expires_at: string;
  scope: string | null;
}

export function useLinkedIn() {
  const { user } = useAuth();
  const [connection, setConnection] = useState<LinkedInConnection | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setConnection(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await (supabase as any)
      .from("linkedin_connections")
      .select("id, linkedin_user_id, name, email, picture, expires_at, scope")
      .eq("user_id", user.id)
      .maybeSingle();
    setConnection(data || null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const connect = useCallback(() => {
    const state = crypto.randomUUID();
    sessionStorage.setItem("linkedin_oauth_state", state);
    sessionStorage.setItem("linkedin_oauth_return", window.location.pathname);
    window.location.href = buildLinkedInAuthUrl(state);
  }, []);

  const disconnect = useCallback(async () => {
    if (!user) return;
    await (supabase as any).from("linkedin_connections").delete().eq("user_id", user.id);
    setConnection(null);
  }, [user]);

  const isExpired = connection ? new Date(connection.expires_at).getTime() < Date.now() : false;
  const isConnected = !!connection && !isExpired;

  return { connection, loading, isConnected, isExpired, connect, disconnect, refresh };
}

export async function postToLinkedIn(args: {
  text: string;
  image_url?: string | null;
  schedule_for?: string | null;
  source?: string;
}) {
  const { data, error } = await supabase.functions.invoke("linkedin-post", { body: args });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as { posted?: boolean; scheduled?: boolean; postUrl?: string; post?: any };
}
