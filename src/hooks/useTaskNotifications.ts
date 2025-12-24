import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  user_id: string;
}

export function useTaskNotifications(onTaskChange?: () => void) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!user) return;

    // Small delay to prevent notifications on initial load
    const timeout = setTimeout(() => {
      isInitialLoad.current = false;
    }, 2000);

    const channel = supabase
      .channel('task-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: RealtimePostgresChangesPayload<Task>) => {
          if (isInitialLoad.current) return;
          
          const task = payload.new as Task;
          toast({
            title: '✨ New Task Created',
            description: `"${task.title}" has been added to your tasks.`,
          });
          onTaskChange?.();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: RealtimePostgresChangesPayload<Task>) => {
          if (isInitialLoad.current) return;
          
          const newTask = payload.new as Task;
          const oldTask = payload.old as Partial<Task>;

          // Check if status changed to completed
          if (oldTask.status !== 'completed' && newTask.status === 'completed') {
            toast({
              title: '🎉 Task Completed!',
              description: `"${newTask.title}" has been marked as complete.`,
            });
          } else if (oldTask.status !== newTask.status) {
            const statusLabels: Record<string, string> = {
              todo: 'To-Do',
              in_progress: 'In Progress',
              review: 'Review',
              completed: 'Completed',
            };
            toast({
              title: '📋 Task Updated',
              description: `"${newTask.title}" moved to ${statusLabels[newTask.status] || newTask.status}.`,
            });
          }
          onTaskChange?.();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: RealtimePostgresChangesPayload<Task>) => {
          if (isInitialLoad.current) return;
          
          const task = payload.old as Partial<Task>;
          toast({
            title: '🗑️ Task Deleted',
            description: task.title ? `"${task.title}" has been removed.` : 'A task has been removed.',
            variant: 'destructive',
          });
          onTaskChange?.();
        }
      )
      .subscribe((status) => {
        console.log('Task notifications subscription status:', status);
      });

    return () => {
      clearTimeout(timeout);
      supabase.removeChannel(channel);
    };
  }, [user, toast, onTaskChange]);
}
