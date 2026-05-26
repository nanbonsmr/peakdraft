import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Linkedin, Loader2, Trash2, ExternalLink, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLinkedIn } from "@/hooks/useLinkedIn";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  text: string;
  image_url: string | null;
  status: string;
  scheduled_for: string | null;
  posted_at: string | null;
  linkedin_post_url: string | null;
  error: string | null;
  created_at: string;
  source: string | null;
}

export default function LinkedInPage() {
  const { connection, isConnected, isExpired, loading, connect, disconnect } = useLinkedIn();
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const fetchPosts = async () => {
    if (!user) return;
    setLoadingPosts(true);
    const { data } = await (supabase as any)
      .from("linkedin_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setPosts(data || []);
    setLoadingPosts(false);
  };

  useEffect(() => { fetchPosts(); }, [user]);

  const cancelScheduled = async (id: string) => {
    await (supabase as any).from("linkedin_posts").delete().eq("id", id);
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
      <Helmet><title>LinkedIn | PeakDraft</title></Helmet>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Linkedin className="h-6 w-6 text-[#0a66c2]" />
          LinkedIn
        </h1>
        <p className="text-sm text-muted-foreground">Connect your account and publish or schedule AI-generated posts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Authorize PeakDraft to post on your behalf.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : isConnected ? (
            <div className="flex items-center gap-4">
              {connection?.picture && <img src={connection.picture} alt="" className="h-12 w-12 rounded-full" />}
              <div className="flex-1">
                <p className="font-semibold">{connection?.name}</p>
                <p className="text-xs text-muted-foreground">{connection?.email}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Token valid until {new Date(connection!.expires_at).toLocaleDateString()}
                </p>
              </div>
              <Button variant="outline" onClick={disconnect}>Disconnect</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {isExpired && <p className="text-sm text-amber-500">Your access token expired. Reconnect to continue.</p>}
              <Button onClick={connect} className="bg-[#0a66c2] hover:bg-[#0a66c2]/90 text-white">
                <Linkedin className="h-4 w-4 mr-2" />
                Connect LinkedIn
              </Button>
              <p className="text-[11px] text-muted-foreground">
                You'll be redirected to LinkedIn to authorize <code>w_member_social</code> (post on your behalf), plus profile + email.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Posts</CardTitle>
          <CardDescription>Scheduled, posted, and failed LinkedIn posts.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPosts ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No posts yet. Generate content and click the LinkedIn button to publish.</p>
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
                    <p className="text-xs line-clamp-2">{p.text}</p>
                    {p.error && <p className="text-[10px] text-destructive mt-1">{p.error}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      {p.linkedin_post_url && (
                        <a href={p.linkedin_post_url} target="_blank" rel="noreferrer" className="text-[11px] text-[#0a66c2] inline-flex items-center gap-1 hover:underline">
                          <ExternalLink className="h-3 w-3" /> View on LinkedIn
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
