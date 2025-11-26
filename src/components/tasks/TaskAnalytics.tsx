import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { StatsCard } from "@/components/ui/stats-card";
import { CheckCircle2, Clock, AlertCircle, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TaskAnalyticsProps {
  refreshTrigger: number;
}

export function TaskAnalytics({ refreshTrigger }: TaskAnalyticsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
    completionRate: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, [user, refreshTrigger]);

  const fetchAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const tasks = data || [];
      const now = new Date();
      
      const completed = tasks.filter(t => t.status === 'completed').length;
      const inProgress = tasks.filter(t => t.status === 'in_progress').length;
      const overdue = tasks.filter(t => 
        t.due_date && 
        new Date(t.due_date) < now && 
        t.status !== 'completed'
      ).length;
      
      const completionRate = tasks.length > 0 
        ? Math.round((completed / tasks.length) * 100)
        : 0;

      setStats({
        total: tasks.length,
        completed,
        inProgress,
        overdue,
        completionRate,
      });
    } catch (error: any) {
      toast({
        title: "Error loading analytics",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatsCard
          title="Total Tasks"
          value={stats.total}
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
        />
        
        <StatsCard
          title="Completed"
          value={stats.completed}
          description={`${stats.completionRate}% completion rate`}
          icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
        />
        
        <StatsCard
          title="In Progress"
          value={stats.inProgress}
          icon={<Clock className="h-4 w-4 text-yellow-600" />}
        />
        
        <StatsCard
          title="Overdue"
          value={stats.overdue}
          icon={<AlertCircle className="h-4 w-4 text-red-600" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Progress</span>
              <span className="text-sm text-muted-foreground">{stats.completionRate}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full transition-all"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <span className="text-sm">To-Do</span>
              <span className="font-semibold">{stats.total - stats.completed - stats.inProgress}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <span className="text-sm">In Progress</span>
              <span className="font-semibold">{stats.inProgress}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <span className="text-sm">Completed</span>
              <span className="font-semibold">{stats.completed}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}