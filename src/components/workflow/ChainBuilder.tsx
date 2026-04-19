import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, X, GitBranch, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { ActionId, ChainStep } from "./types";
import { ALL_ACTIONS } from "./actions";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  available: ActionId[];
  chain: ChainStep[];
  running: boolean;
  onRun: (actions: ActionId[]) => void;
  onClear: () => void;
}

export function ChainBuilder({ available, chain, running, onRun, onClear }: Props) {
  const [queue, setQueue] = useState<ActionId[]>([]);
  const aiOnly = available.filter((id) => ALL_ACTIONS[id]?.isAI);

  const addToQueue = (id: ActionId) => {
    setQueue((q) => [...q, id]);
  };
  const removeAt = (idx: number) => setQueue((q) => q.filter((_, i) => i !== idx));

  const handleRun = () => {
    if (queue.length === 0) return;
    onRun(queue);
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card p-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Multi-Step Chain</p>
        </div>
        {(queue.length > 0 || chain.length > 0) && (
          <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => { setQueue([]); onClear(); }}>
            Clear
          </Button>
        )}
      </div>

      {/* Queue */}
      {queue.length === 0 && chain.length === 0 ? (
        <p className="text-xs text-muted-foreground mb-2.5">
          Build a sequence — actions run one after another.
        </p>
      ) : null}

      {queue.length > 0 && chain.length === 0 && (
        <div className="space-y-1.5 mb-3">
          {queue.map((id, i) => {
            const meta = ALL_ACTIONS[id];
            return (
              <div key={`${id}-${i}`} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border/40">
                <span className="text-[10px] text-muted-foreground font-mono w-4">{i + 1}</span>
                <span className="text-xs font-medium flex-1">{meta.label}</span>
                <button onClick={() => removeAt(i)} className="text-muted-foreground hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Running chain */}
      {chain.length > 0 && (
        <div className="space-y-1.5 mb-3">
          <AnimatePresence>
            {chain.map((step, i) => {
              const meta = ALL_ACTIONS[step.action];
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex items-center gap-2 px-2.5 py-1.5 rounded-lg border",
                    step.status === "done" && "bg-emerald-500/5 border-emerald-500/30",
                    step.status === "running" && "bg-primary/5 border-primary/30",
                    step.status === "failed" && "bg-destructive/5 border-destructive/30",
                    step.status === "pending" && "bg-muted/40 border-border/40"
                  )}
                >
                  <span className="text-[10px] text-muted-foreground font-mono w-4">{i + 1}</span>
                  <span className="text-xs font-medium flex-1">{meta.label}</span>
                  {step.status === "running" && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                  {step.status === "done" && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                  {step.status === "failed" && <AlertCircle className="h-3 w-3 text-destructive" />}
                  {step.status === "pending" && <span className="text-[10px] text-muted-foreground">queued</span>}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add step picker + Run */}
      {chain.length === 0 && (
        <>
          <div className="flex flex-wrap gap-1 mb-3">
            {aiOnly.map((id) => {
              const meta = ALL_ACTIONS[id];
              return (
                <button
                  key={id}
                  onClick={() => addToQueue(id)}
                  className="text-[11px] px-2 py-1 rounded-md bg-muted/50 hover:bg-primary/10 border border-border/40 hover:border-primary/40 transition-colors flex items-center gap-1"
                >
                  <Plus className="h-2.5 w-2.5" />
                  {meta.label}
                </button>
              );
            })}
          </div>
          <Button
            size="sm"
            className="w-full gap-1.5"
            disabled={queue.length === 0 || running}
            onClick={handleRun}
          >
            {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Run {queue.length > 0 ? `${queue.length}-step chain` : "chain"}
          </Button>
        </>
      )}
    </div>
  );
}
