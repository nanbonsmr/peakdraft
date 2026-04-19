import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Loader2, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ActionId, WorkflowContext } from "./types";
import { ALL_ACTIONS } from "./actions";

interface Props {
  context: WorkflowContext;
  defaultAction: ActionId;
}

interface Schedule {
  id: string;
  action_type: string;
  scheduled_for: string;
  status: string;
}

export function ScheduleManager({ context, defaultAction }: Props) {
  const { user } = useAuth();
  const [when, setWhen] = useState("");
  const [action, setAction] = useState<ActionId>(defaultAction);
  const [saving, setSaving] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    if (!user) return;
    (supabase as any)
      .from("workflow_schedules")
      .select("id, action_type, scheduled_for, status")
      .eq("status", "pending")
      .order("scheduled_for", { ascending: true })
      .limit(5)
      .then(({ data }: any) => {
        if (data) setSchedules(data);
      });
  }, [user]);

  const handleSchedule = async () => {
    if (!user || !when) return;
    setSaving(true);
    try {
      const { data, error } = await (supabase as any)
        .from("workflow_schedules")
        .insert({
          user_id: user.id,
          action_type: action,
          source_type: context.type,
          source_title: context.title || null,
          content: context.content,
          scheduled_for: new Date(when).toISOString(),
          options: {},
        })
        .select()
        .single();

      if (error) throw error;
      toast({ title: "Scheduled!", description: `${ALL_ACTIONS[action].label} queued for ${new Date(when).toLocaleString()}` });
      setSchedules((prev) => [...prev, data]);
      setWhen("");
    } catch (err: any) {
      toast({ title: "Failed to schedule", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await (supabase as any).from("workflow_schedules").delete().eq("id", id);
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const aiActions = (Object.keys(ALL_ACTIONS) as ActionId[]).filter((id) => ALL_ACTIONS[id].isAI);

  return (
    <div className="rounded-xl border border-border/50 bg-card p-3.5">
      <div className="flex items-center gap-2 mb-2.5">
        <Calendar className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold">Schedule Action</p>
      </div>

      <div className="space-y-2">
        <select
          value={action}
          onChange={(e) => setAction(e.target.value as ActionId)}
          className="w-full text-xs rounded-md bg-background border border-input px-2.5 py-1.5"
        >
          {aiActions.map((id) => (
            <option key={id} value={id}>{ALL_ACTIONS[id].label}</option>
          ))}
        </select>

        <Input
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          className="text-xs h-8"
          min={new Date().toISOString().slice(0, 16)}
        />

        <Button size="sm" className="w-full h-8 gap-1.5" disabled={!when || saving} onClick={handleSchedule}>
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Clock className="h-3 w-3" />}
          Schedule
        </Button>
      </div>

      {schedules.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/40 space-y-1.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Pending</p>
          {schedules.map((s) => (
            <div key={s.id} className="flex items-center gap-2 text-xs">
              <span className="flex-1 truncate">{ALL_ACTIONS[s.action_type as ActionId]?.label || s.action_type}</span>
              <span className="text-muted-foreground text-[10px]">{new Date(s.scheduled_for).toLocaleString()}</span>
              <button onClick={() => handleDelete(s.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
