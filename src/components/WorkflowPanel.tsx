import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  Workflow,
  Hash,
  Image,
  Globe,
  ListTodo,
  PenTool,
  Share2,
  Mail,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Loader2,
  X,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type WorkflowContext = {
  content: string;
  title?: string;
  type: "blog" | "email" | "social" | "ad" | "chat" | "general" | "task";
  keywords?: string[];
};

interface WorkflowPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: WorkflowContext | null;
}

type ActionId = "seo" | "hashtags" | "image" | "task" | "blog" | "social" | "email" | "chat";

interface WorkflowAction {
  id: ActionId;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const ALL_ACTIONS: WorkflowAction[] = [
  { id: "seo", label: "Generate SEO Metadata", description: "Create meta title, description & keywords", icon: Globe, color: "text-emerald-500" },
  { id: "hashtags", label: "Generate Hashtags", description: "Create relevant social media hashtags", icon: Hash, color: "text-blue-500" },
  { id: "image", label: "Generate Image", description: "Create a featured image with AI", icon: Image, color: "text-purple-500" },
  { id: "task", label: "Add to Tasks", description: "Create a task to track this content", icon: ListTodo, color: "text-amber-500" },
  { id: "blog", label: "Create Blog Post", description: "Turn this content into a blog post", icon: PenTool, color: "text-rose-500" },
  { id: "social", label: "Create Social Post", description: "Adapt content for social media", icon: Share2, color: "text-sky-500" },
  { id: "email", label: "Create Email", description: "Turn this into an email newsletter", icon: Mail, color: "text-orange-500" },
  { id: "chat", label: "Discuss in Chat", description: "Continue improving in AI Chat", icon: MessageSquare, color: "text-violet-500" },
];

function getRelevantActions(type: WorkflowContext["type"]): ActionId[] {
  switch (type) {
    case "blog":
      return ["seo", "hashtags", "image", "social", "task", "chat"];
    case "email":
      return ["task", "social", "blog", "chat"];
    case "social":
      return ["hashtags", "image", "blog", "task", "chat"];
    case "ad":
      return ["image", "social", "hashtags", "task", "chat"];
    case "chat":
      return ["task", "blog", "social", "email", "image", "hashtags"];
    case "task":
      return ["blog", "social", "email", "chat", "image"];
    default:
      return ["seo", "hashtags", "image", "task", "blog", "social", "chat"];
  }
}

export function WorkflowPanel({ open, onOpenChange, context }: WorkflowPanelProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeAction, setActiveAction] = useState<ActionId | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [completedActions, setCompletedActions] = useState<Set<ActionId>>(new Set());

  if (!context) return null;

  const relevantActionIds = getRelevantActions(context.type);
  const actions = ALL_ACTIONS.filter((a) => relevantActionIds.includes(a.id));

