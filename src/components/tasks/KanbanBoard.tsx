import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TaskCard } from "./TaskCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";

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
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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

      // Update local state immediately for smooth UX
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      toast({
        title: "Task moved",
        description: `Task moved to ${newStatus.replace('_', ' ')}`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;
    
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      await handleStatusChange(taskId, newStatus);
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
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="w-full">
        {/* Mobile/Tablet: Horizontal scroll */}
        <div className="lg:hidden">
          <ScrollArea className="w-full whitespace-nowrap rounded-lg border bg-muted/20 p-4">
            <div className="flex gap-3 pb-2 min-w-max">
              {STATUS_COLUMNS.map(column => {
                const columnTasks = tasks.filter(task => task.status === column.id);
                
                return (
                  <DroppableColumn key={column.id} id={column.id}>
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
                  </DroppableColumn>
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
              <DroppableColumn key={column.id} id={column.id}>
                <div className={`border-t-4 ${column.color} bg-card rounded-lg p-4 h-[500px] flex flex-col transition-colors ${column.id === activeTask?.status ? 'ring-2 ring-primary' : ''}`}>
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
                          Drop tasks here
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
              </DroppableColumn>
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-80">
            <TaskCard
              task={activeTask}
              onStatusChange={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className={`transition-all ${isOver ? 'scale-[1.02]' : ''}`}>
      {children}
    </div>
  );
}