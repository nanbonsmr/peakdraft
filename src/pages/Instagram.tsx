import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Instagram, Loader2, Trash2, ExternalLink, CheckCircle2, Clock, XCircle, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useInstagram } from "@/hooks/useInstagram";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  caption: string;
  image_url: string | null;
  status: string;
  scheduled_for: string | null;
  posted_at: string | null;
  ig_permalink: string | null;
  error: string | null;
  created_at: string;
  source: string | null;
}

export default function InstagramPage() {
  const { connection, isConnected, isExpired, loading, connect, disconnect } = useInstagram();
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const fetchPosts = async () => {
    if (!user) return;
    setLoadingPosts(true);
    const { data } = await (supabase as any)
      .from("instagram_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setPosts(data || []);
    setLoadingPosts(false);
  };

  useEffect(() => { fetchPosts(); }, [user]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("instagram-oauth-callback", {
        body: { action: "get_app_id" },
      });
      if (error || !data?.app_id) throw new Error("Meta App ID not configured");
      await connect(data.app_id);
    } catch (e: any) {
      toast({ title: "Connection failed", description: e.message, variant: "destructive" });
      setConnecting(false);
    }
  };

  const cancelScheduled = async (id: string) => {
    await (supabase as any).from("instagram_posts").delete().eq("id", id);
    setPosts((p) => p.filter((x) => x.id !== id));
    toast({ title: "Removed" });
  };

  const statusBadge = (s: string) => {
    if (s === "posted") return <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Posted</Badge>;
    if (s === "pending") return <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/20"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Helmet><title>Instagram | PeakDraft</title></Helmet>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Instagram className="h-6 w-6 text-[#e1306c]" />
          Instagram
        </h1>
        <p className="text-sm text-muted-foreground">Publish or schedule AI-generated images + captions to your Instagram Business account.</p>
      </div>

      <Card className="bg-amber-500/5 border-amber-500/20">
        <CardContent className="flex gap-3 pt-6">
          <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong className="text-foreground">Requires an Instagram Business or Creator account</strong> linked to a Facebook Page.</p>
            <p>Personal Instagram accounts cannot post via API. Convert your IG account in the IG app: Settings → Account → Switch to Professional account.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Authorize PeakDraft to post on your behalf via Meta.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : isConnected ? (
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center">
                <Instagram className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">@{connection?.ig_username || "your account"}</p>
                <p className="text-xs text-muted-foreground">Page: {connection?.page_name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Token valid until {new Date(connection!.expires_at).toLocaleDateString()}
                </p>
              </div>
              <Button variant="outline" onClick={disconnect}>Disconnect</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {isExpired && <p className="text-sm text-amber-500">Your access token expired. Reconnect to continue.</p>}
              <Button
                onClick={handleConnect}
                disabled={connecting}
                className="bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90 text-white border-0"
              >
                {connecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Instagram className="h-4 w-4 mr-2" />}
                Connect Instagram
              </Button>
              <p className="text-[11px] text-muted-foreground">
                Redirects to Facebook to authorize <code>instagram_content_publish</code> on the IG Business account linked to your Page.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Posts</CardTitle>
          <CardDescription>Scheduled, posted, and failed Instagram posts.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPosts ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No posts yet. Generate an image and click the Instagram button to publish.</p>
          ) : (
            <div className="space-y-3">
              {posts.map((p) => (
                <div key={p.id} className="rounded-lg border border-border/50 p-3 flex gap-3">
                  {p.image_url && <img src={p.image_url} alt="" className="h-16 w-16 rounded object-cover shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {statusBadge(p.status)}
                      {p.source && <Badge variant="outline" className="text-[10px]">{p.source}</Badge>}
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {p.posted_at
                          ? `Posted ${new Date(p.posted_at).toLocaleString()}`
                          : p.scheduled_for
                          ? `Scheduled ${new Date(p.scheduled_for).toLocaleString()}`
                          : new Date(p.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs line-clamp-2">{p.caption}</p>
                    {p.error && <p className="text-[10px] text-destructive mt-1">{p.error}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      {p.ig_permalink && (
                        <a href={p.ig_permalink} target="_blank" rel="noreferrer" className="text-[11px] text-[#e1306c] inline-flex items-center gap-1 hover:underline">
                          <ExternalLink className="h-3 w-3" /> View on Instagram
                        </a>
                      )}
                      {p.status === "pending" && (
                        <button onClick={() => cancelScheduled(p.id)} className="text-[11px] text-destructive inline-flex items-center gap-1 hover:underline">
                          <Trash2 className="h-3 w-3" /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
