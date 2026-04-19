import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  Workflow,
  Sparkles,
  Loader2,
  ArrowRight,
  ListTodo,
  Download,
  Save,
  Wand2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { ActionId, WorkflowContext } from "./workflow/types";
import { ALL_ACTIONS, getRelevantActions, LANGUAGE_OPTIONS, TONE_OPTIONS } from "./workflow/actions";
import { useWorkflowRunner } from "./workflow/useWorkflowRunner";
import { useInfobase } from "@/hooks/useInfobase";
import { SmartSuggestionsView } from "./workflow/SmartSuggestionsView";
import { ChainBuilder } from "./workflow/ChainBuilder";
import { ScheduleManager } from "./workflow/ScheduleManager";
import { ResultCard } from "./workflow/ResultCard";

export type { WorkflowContext } from "./workflow/types";

interface WorkflowPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: WorkflowContext | null;
}

export function WorkflowPanel({ open, onOpenChange, context }: WorkflowPanelProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeEntry, buildBrandContext } = useInfobase();
  const runner = useWorkflowRunner(context);

  const [useBrand, setUseBrand] = useState(true);
  const [language, setLanguage] = useState("Spanish");
  const [tone, setTone] = useState("professional");
  const [taskTitle, setTaskTitle] = useState("");
  const [activeAction, setActiveAction] = useState<ActionId | null>(null);
  const [actionLoading, setActionLoading] = useState<ActionId | null>(null);
  const [savedFetched, setSavedFetched] = useState(false);
  const [saveTplOpen, setSaveTplOpen] = useState(false);
  const [tplName, setTplName] = useState("");
  const [tab, setTab] = useState("smart");

  const brandContext = useMemo(
    () => (useBrand ? buildBrandContext(activeEntry) : ""),
    [useBrand, activeEntry, buildBrandContext]
  );

  // Reset on context change
  useEffect(() => {
    if (open && context) {
      runner.resetResults();
      setActiveAction(null);
      setSavedFetched(false);
      setTab("smart");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, context?.content]);

  if (!context) return null;

  const relevantIds = getRelevantActions(context.type);
  const relevantActions = relevantIds.map((id) => ALL_ACTIONS[id]).filter(Boolean);

  const handleNavAction = async (actionId: ActionId) => {
    await runner.logHistory(actionId);
    onOpenChange(false);
    switch (actionId) {
      case "chat":
        navigate("/app/chat");
        break;
      case "image":
        navigate("/app/image-generation");
        break;
      case "blog":
        navigate("/app/editor", {
          state: { content: context.content, title: context.title || "Untitled", templateType: context.type },
        });
        break;
      case "social":
        navigate("/app/templates", { state: { openTemplate: "social-media" } });
        break;
      case "email":
        navigate("/app/templates", { state: { openTemplate: "email" } });
        break;
    }
  };

  const handleAIAction = async (actionId: ActionId) => {
    setActiveAction(actionId);
    setActionLoading(actionId);
    try {
      await runner.runAIAction(actionId, {
        brandContext,
        language: actionId === "translate" ? language : undefined,
        tone: actionId === "tone" ? tone : undefined,
      });
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAction = (actionId: ActionId) => {
    const meta = ALL_ACTIONS[actionId];
    if (actionId === "task") {
      setActiveAction("task");
      setTaskTitle(context.title || context.content.slice(0, 60));
      return;
    }
    if (meta.isNav) {
      handleNavAction(actionId);
      return;
    }
    if (meta.isAI) {
      handleAIAction(actionId);
    }
  };

  const handleCreateTask = async () => {
    if (!user || !taskTitle.trim()) return;
    setActionLoading("task");
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
      await runner.logHistory("task", `Task: ${taskTitle.trim()}`);
      setActiveAction(null);
      setTaskTitle("");
    } catch (err: any) {
      toast({ title: "Failed to create task", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendToEditor = (resultText: string, action: ActionId) => {
    onOpenChange(false);
    navigate("/app/editor", {
      state: {
        content: resultText,
        title: `${ALL_ACTIONS[action].label} – ${context.title || "Untitled"}`,
        templateType: context.type,
      },
    });
  };

  const handleBulkExport = (format: "md" | "json") => {
    const allResults = Object.values(runner.results);
    if (allResults.length === 0) {
      toast({ title: "Nothing to export yet", description: "Run an action first." });
      return;
    }
    let content = "";
    let mime = "text/markdown";
    let ext = "md";
    if (format === "json") {
      content = JSON.stringify(
        {
          source: { type: context.type, title: context.title, content: context.content },
          results: allResults,
          exported_at: new Date().toISOString(),
        },
        null,
        2
      );
      mime = "application/json";
      ext = "json";
    } else {
      content =
        `# Workflow Export\n\n**Source:** ${context.title || context.type}\n\n## Original Content\n\n${context.content}\n\n---\n\n` +
        allResults
          .map((r) => `## ${ALL_ACTIONS[r.action].label}\n\n${r.result}\n`)
          .join("\n---\n\n");
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported!", description: `${allResults.length} result(s) bundled.` });
  };

  const handleSaveTemplate = async () => {
    if (!user || !tplName.trim()) return;
    const completedActions = Object.keys(runner.results) as ActionId[];
    const queuedFromChain = runner.chain.map((s) => s.action);
    const actions = [...new Set([...queuedFromChain, ...completedActions])];
    if (actions.length === 0) {
      toast({ title: "Run some actions first", description: "Templates save your action sequence." });
      return;
    }
    try {
      const { error } = await (supabase as any).from("workflow_templates").insert({
        user_id: user.id,
        name: tplName.trim(),
        source_types: [context.type],
        actions,
        use_brand_context: useBrand,
      });
      if (error) throw error;
      toast({ title: "Template saved!", description: `"${tplName}" can be re-run anytime.` });
      setTplName("");
      setSaveTplOpen(false);
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
  };

  const handleClose = () => {
    setActiveAction(null);
    runner.resetResults();
    onOpenChange(false);
  };

  const fetchSuggestions = () => {
    setSavedFetched(true);
    runner.fetchSmartSuggestions(brandContext);
  };

  const completedCount = Object.keys(runner.results).length;

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3">
          <SheetTitle className="flex items-center gap-2.5 text-lg">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Workflow className="h-4 w-4 text-white" />
            </div>
            Workflow Studio
          </SheetTitle>
          <SheetDescription className="text-xs">
            AI-curated next steps, multi-step chains, scheduling, and inline transforms.
          </SheetDescription>

          {/* Brand toggle */}
          {activeEntry && (
            <div className="mt-2 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/30 border border-border/40">
              <Switch id="use-brand" checked={useBrand} onCheckedChange={setUseBrand} className="scale-75" />
              <label htmlFor="use-brand" className="text-[11px] cursor-pointer flex-1">
                Apply <span className="font-semibold">{activeEntry.brand_name}</span> brand context
              </label>
            </div>
          )}
        </SheetHeader>

        <Separator />

        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-5 mt-3 grid grid-cols-4 h-8">
              <TabsTrigger value="smart" className="text-[11px]">Smart</TabsTrigger>
              <TabsTrigger value="actions" className="text-[11px]">Actions</TabsTrigger>
              <TabsTrigger value="chain" className="text-[11px]">Chain</TabsTrigger>
              <TabsTrigger value="schedule" className="text-[11px]">Later</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 px-5 py-3">
              {context.title && (
                <div className="mb-3 p-2.5 rounded-lg bg-muted/30 border border-border/40">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Working with</p>
                  <p className="text-sm font-medium truncate">{context.title}</p>
                </div>
              )}

              <TabsContent value="smart" className="space-y-3 mt-0">
                <SmartSuggestionsView
                  suggestions={runner.suggestions}
                  loading={runner.loadingSuggestions}
                  onFetch={fetchSuggestions}
                  onRun={handleAction}
                  fetched={savedFetched}
                />
              </TabsContent>

              <TabsContent value="actions" className="space-y-2 mt-0">
                {/* Inline option pickers for translate/tone */}
                {(activeAction === "translate" || activeAction === "tone") && (
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40 mb-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">
                      {activeAction === "translate" ? "Target language" : "New tone"}
                    </p>
                    <select
                      value={activeAction === "translate" ? language : tone}
                      onChange={(e) =>
                        activeAction === "translate" ? setLanguage(e.target.value) : setTone(e.target.value)
                      }
                      className="w-full text-xs rounded-md bg-background border border-input px-2.5 py-1.5"
                    >
                      {(activeAction === "translate" ? LANGUAGE_OPTIONS : TONE_OPTIONS).map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      className="w-full mt-2 h-7 text-xs gap-1.5"
                      onClick={() => handleAIAction(activeAction)}
                      disabled={actionLoading === activeAction}
                    >
                      {actionLoading === activeAction ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                      Run
                    </Button>
                  </div>
                )}

                {activeAction === "task" && (
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40 mb-2 space-y-2">
                    <Input
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="Task title…"
                      className="text-xs h-8"
                    />
                    <Button size="sm" className="w-full h-7 text-xs gap-1.5" onClick={handleCreateTask} disabled={actionLoading === "task"}>
                      {actionLoading === "task" ? <Loader2 className="h-3 w-3 animate-spin" /> : <ListTodo className="h-3 w-3" />}
                      Create Task
                    </Button>
                  </div>
                )}

                {/* Action list grouped */}
                <div className="space-y-1.5">
                  {relevantActions.map((action, i) => {
                    const isLoading = actionLoading === action.id;
                    const isDone = !!runner.results[action.id];
                    return (
                      <motion.button
                        key={action.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => handleAction(action.id)}
                        disabled={isLoading}
                        className={cn(
                          "w-full flex items-center gap-2.5 p-2.5 rounded-lg border transition-all text-left group",
                          isDone
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : "border-border/50 hover:border-primary/40 hover:bg-primary/5"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-medium">{action.label}</p>
                            {action.isAI && (
                              <Sparkles className="h-2.5 w-2.5 text-violet-500 shrink-0" />
                            )}
                            {isDone && <span className="text-[10px] text-emerald-600 dark:text-emerald-400">✓</span>}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">{action.description}</p>
                        </div>
                        {isLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                        ) : (
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="chain" className="mt-0">
                <ChainBuilder
                  available={relevantIds}
                  chain={runner.chain}
                  running={runner.chainRunning}
                  onRun={(actions) =>
                    runner.runChain(actions, { brandContext, language, tone })
                  }
                  onClear={runner.resetResults}
                />
              </TabsContent>

              <TabsContent value="schedule" className="mt-0">
                <ScheduleManager context={context} defaultAction="summarize" />
              </TabsContent>

              {/* Results section (always visible across tabs) */}
              <AnimatePresence>
                {completedCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 space-y-2"
                  >
                    <div className="flex items-center justify-between pt-3 border-t border-border/40">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Results ({completedCount})
                      </p>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 px-2" onClick={() => handleBulkExport("md")}>
                          <Download className="h-2.5 w-2.5" /> MD
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 px-2" onClick={() => handleBulkExport("json")}>
                          <Download className="h-2.5 w-2.5" /> JSON
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 px-2" onClick={() => setSaveTplOpen((v) => !v)}>
                          <Save className="h-2.5 w-2.5" /> Template
                        </Button>
                      </div>
                    </div>

                    {saveTplOpen && (
                      <div className="p-2 rounded-lg bg-muted/40 border border-border/40 flex gap-1.5">
                        <Input
                          value={tplName}
                          onChange={(e) => setTplName(e.target.value)}
                          placeholder="Recipe name…"
                          className="text-xs h-7"
                        />
                        <Button size="sm" className="h-7 text-[11px] px-2" onClick={handleSaveTemplate} disabled={!tplName.trim()}>
                          Save
                        </Button>
                      </div>
                    )}

                    {Object.values(runner.results).map((r) => (
                      <ResultCard
                        key={r.action}
                        result={r}
                        context={context}
                        onSendToEditor={() => handleSendToEditor(r.result, r.action)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
