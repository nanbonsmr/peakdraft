import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Workflow,
  Globe,
  Hash,
  Image,
  ListTodo,
  PenTool,
  Share2,
  Mail,
  MessageSquare,
  Trash2,
  Copy,
  RefreshCw,
  Filter,
  Clock,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WorkflowHistoryItem {
  id: string;
  user_id: string;
  action_type: string;
  source_type: string;
  source_title: string | null;
  content_preview: string | null;
  result_preview: string | null;
  created_at: string;
}

const actionIcons: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  seo: { icon: Globe, color: "text-emerald-500", label: "SEO Metadata" },
  hashtags: { icon: Hash, color: "text-blue-500", label: "Hashtags" },
  image: { icon: Image, color: "text-purple-500", label: "Image Generation" },
  task: { icon: ListTodo, color: "text-amber-500", label: "Task Created" },
  blog: { icon: PenTool, color: "text-rose-500", label: "Blog Post" },
  social: { icon: Share2, color: "text-sky-500", label: "Social Post" },
  email: { icon: Mail, color: "text-orange-500", label: "Email" },
  chat: { icon: MessageSquare, color: "text-violet-500", label: "Chat" },
};

const sourceLabels: Record<string, string> = {
  blog: "Blog Generator",
  email: "Email Writer",
  social: "Social Media",
  ad: "Ad Copy",
  chat: "AI Chat",
  task: "Task Manager",
  general: "Template",
};

export default function WorkflowHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [history, setHistory] = useState<WorkflowHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase
        .from("workflow_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      const { data, error } = await query;
      if (error) throw error;
      setHistory((data as WorkflowHistoryItem[]) || []);
    } catch (err: any) {
      console.error("Error fetching workflow history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("workflow_history").delete().eq("id", id);
      if (error) throw error;
      setHistory((prev) => prev.filter((h) => h.id !== id));
      toast({ title: "Deleted", description: "Workflow action removed" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleCopyResult = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Result copied to clipboard" });
  };

  const filteredHistory = history.filter((item) => {
    if (filterAction !== "all" && item.action_type !== filterAction) return false;
    if (filterSource !== "all" && item.source_type !== filterSource) return false;
    return true;
  });

  // Stats
  const totalActions = history.length;
  const todayActions = history.filter(
    (h) => new Date(h.created_at).toDateString() === new Date().toDateString()
  ).length;
  const uniqueActionTypes = new Set(history.map((h) => h.action_type)).size;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Workflow className="h-5 w-5 text-white" />
          </div>
          Workflow History
        </h1>
        <p className="text-muted-foreground">
          Track all workflow actions across your tools and templates
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalActions}</p>
                <p className="text-xs text-muted-foreground">Total Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayActions}</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{uniqueActionTypes}</p>
                <p className="text-xs text-muted-foreground">Action Types Used</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filters:</span>
        </div>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Action type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="seo">SEO Metadata</SelectItem>
            <SelectItem value="hashtags">Hashtags</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="task">Task</SelectItem>
            <SelectItem value="blog">Blog</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="chat">Chat</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="blog">Blog Generator</SelectItem>
            <SelectItem value="email">Email Writer</SelectItem>
            <SelectItem value="social">Social Media</SelectItem>
            <SelectItem value="ad">Ad Copy</SelectItem>
            <SelectItem value="chat">AI Chat</SelectItem>
            <SelectItem value="task">Task Manager</SelectItem>
            <SelectItem value="general">Template</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={fetchHistory} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Actions</CardTitle>
          <CardDescription>
            {filteredHistory.length} action{filteredHistory.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <Workflow className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No workflow actions yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Use the Workflow button after generating content to start building your history
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredHistory.map((item, i) => {
                  const actionInfo = actionIcons[item.action_type] || {
                    icon: Workflow,
                    color: "text-muted-foreground",
                    label: item.action_type,
                  };
                  const ActionIcon = actionInfo.icon;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-start gap-3 p-4 rounded-xl border border-border/50 hover:border-border transition-colors group"
                    >
                      <div className="h-10 w-10 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                        <ActionIcon className={`h-5 w-5 ${actionInfo.color}`} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium">{actionInfo.label}</p>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {sourceLabels[item.source_type] || item.source_type}
                          </Badge>
                        </div>
                        {item.source_title && (
                          <p className="text-xs text-muted-foreground truncate">
                            "{item.source_title}"
                          </p>
                        )}
                        {item.result_preview && (
                          <div className="mt-2 bg-muted/30 rounded-lg p-2.5 border border-border/30">
                            <pre className="whitespace-pre-wrap text-xs font-sans text-muted-foreground line-clamp-3">
                              {item.result_preview}
                            </pre>
                          </div>
                        )}
                        <p className="text-[10px] text-muted-foreground/60">
                          {format(new Date(item.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {item.result_preview && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleCopyResult(item.result_preview!)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
