import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ActionId, ActionResult, ChainStep, SmartSuggestion, WorkflowContext } from "./types";
import { buildActionPrompt, getTemplateIdFromAction } from "./actions";

interface RunOptions {
  brandContext?: string;
  language?: string;
  tone?: string;
}

export function useWorkflowRunner(context: WorkflowContext | null) {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [results, setResults] = useState<Record<string, ActionResult>>({});
  const [chain, setChain] = useState<ChainStep[]>([]);
  const [chainRunning, setChainRunning] = useState(false);
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const logHistory = useCallback(
    async (actionType: string, resultPreview?: string) => {
      if (!user || !context) return;
      try {
        await supabase.from("workflow_history").insert({
          user_id: user.id,
          action_type: actionType,
          source_type: context.type,
          source_title: context.title || null,
          content_preview: context.content.slice(0, 200),
          result_preview: resultPreview?.slice(0, 500) || null,
        });
      } catch (err) {
        console.error("Workflow history log failed:", err);
      }
    },
    [user, context]
  );

  const runAIAction = useCallback(
    async (actionId: ActionId, opts: RunOptions = {}): Promise<string | null> => {
      if (!context) return null;
      const prompt = buildActionPrompt(actionId, context.content, {
        language: opts.language || "",
        tone: opts.tone || "",
      });

      const tplId = getTemplateIdFromAction(actionId);
      const templateType = tplId ? tplId : `workflow-${actionId}`;

      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          template_type: templateType,
          prompt,
          language: "en",
          brand_context: opts.brandContext || undefined,
        },
      });

      if (error) throw error;
      const result = data?.generated_content || "";
      setResults((prev) => ({
        ...prev,
        [actionId]: { action: actionId, result, ranAt: new Date().toISOString() },
      }));
      await logHistory(actionId, result);
      return result;
    },
    [context, logHistory]
  );

  const fetchSmartSuggestions = useCallback(
    async (brandContext?: string) => {
      if (!context) return;
      setLoadingSuggestions(true);
      try {
        const { data, error } = await supabase.functions.invoke("workflow-suggest", {
          body: {
            content: context.content,
            source_type: context.type,
            title: context.title,
            brand_context: brandContext,
          },
        });
        if (error) throw error;
        setSuggestions(data?.suggestions || []);
      } catch (err) {
        console.error("Smart suggestions failed:", err);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    },
    [context]
  );

  const runChain = useCallback(
    async (actions: ActionId[], opts: RunOptions = {}) => {
      if (!context || chainRunning) return;
      setChainRunning(true);
      const initial: ChainStep[] = actions.map((a, i) => ({
        id: `${a}-${i}`,
        action: a,
        status: "pending",
      }));
      setChain(initial);

      for (let i = 0; i < initial.length; i++) {
        const step = initial[i];
        setChain((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: "running" } : s)));
        try {
          // Only AI inline actions can run in a chain; nav actions are skipped here
          const result = await runAIAction(step.action, opts);
          setChain((prev) =>
            prev.map((s, idx) =>
              idx === i ? { ...s, status: "done", result: result || "" } : s
            )
          );
        } catch (err: any) {
          setChain((prev) =>
            prev.map((s, idx) =>
              idx === i ? { ...s, status: "failed", error: err?.message || "Failed" } : s
            )
          );
          break;
        }
      }
      setChainRunning(false);
    },
    [context, chainRunning, runAIAction]
  );

  const resetResults = useCallback(() => {
    setResults({});
    setChain([]);
    setSuggestions([]);
  }, []);

  return {
    results,
    chain,
    chainRunning,
    suggestions,
    loadingSuggestions,
    runAIAction,
    runChain,
    fetchSmartSuggestions,
    logHistory,
    resetResults,
  };
}
