import { motion } from "framer-motion";
import { Sparkles, Loader2, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActionId, SmartSuggestion } from "./types";
import { ALL_ACTIONS } from "./actions";
import { cn } from "@/lib/utils";

interface Props {
  suggestions: SmartSuggestion[];
  loading: boolean;
  onFetch: () => void;
  onRun: (action: ActionId) => void;
  fetched: boolean;
}

const priorityColor: Record<string, string> = {
  high: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  low: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
};

export function SmartSuggestionsView({ suggestions, loading, onFetch, onRun, fetched }: Props) {
  return (
    <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 p-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <p className="text-sm font-semibold">AI Smart Suggestions</p>
        </div>
        {!loading && (
          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1.5" onClick={onFetch}>
            <Zap className="h-3 w-3" />
            {fetched ? "Refresh" : "Analyze"}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Analyzing your content…
        </div>
      ) : suggestions.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {fetched ? "No suggestions returned." : "Click Analyze for AI-curated next steps."}
        </p>
      ) : (
        <div className="space-y-1.5">
          {suggestions.map((s, i) => {
            const meta = ALL_ACTIONS[s.action as ActionId];
            if (!meta) return null;
            return (
              <motion.button
                key={`${s.action}-${i}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onRun(s.action as ActionId)}
                className="w-full text-left p-2.5 rounded-lg bg-background/60 hover:bg-background border border-border/40 hover:border-primary/40 transition-all group flex items-start gap-2.5"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium">{meta.label}</span>
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4 capitalize", priorityColor[s.priority])}>
                      {s.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">{s.reason}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors mt-0.5 shrink-0" />
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