  const handleAction = async (actionId: ActionId) => {
    if (actionId === "chat") {
      onOpenChange(false);
      navigate("/app/chat");
      return;
    }

    if (actionId === "image") {
      onOpenChange(false);
      navigate("/app/image-generation");
      return;
    }

    if (actionId === "blog") {
      onOpenChange(false);
      navigate("/app/editor", {
        state: {
          content: context.content,
          title: context.title || "Untitled",
          templateType: context.type,
        },
      });
      return;
    }

    if (actionId === "social") {
      onOpenChange(false);
      navigate("/app/templates", { state: { openTemplate: "social-media" } });
      return;
    }

    if (actionId === "email") {
      onOpenChange(false);
      navigate("/app/templates", { state: { openTemplate: "email" } });
      return;
    }

    if (actionId === "task") {
      setActiveAction("task");
      setTaskTitle(context.title || context.content.slice(0, 60));
      return;
    }

    // AI-powered actions: SEO, hashtags
    setActiveAction(actionId);
    setLoading(true);
    setResult(null);

    try {
      let prompt = "";
      if (actionId === "seo") {
        prompt = `Generate SEO metadata for the following content. Return a meta title (under 60 chars), meta description (under 160 chars), and 5-8 relevant keywords. Format clearly with labels.\n\nContent:\n${context.content.slice(0, 2000)}`;
      } else if (actionId === "hashtags") {
        prompt = `Generate 15-20 relevant hashtags for the following content. Mix popular and niche hashtags. Return them as a list.\n\nContent:\n${context.content.slice(0, 1500)}`;
      }

      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          template_type: "workflow-" + actionId,
          prompt,
          language: "en",
        },
      });

      if (error) throw error;
      setResult(data.generated_content);
      setCompletedActions((prev) => new Set(prev).add(actionId));
    } catch (err: any) {
      toast({
        title: "Generation failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
      setActiveAction(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!user || !taskTitle.trim()) return;
    setLoading(true);

    try {
      const { error } = await supabase.from("tasks").insert({
        user_id: user.id,
        title: taskTitle.trim(),
        description: context.content.slice(0, 500),
        priority: "medium",
        status: "todo",
      });

      if (error) throw error;

      toast({ title: "Task created!", description: `"${taskTitle}" added to your tasks` });
      setCompletedActions((prev) => new Set(prev).add("task"));
      setActiveAction(null);
      setTaskTitle("");
    } catch (err: any) {
      toast({ title: "Failed to create task", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveAction(null);
    setResult(null);
    setCompletedActions(new Set());
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3">
          <SheetTitle className="flex items-center gap-2.5 text-lg">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Workflow className="h-4.5 w-4.5 text-white" />
            </div>
            Workflow Actions
          </SheetTitle>
          <SheetDescription className="text-xs">
            Continue your workflow — generate related content, create tasks, or share across tools.
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <ScrollArea className="flex-1 px-5 py-4">
          <AnimatePresence mode="wait">
            {activeAction && (activeAction === "seo" || activeAction === "hashtags") ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <Button variant="ghost" size="sm" onClick={() => { setActiveAction(null); setResult(null); }} className="gap-1.5 -ml-2">
                  <ArrowRight className="h-3.5 w-3.5 rotate-180" /> Back
                </Button>

                <h3 className="font-semibold text-sm">
                  {activeAction === "seo" ? "SEO Metadata" : "Generated Hashtags"}
                </h3>

                {loading ? (
                  <div className="flex items-center justify-center py-12 gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Generating...</span>
                  </div>
                ) : result ? (
                  <div className="space-y-3">
                    <div className="bg-muted/40 rounded-xl p-4 border border-border/50">
                      <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">{result}</pre>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => {
                        navigator.clipboard.writeText(result);
                        toast({ title: "Copied!" });
                      }}
                    >
                      Copy to Clipboard
                    </Button>
                  </div>
                ) : null}
              </motion.div>
            ) : activeAction === "task" ? (
              <motion.div
                key="task"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <Button variant="ghost" size="sm" onClick={() => setActiveAction(null)} className="gap-1.5 -ml-2">
                  <ArrowRight className="h-3.5 w-3.5 rotate-180" /> Back
                </Button>

                <h3 className="font-semibold text-sm">Create Task</h3>
                <div className="space-y-3">
                  <Input
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Task title..."
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    The content will be saved as the task description.
                  </p>
                  <Button onClick={handleCreateTask} disabled={loading || !taskTitle.trim()} className="w-full gap-2" size="sm">
                    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ListTodo className="h-3.5 w-3.5" />}
                    Create Task
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                {context.title && (
                  <div className="mb-4 p-3 rounded-xl bg-muted/30 border border-border/40">
                    <p className="text-xs text-muted-foreground mb-1">Working with:</p>
                    <p className="text-sm font-medium truncate">{context.title}</p>
                  </div>
                )}

                {actions.map((action, i) => {
                  const isCompleted = completedActions.has(action.id);
                  return (
                    <motion.button
                      key={action.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleAction(action.id)}
                      disabled={isCompleted}
                      className={cn(
                        "w-full flex items-center gap-3.5 p-3.5 rounded-xl border transition-all duration-200 text-left group",
                        isCompleted
                          ? "border-emerald-500/30 bg-emerald-500/5 cursor-default"
                          : "border-border/50 hover:border-primary/30 hover:bg-primary/5 hover:shadow-md hover:shadow-primary/5"
                      )}
                    >
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        isCompleted ? "bg-emerald-500/10" : "bg-muted/60 group-hover:bg-primary/10"
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <action.icon className={cn("h-5 w-5", action.color)} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium", isCompleted && "text-emerald-600 dark:text-emerald-400")}>
                          {isCompleted ? `${action.label} ✓` : action.label}
                        </p>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                      {!isCompleted && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
