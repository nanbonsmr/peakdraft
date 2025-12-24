import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, List, Calendar, Plus, BarChart3 } from "lucide-react";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskListView } from "@/components/tasks/TaskListView";
import { TaskCalendarView } from "@/components/tasks/TaskCalendarView";
import { TaskAnalytics } from "@/components/tasks/TaskAnalytics";
import { useTaskNotifications } from "@/hooks/useTaskNotifications";

export default function Tasks() {
  const { user } = useAuth();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Real-time notifications for task changes
  const handleRealtimeUpdate = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);
  
  useTaskNotifications(handleRealtimeUpdate);

  const handleTaskCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    setIsTaskDialogOpen(false);
  };

  const handleEditTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsTaskDialogOpen(false);
    setSelectedTaskId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Task Management</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Organize and track your content creation tasks
            </p>
          </div>
          <Button onClick={() => setIsTaskDialogOpen(true)} size="lg" className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>

        {/* Views */}
        <Tabs defaultValue="kanban" className="w-full">
          <TabsList className="grid w-full max-w-full sm:max-w-md grid-cols-4 h-auto">
            <TabsTrigger value="kanban" className="flex-col sm:flex-row gap-1 sm:gap-2 py-2">
              <LayoutGrid className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Kanban</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex-col sm:flex-row gap-1 sm:gap-2 py-2">
              <List className="h-4 w-4" />
              <span className="text-xs sm:text-sm">List</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex-col sm:flex-row gap-1 sm:gap-2 py-2">
              <Calendar className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex-col sm:flex-row gap-1 sm:gap-2 py-2">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="mt-6">
            <KanbanBoard 
              refreshTrigger={refreshTrigger} 
              onEditTask={handleEditTask}
            />
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <TaskListView 
              refreshTrigger={refreshTrigger}
              onEditTask={handleEditTask}
            />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <TaskCalendarView 
              refreshTrigger={refreshTrigger}
              onEditTask={handleEditTask}
            />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <TaskAnalytics refreshTrigger={refreshTrigger} />
          </TabsContent>
        </Tabs>
      </div>

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={handleCloseDialog}
        taskId={selectedTaskId}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}