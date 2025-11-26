import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TaskCard } from "./TaskCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  template_type: string | null;
  created_at: string;
}

interface KanbanBoardProps {
  refreshTrigger: number;
  onEditTask: (taskId: string) => void;
}

const STATUS_COLUMNS = [
  { id: 'todo', label: 'To-Do', color: 'border-blue-500' },
  { id: 'in_progress', label: 'In Progress', color: 'border-yellow-500' },
  { id: 'review', label: 'Review', color: 'border-purple-500' },
  { id: 'completed', label: 'Completed', color: 'border-green-500' },
];

export function KanbanBoard({ refreshTrigger, onEditTask }: KanbanBoardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

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
        .order('created_at', { ascending: false });

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

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      toast({
        title: "Task updated",
        description: "Task status has been changed",
      });
    } catch (error: any) {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== taskId));

      toast({
        title: "Task deleted",
        description: "Task has been removed",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting task",
        description: error.message,
        variant: "destructive",
      });
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
    <div className="w-full">
      {/* Mobile/Tablet: Horizontal scroll */}
      <div className="lg:hidden">
        <ScrollArea className="w-full whitespace-nowrap rounded-lg border bg-muted/20 p-4">
          <div className="flex gap-3 pb-2 min-w-max">
            {STATUS_COLUMNS.map(column => {
              const columnTasks = tasks.filter(task => task.status === column.id);
              
              return (
                <div key={column.id} className="w-[260px] flex-shrink-0">
                  <div className={`border-t-4 ${column.color} bg-card rounded-lg p-3 h-[420px] flex flex-col`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm">{column.label}</h3>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {columnTasks.length}
                      </span>
                    </div>
                    
                    <ScrollArea className="flex-1 -mr-3 pr-3">
                      <div className="space-y-2.5">
                        {columnTasks.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-8">
                            No tasks
                          </p>
                        ) : (
                          columnTasks.map(task => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onStatusChange={handleStatusChange}
                              onEdit={() => onEditTask(task.id)}
                              onDelete={handleDeleteTask}
                            />
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Desktop: Grid layout with fixed height */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-4">
        {STATUS_COLUMNS.map(column => {
          const columnTasks = tasks.filter(task => task.status === column.id);
          
          return (
            <div key={column.id} className="flex flex-col">
              <div className={`border-t-4 ${column.color} bg-card rounded-lg p-4 h-[500px] flex flex-col`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-base">{column.label}</h3>
                  <span className="text-sm text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
                
                <ScrollArea className="flex-1 -mr-4 pr-4">
                  <div className="space-y-3">
                    {columnTasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-12">
                        No tasks yet
                      </p>
                    ) : (
                      columnTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onStatusChange={handleStatusChange}
                          onEdit={() => onEditTask(task.id)}
                          onDelete={handleDeleteTask}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}