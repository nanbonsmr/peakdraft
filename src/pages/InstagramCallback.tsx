import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, AlertCircle, Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getInstagramRedirectUri } from "@/hooks/useInstagram";
import { Button } from "@/components/ui/button";

export default function InstagramCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("Connecting your Instagram account…");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");
    const errorDesc = params.get("error_description") || params.get("error_reason");
    const expectedState = sessionStorage.getItem("instagram_oauth_state");

    if (error) {
      setStatus("error");
      setMessage(errorDesc || error);
      return;
    }
    if (!code) {
      setStatus("error");
      setMessage("Missing authorization code.");
      return;
    }
    if (!expectedState || state !== expectedState) {
      setStatus("error");
      setMessage("State mismatch. Please try connecting again.");
      return;
    }

    (async () => {
      try {
        const { data, error: invErr } = await supabase.functions.invoke("instagram-oauth-callback", {
          body: { code, redirect_uri: getInstagramRedirectUri() },
        });
        if (invErr) throw invErr;
        if (data?.error) throw new Error(data.error);
        setStatus("ok");
        setMessage(`Connected as @${data.username || "your account"}`);
        sessionStorage.removeItem("instagram_oauth_state");
        const ret = sessionStorage.getItem("instagram_oauth_return") || "/app/instagram";
        sessionStorage.removeItem("instagram_oauth_return");
        setTimeout(() => navigate(ret), 1200);
      } catch (e: any) {
        setStatus("error");
        setMessage(e.message || "Failed to connect");
      }
    })();
  }, [params, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full rounded-2xl border border-border/50 bg-card p-8 text-center space-y-4">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center">
          <Instagram className="h-7 w-7 text-white" />
        </div>
        {status === "loading" && <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />}
        {status === "ok" && <CheckCircle2 className="h-6 w-6 mx-auto text-emerald-500" />}
        {status === "error" && <AlertCircle className="h-6 w-6 mx-auto text-destructive" />}
        <h1 className="text-lg font-semibold">Instagram</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
        {status === "error" && (
          <Button onClick={() => navigate("/app/instagram")}>Back to Instagram settings</Button>
        )}
      </div>
    </div>
  );
}
