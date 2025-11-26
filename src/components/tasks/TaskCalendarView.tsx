import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format, isSameDay } from "date-fns";

interface Task {
  id: string;
  title: string;
  priority: string;
  status: string;
  due_date: string | null;
  template_type: string | null;
}

interface TaskCalendarViewProps {
  refreshTrigger: number;
  onEditTask: (taskId: string) => void;
}

export function TaskCalendarView({ refreshTrigger, onEditTask }: TaskCalendarViewProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    fetchTasks();
  }, [user, refreshTrigger]);

  const fetchTasks = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .not('due_date', 'is', null);

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading tasks",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const tasksWithDueDates = tasks.filter(task => task.due_date);
  
  const selectedDateTasks = selectedDate
    ? tasksWithDueDates.filter(task => 
        task.due_date && isSameDay(new Date(task.due_date), selectedDate)
      )
    : [];

  const getDatesWithTasks = () => {
    return tasksWithDueDates
      .map(task => task.due_date ? new Date(task.due_date) : null)
      .filter((date): date is Date => date !== null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Calendar</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border w-full"
            modifiers={{
              hasTask: getDatesWithTasks(),
            }}
            modifiersStyles={{
              hasTask: {
                fontWeight: 'bold',
                textDecoration: 'underline',
              },
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateTasks.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 text-sm">
              No tasks scheduled for this date
            </p>
          ) : (
            <div className="space-y-3">
              {selectedDateTasks.map(task => (
                <div
                  key={task.id}
                  className="p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => onEditTask(task.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm sm:text-base">{task.title}</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <Badge className="text-xs">{task.priority}</Badge>
                        {task.template_type && (
                          <Badge variant="secondary" className="text-xs">{task.template_type}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}