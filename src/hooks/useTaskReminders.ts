import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { playNotificationSound, initializeAudioContext } from "@/lib/notificationSound";

interface Task {
  id: string;
  title: string;
  reminder_time: string | null;
}

export function useTaskReminders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const scheduledReminders = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const notificationPermission = useRef<NotificationPermission>("default");

  // Request notification permission and initialize audio
  useEffect(() => {
    // Initialize audio context on first user interaction
    const handleInteraction = () => {
      initializeAudioContext();
      document.removeEventListener('click', handleInteraction);
    };
    document.addEventListener('click', handleInteraction);

    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        notificationPermission.current = permission;
        if (permission === "granted") {
          console.log("Notification permission granted");
        }
      });
    }

    return () => {
      document.removeEventListener('click', handleInteraction);
    };
  }, []);

  // Fetch tasks with reminders and schedule notifications
  useEffect(() => {
    if (!user) return;

    const fetchAndScheduleReminders = async () => {
      const now = new Date().toISOString();
      
      const { data: tasks, error } = await supabase
        .from("tasks")
        .select("id, title, reminder_time")
        .eq("user_id", user.id)
        .not("reminder_time", "is", null)
        .gte("reminder_time", now)
        .neq("status", "completed");

      if (error) {
        console.error("Error fetching task reminders:", error);
        return;
      }

      // Clear existing scheduled reminders
      scheduledReminders.current.forEach((timeout) => clearTimeout(timeout));
      scheduledReminders.current.clear();

      // Schedule new reminders
      tasks?.forEach((task: Task) => {
        if (task.reminder_time) {
          scheduleReminder(task);
        }
      });
    };

    fetchAndScheduleReminders();

    // Subscribe to task changes for real-time reminder updates
    const channel = supabase
      .channel("task-reminders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            // Clear reminder for deleted task
            const taskId = payload.old.id;
            if (scheduledReminders.current.has(taskId)) {
              clearTimeout(scheduledReminders.current.get(taskId));
              scheduledReminders.current.delete(taskId);
            }
          } else {
            // Refetch and reschedule all reminders
            fetchAndScheduleReminders();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      scheduledReminders.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, [user]);

  const scheduleReminder = (task: Task) => {
    if (!task.reminder_time) return;

    const reminderTime = new Date(task.reminder_time).getTime();
    const now = Date.now();
    const delay = reminderTime - now;

    if (delay <= 0) return; // Reminder time has passed

    // Clear existing reminder for this task if any
    if (scheduledReminders.current.has(task.id)) {
      clearTimeout(scheduledReminders.current.get(task.id));
    }

    const timeout = setTimeout(() => {
      sendNotification(task);
      scheduledReminders.current.delete(task.id);
    }, delay);

    scheduledReminders.current.set(task.id, timeout);
  };

  const sendNotification = (task: Task) => {
    // Play notification sound
    playNotificationSound();

    // Show toast notification
    toast({
      title: "⏰ Task Reminder",
      description: task.title,
    });

    // Show browser notification if permission granted
    if ("Notification" in window && notificationPermission.current === "granted") {
      new Notification("Task Reminder", {
        body: task.title,
        icon: "/favicon.png",
        tag: task.id,
      });
    }
  };
}
