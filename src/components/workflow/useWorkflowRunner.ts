import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useAvatars } from "@/hooks/useAvatars";
import { ActionId, ActionResult, ChainStep, SmartSuggestion, WorkflowContext } from "./types";
import { buildActionPrompt, getTemplateIdFromAction, isImageAction, IMAGE_ACTION_WORD_COST, SOCIAL_PACK_VARIANTS } from "./actions";

interface RunOptions {
  brandContext?: string;
  language?: string;
  tone?: string;
}

export function useWorkflowRunner(context: WorkflowContext | null) {
  const { user, profile, refreshProfile } = useAuth();
  const { defaultAvatar, buildAvatarContext } = useAvatars();
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

      // Enforce word limit (same as templates)
      if (profile && profile.words_used >= profile.words_limit) {
        toast({
          title: "Word limit reached",
          description: "Please upgrade your plan to run more workflow actions.",
          variant: "destructive",
        });
        throw new Error("Word limit reached");
      }

      // === Image generation actions (image-hero, image-social-pack) ===
      if (isImageAction(actionId)) {
        const variants =
          actionId === "image-social-pack"
            ? SOCIAL_PACK_VARIANTS
            : [{ key: "hero", label: "Hero Image", template: "banner" }];

        const avatarBrief = defaultAvatar
          ? `\n\nFeature this avatar/persona prominently in the visual: ${defaultAvatar.name} — ${defaultAvatar.description || defaultAvatar.prompt}`
          : "";
        const briefBase = `${context.title ? `Title: ${context.title}\n` : ""}Content excerpt:\n${context.content.slice(0, 1500)}${avatarBrief}`;
        const urls: { label: string; url: string }[] = [];

        for (const v of variants) {
          const imgBody: Record<string, unknown> = {
            prompt: `Create a ${v.label} visual for the following content. Make it eye-catching and on-brand.\n\n${briefBase}`,
            template_type: v.template,
            style_preset: "professional",
          };
          if (defaultAvatar?.image_url) {
            imgBody.mode = "edit";
            imgBody.source_image_url = defaultAvatar.image_url;
            imgBody.edit_instruction = `Use this avatar as the central character. Restyle into a ${v.label}: ${briefBase}`;
          }
          const { data: imgData, error: imgErr } = await supabase.functions.invoke("generate-image", {
            body: imgBody,
          });
          if (imgErr) throw imgErr;
          const url = imgData?.image_url;
          if (url) {
            urls.push({ label: v.label, url });
            if (user) {
              await supabase.from("image_generations").insert({
                user_id: user.id,
                template_type: `workflow-${actionId}-${v.key}`,
                prompt: briefBase.slice(0, 500),
                image_url: url,
                style_preset: "professional",
              });
            }
          }
        }

        const totalCost = IMAGE_ACTION_WORD_COST[actionId] || 50;
        if (user) {
          await supabase.rpc("update_word_usage", {
            user_uuid: user.id,
            words_to_add: totalCost,
          });
          await refreshProfile();
        }

        const result = urls.map((u) => `![${u.label}](${u.url})`).join("\n\n");
        setResults((prev) => ({
          ...prev,
          [actionId]: { action: actionId, result, ranAt: new Date().toISOString() },
        }));
        await logHistory(actionId, `Generated ${urls.length} image(s)`);
        return result;
      }

      const prompt = buildActionPrompt(actionId, context.content, {
        language: opts.language || "",
        tone: opts.tone || "",
      });

      const tplId = getTemplateIdFromAction(actionId);
      const templateType = tplId ? tplId : `workflow-${actionId}`;

      const avatarCtx = buildAvatarContext();
      const mergedBrandContext = [opts.brandContext, avatarCtx].filter(Boolean).join("\n\n") || undefined;

      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          template_type: templateType,
          prompt,
          language: opts.language || "en",
          brand_context: mergedBrandContext,
        },
      });

      if (error) throw error;
      const result = data?.generated_content || "";
      const wordCount =
        data?.word_count ||
        (result ? result.trim().split(/\s+/).filter(Boolean).length : 0);

      // Persist generation & deduct words so workflow counts toward user's paid usage
      if (user && result) {
        try {
          await supabase.from("content_generations").insert({
            user_id: user.id,
            template_type: templateType,
            prompt,
            generated_content: result,
            word_count: wordCount,
            language: opts.language || "en",
          });

          await supabase.rpc("update_word_usage", {
            user_uuid: user.id,
            words_to_add: wordCount,
          });

          await refreshProfile();
        } catch (persistErr) {
          console.error("Workflow usage tracking failed:", persistErr);
        }
      }

      setResults((prev) => ({
        ...prev,
        [actionId]: { action: actionId, result, ranAt: new Date().toISOString() },
      }));
      await logHistory(actionId, result);
      return result;
    },
    [context, profile, user, refreshProfile, toast, logHistory, defaultAvatar, buildAvatarContext]
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
