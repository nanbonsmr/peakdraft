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
import { useTaskReminders } from "@/hooks/useTaskReminders";

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
  
  // Task reminder notifications
  useTaskReminders();

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
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Task Management</h1>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
              Organize and track your content creation tasks
            </p>
          </div>
          <Button onClick={() => setIsTaskDialogOpen(true)} size="default" className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>

        {/* Views */}
        <Tabs defaultValue="kanban" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="kanban" className="flex flex-col xs:flex-row items-center gap-1 xs:gap-1.5 py-2 px-1 sm:px-3 text-xs sm:text-sm">
              <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden xs:inline">Kanban</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex flex-col xs:flex-row items-center gap-1 xs:gap-1.5 py-2 px-1 sm:px-3 text-xs sm:text-sm">
              <List className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden xs:inline">List</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex flex-col xs:flex-row items-center gap-1 xs:gap-1.5 py-2 px-1 sm:px-3 text-xs sm:text-sm">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden xs:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex flex-col xs:flex-row items-center gap-1 xs:gap-1.5 py-2 px-1 sm:px-3 text-xs sm:text-sm">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden xs:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="mt-4 sm:mt-6">
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