import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Workflow as WorkflowIcon,
  Library,
  History,
  Play,
  Edit2,
  Trash2,
  Plus,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Copy as CopyIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ALL_ACTIONS, buildActionPrompt, getRelevantActions } from "@/components/workflow/actions";
import { ActionId, WorkflowSourceType } from "@/components/workflow/types";
import { STARTER_TEMPLATES, StarterTemplate } from "@/components/workflow/starterTemplates";
import { useInfobase } from "@/hooks/useInfobase";
import { format } from "date-fns";
import WorkflowHistory from "./WorkflowHistory";
import { Rocket } from "lucide-react";

interface WorkflowTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  source_types: string[];
  actions: ActionId[];
  use_brand_context: boolean;
  created_at: string;
  updated_at: string;
}

const SOURCE_TYPES: WorkflowSourceType[] = ["blog", "email", "social", "ad", "chat", "general", "task"];

const ALL_ACTION_IDS = Object.keys(ALL_ACTIONS) as ActionId[];

export default function Workflows() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { activeEntry, buildBrandContext } = useInfobase();

  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Editor dialog
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<WorkflowTemplate | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSourceTypes, setFormSourceTypes] = useState<string[]>(["general"]);
  const [formActions, setFormActions] = useState<ActionId[]>([]);
  const [formUseBrand, setFormUseBrand] = useState(true);
  const [saving, setSaving] = useState(false);

  // Run dialog
  const [runOpen, setRunOpen] = useState(false);
  const [runTemplate, setRunTemplate] = useState<WorkflowTemplate | null>(null);
  const [runContent, setRunContent] = useState("");
  const [runTitle, setRunTitle] = useState("");
  const [runSourceType, setRunSourceType] = useState<WorkflowSourceType>("general");
  const [runStepStates, setRunStepStates] = useState<
    Array<{ action: ActionId; status: "pending" | "running" | "done" | "failed"; result?: string; error?: string }>
  >([]);
  const [runRunning, setRunRunning] = useState(false);

  useEffect(() => {
    if (user) loadTemplates();
  }, [user]);

  const loadTemplates = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("workflow_templates")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      const list = (data as WorkflowTemplate[]) || [];

      // Auto-seed starter templates the first time a user lands here with zero workflows.
      const seedFlagKey = `workflows_starters_seeded_${user.id}`;
      const alreadySeeded = localStorage.getItem(seedFlagKey) === "1";
      if (list.length === 0 && !alreadySeeded) {
        const seeded = await seedStarterTemplates();
        localStorage.setItem(seedFlagKey, "1");
        setTemplates(seeded);
      } else {
        setTemplates(list);
      }
    } catch (err: any) {
      toast({ title: "Failed to load workflows", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const seedStarterTemplates = async (): Promise<WorkflowTemplate[]> => {
    if (!user) return [];
    try {
      const rows = STARTER_TEMPLATES.map((s) => ({
        user_id: user.id,
        name: s.name,
        description: s.description,
        source_types: s.source_types,
        actions: s.actions,
        use_brand_context: s.use_brand_context,
      }));
      const { data, error } = await (supabase as any)
        .from("workflow_templates")
        .insert(rows)
        .select();
      if (error) throw error;
      toast({
        title: "Starter workflows added",
        description: `${rows.length} ready-to-run recipes are now in your library.`,
      });
      return (data as WorkflowTemplate[]) || [];
    } catch (err: any) {
      console.error("seedStarterTemplates failed:", err);
      return [];
    }
  };

  const addStarter = async (starter: StarterTemplate) => {
    if (!user) return;
    try {
      const { error } = await (supabase as any).from("workflow_templates").insert({
        user_id: user.id,
        name: starter.name,
        description: starter.description,
        source_types: starter.source_types,
        actions: starter.actions,
        use_brand_context: starter.use_brand_context,
      });
      if (error) throw error;
      toast({ title: `Added "${starter.name}"` });
      loadTemplates();
    } catch (err: any) {
      toast({ title: "Failed to add starter", description: err.message, variant: "destructive" });
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        t.actions.some((a) => ALL_ACTIONS[a]?.label.toLowerCase().includes(q))
    );
  }, [templates, search]);

  const openNew = () => {
    setEditing(null);
    setFormName("");
    setFormDescription("");
    // Default new workflows to all source types so they're accessible everywhere.
    setFormSourceTypes([...SOURCE_TYPES]);
    setFormActions([]);
    setFormUseBrand(true);
    setEditorOpen(true);
  };

  const openEdit = (tpl: WorkflowTemplate) => {
    setEditing(tpl);
    setFormName(tpl.name);
    setFormDescription(tpl.description || "");
    setFormSourceTypes(tpl.source_types);
    setFormActions(tpl.actions);
    setFormUseBrand(tpl.use_brand_context);
    setEditorOpen(true);
  };

  const toggleAction = (id: ActionId) => {
    setFormActions((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const moveAction = (idx: number, dir: -1 | 1) => {
    setFormActions((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const toggleSource = (s: string) => {
    setFormSourceTypes((prev) =>
      prev.includes(s) ? prev.filter((p) => p !== s) : [...prev, s]
    );
  };

  const saveTemplate = async () => {
    if (!user || !formName.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    if (formActions.length === 0) {
      toast({ title: "Add at least one action", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        name: formName.trim(),
        description: formDescription.trim() || null,
        source_types: formSourceTypes.length ? formSourceTypes : ["general"],
        actions: formActions,
        use_brand_context: formUseBrand,
      };
      if (editing) {
        const { error } = await (supabase as any)
          .from("workflow_templates")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
        toast({ title: "Workflow updated" });
      } else {
        const { error } = await (supabase as any).from("workflow_templates").insert(payload);
        if (error) throw error;
        toast({ title: "Workflow saved" });
      }
      setEditorOpen(false);
      loadTemplates();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Delete this workflow recipe?")) return;
    try {
      const { error } = await (supabase as any).from("workflow_templates").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Workflow deleted" });
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  const duplicateTemplate = async (tpl: WorkflowTemplate) => {
    if (!user) return;
    try {
      const { error } = await (supabase as any).from("workflow_templates").insert({
        user_id: user.id,
        name: `${tpl.name} (copy)`,
        description: tpl.description,
        source_types: tpl.source_types,
        actions: tpl.actions,
        use_brand_context: tpl.use_brand_context,
      });
      if (error) throw error;
      toast({ title: "Duplicated" });
      loadTemplates();
    } catch (err: any) {
      toast({ title: "Duplicate failed", description: err.message, variant: "destructive" });
    }
  };

  const openRun = (tpl: WorkflowTemplate) => {
    setRunTemplate(tpl);
    setRunContent("");
    setRunTitle("");
    setRunSourceType((tpl.source_types[0] as WorkflowSourceType) || "general");
    setRunStepStates(tpl.actions.map((a) => ({ action: a, status: "pending" })));
    setRunOpen(true);
  };

  const executeWorkflow = async () => {
    if (!runTemplate || !runContent.trim()) {
      toast({ title: "Add some content first", variant: "destructive" });
      return;
    }
    setRunRunning(true);
    const brandContext = runTemplate.use_brand_context ? buildBrandContext(activeEntry) : "";

    // AI actions only — nav/task actions are skipped with a note
    for (let i = 0; i < runTemplate.actions.length; i++) {
      const action = runTemplate.actions[i];
      const meta = ALL_ACTIONS[action];
      setRunStepStates((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: "running" } : s))
      );

      if (!meta?.isAI) {
        setRunStepStates((prev) =>
          prev.map((s, idx) =>
            idx === i
              ? {
                  ...s,
                  status: "done",
                  result: meta?.isNav
                    ? `(Navigation step — open ${meta.label} from the Workflow Panel after run.)`
                    : `(Manual step — ${meta?.label || action})`,
                }
              : s
          )
        );
        continue;
      }

      try {
        const prompt = buildActionPrompt(action, runContent, {});
        const { data, error } = await supabase.functions.invoke("generate-content", {
          body: {
            template_type: `workflow-${action}`,
            prompt,
            language: "en",
            brand_context: brandContext || undefined,
          },
        });
        if (error) throw error;
        const result = (data as any)?.generated_content || "";
        setRunStepStates((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status: "done", result } : s))
        );
        // Log to history
        await supabase.from("workflow_history").insert({
          user_id: user!.id,
          action_type: action,
          source_type: runSourceType,
          source_title: runTitle || runTemplate.name,
          content_preview: runContent.slice(0, 200),
          result_preview: result.slice(0, 500),
        });
      } catch (err: any) {
        setRunStepStates((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: "failed", error: err?.message || "Failed" } : s
          )
        );
        break;
      }
    }
    setRunRunning(false);
    toast({ title: "Workflow finished" });
  };

  const copyResult = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied" });
  };

  const exportRunMarkdown = () => {
    if (!runTemplate) return;
    const md =
      `# ${runTemplate.name}\n\n**Source:** ${runTitle || "Untitled"}\n\n## Original\n\n${runContent}\n\n` +
      runStepStates
        .filter((s) => s.status === "done" && s.result)
        .map((s) => `---\n\n## ${ALL_ACTIONS[s.action]?.label || s.action}\n\n${s.result}\n`)
        .join("\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${runTemplate.name.replace(/\s+/g, "-")}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container max-w-6xl mx-auto py-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <WorkflowIcon className="h-5 w-5 text-white" />
            </div>
            Workflows
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Save your favorite multi-step AI recipes and re-run them on new content with one click.
          </p>
        </div>
      </div>

      <Tabs defaultValue="library" className="w-full">
        <TabsList>
          <TabsTrigger value="library" className="gap-2">
            <Library className="h-4 w-4" /> Library
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" /> History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-4 mt-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workflows…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={openNew} className="gap-1.5">
              <Plus className="h-4 w-4" /> New Workflow
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
                  <Library className="h-7 w-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">No saved workflows yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Build a recipe from any AI generation via the Workflow Panel, or create one here.
                  </p>
                </div>
                <Button onClick={openNew} variant="outline" className="gap-1.5">
                  <Plus className="h-4 w-4" /> Create your first workflow
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {filtered.map((tpl) => (
                  <motion.div
                    key={tpl.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                  >
                    <Card className="h-full flex flex-col hover:border-primary/40 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base leading-tight">{tpl.name}</CardTitle>
                          {tpl.use_brand_context && (
                            <Badge variant="secondary" className="text-[10px] shrink-0">
                              <Sparkles className="h-2.5 w-2.5 mr-0.5" /> Brand
                            </Badge>
                          )}
                        </div>
                        {tpl.description && (
                          <CardDescription className="text-xs line-clamp-2">
                            {tpl.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="pb-4 flex-1 flex flex-col">
                        <div className="flex flex-wrap gap-1 mb-3">
                          {tpl.actions.slice(0, 6).map((a, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] font-normal">
                              {i + 1}. {ALL_ACTIONS[a]?.label || a}
                            </Badge>
                          ))}
                          {tpl.actions.length > 6 && (
                            <Badge variant="outline" className="text-[10px]">
                              +{tpl.actions.length - 6}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-auto mb-3">
                          {tpl.source_types.join(", ")} • Updated{" "}
                          {format(new Date(tpl.updated_at), "MMM d")}
                        </p>
                        <div className="flex gap-1.5">
                          <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={() => openRun(tpl)}>
                            <Play className="h-3 w-3" /> Run
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => openEdit(tpl)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => duplicateTemplate(tpl)}>
                            <CopyIcon className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => deleteTemplate(tpl.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <WorkflowHistory />
        </TabsContent>
      </Tabs>

      {/* Editor dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit workflow" : "New workflow"}</DialogTitle>
            <DialogDescription>
              Pick a sequence of AI actions. Order matters — they run top to bottom.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tpl-name">Name</Label>
              <Input id="tpl-name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Blog → Social Repurpose" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tpl-desc">Description (optional)</Label>
              <Textarea
                id="tpl-desc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="What does this recipe do?"
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Best for source types</Label>
              <div className="flex flex-wrap gap-1.5">
                {SOURCE_TYPES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSource(s)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      formSourceTypes.includes(s)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/40">
              <Switch id="tpl-brand" checked={formUseBrand} onCheckedChange={setFormUseBrand} />
              <Label htmlFor="tpl-brand" className="text-xs cursor-pointer flex-1">
                Inject active brand context from Infobase when running
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Actions ({formActions.length})</Label>
              {formActions.length > 0 && (
                <div className="space-y-1 p-2 rounded-lg border border-border/50 bg-muted/20">
                  {formActions.map((a, idx) => (
                    <div
                      key={`${a}-${idx}`}
                      className="flex items-center gap-2 p-2 rounded-md bg-background border border-border/40"
                    >
                      <span className="text-[10px] font-mono text-muted-foreground w-5">{idx + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{ALL_ACTIONS[a]?.label}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{ALL_ACTIONS[a]?.description}</p>
                      </div>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-xs" onClick={() => moveAction(idx, -1)} disabled={idx === 0}>
                        ↑
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-xs" onClick={() => moveAction(idx, 1)} disabled={idx === formActions.length - 1}>
                        ↓
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => toggleAction(a)}>
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-3">Add action</p>
              <div className="grid grid-cols-2 gap-1.5">
                {ALL_ACTION_IDS.filter((a) => !formActions.includes(a)).map((a) => {
                  const meta = ALL_ACTIONS[a];
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAction(a)}
                      className="text-left flex items-center gap-2 p-2 rounded-md border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-colors"
                    >
                      <Plus className="h-3 w-3 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate flex items-center gap-1">
                          {meta.label}
                          {meta.isAI && <Sparkles className="h-2.5 w-2.5 text-violet-500" />}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">{meta.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditorOpen(false)}>Cancel</Button>
            <Button onClick={saveTemplate} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              {editing ? "Save changes" : "Create workflow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Run dialog */}
      <Dialog open={runOpen} onOpenChange={(o) => { if (!runRunning) setRunOpen(o); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" />
              Run: {runTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              Paste new content below and the workflow will run all {runTemplate?.actions.length} steps in order.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="run-title">Title (optional)</Label>
                <Input id="run-title" value={runTitle} onChange={(e) => setRunTitle(e.target.value)} placeholder="My new piece" disabled={runRunning} />
              </div>
              <div className="space-y-1.5">
                <Label>Source type</Label>
                <Select value={runSourceType} onValueChange={(v) => setRunSourceType(v as WorkflowSourceType)} disabled={runRunning}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SOURCE_TYPES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="run-content">Content</Label>
              <Textarea
                id="run-content"
                value={runContent}
                onChange={(e) => setRunContent(e.target.value)}
                placeholder="Paste the content this workflow should process…"
                rows={6}
                disabled={runRunning}
              />
              <p className="text-[10px] text-muted-foreground">{runContent.split(/\s+/).filter(Boolean).length} words</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Steps</p>
              <div className="space-y-1.5">
                {runStepStates.map((s, i) => {
                  const meta = ALL_ACTIONS[s.action];
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border transition-colors ${
                        s.status === "done"
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : s.status === "running"
                          ? "border-primary/50 bg-primary/5"
                          : s.status === "failed"
                          ? "border-destructive/40 bg-destructive/5"
                          : "border-border/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground w-5">{i + 1}.</span>
                        {s.status === "running" && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
                        {s.status === "done" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                        {s.status === "failed" && <XCircle className="h-3.5 w-3.5 text-destructive" />}
                        {s.status === "pending" && <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />}
                        <p className="text-sm font-medium">{meta?.label || s.action}</p>
                        {meta?.isAI && <Sparkles className="h-3 w-3 text-violet-500" />}
                      </div>
                      {s.status === "done" && s.result && (
                        <div className="mt-2 ml-7">
                          <pre className="text-[11px] whitespace-pre-wrap font-sans bg-background/50 rounded p-2 max-h-40 overflow-auto border border-border/30">{s.result}</pre>
                          <Button size="sm" variant="ghost" className="h-6 text-[10px] mt-1 gap-1" onClick={() => copyResult(s.result!)}>
                            <CopyIcon className="h-2.5 w-2.5" /> Copy
                          </Button>
                        </div>
                      )}
                      {s.status === "failed" && (
                        <p className="text-[11px] text-destructive ml-7 mt-1">{s.error}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            {runStepStates.some((s) => s.status === "done") && (
              <Button variant="outline" onClick={exportRunMarkdown}>
                Export Markdown
              </Button>
            )}
            <Button variant="ghost" onClick={() => setRunOpen(false)} disabled={runRunning}>
              Close
            </Button>
            <Button onClick={executeWorkflow} disabled={runRunning || !runContent.trim()}>
              {runRunning ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Play className="h-4 w-4 mr-1" />}
              {runRunning ? "Running…" : "Run workflow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
