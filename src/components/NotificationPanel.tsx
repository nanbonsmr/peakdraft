import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Sparkles, 
  CreditCard,
  MoreVertical,
  X,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionLabel?: string;
  actionUrl?: string;
  isDynamic?: boolean;
}

export function NotificationPanel() {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchDismissedNotifications = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('dismissed_notifications')
        .select('notification_id')
        .eq('user_id', user.id);
      
      if (!error && data) {
        setDismissedIds(new Set(data.map(d => d.notification_id)));
      }
    };

    const fetchNotifications = async () => {
      try {
        const { data: dbNotifications, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching notifications:', error);
          return;
        }

        // Filter out dismissed notifications
        const filteredDbNotifications = (dbNotifications || []).filter(
          notif => !dismissedIds.has(notif.id)
        );

        // Convert database notifications to component format
        const formattedNotifications: Notification[] = filteredDbNotifications.map(notif => ({
          id: notif.id,
          type: notif.type as Notification['type'],
          title: notif.title,
          message: notif.message,
          timestamp: new Date(notif.created_at),
          read: false,
          isDynamic: false
        }));

        // Add dynamic notifications based on user state
        const dynamicNotifications: Notification[] = [];

        // Welcome notification for new users
        if (profile?.words_used === 0 && !dismissedIds.has('welcome')) {
          dynamicNotifications.push({
            id: 'welcome',
            type: 'info',
            title: 'Welcome to PeakDraft!',
            message: 'Start creating amazing content with our AI-powered templates.',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            read: false,
            actionLabel: 'Get Started',
            actionUrl: '/app/templates',
            isDynamic: true
          });
        }

        // Usage warnings
        if (profile?.words_used && profile?.words_limit) {
          const usagePercentage = (profile.words_used / profile.words_limit) * 100;
          
          if (usagePercentage >= 90 && !dismissedIds.has('usage-critical')) {
            dynamicNotifications.push({
              id: 'usage-critical',
              type: 'warning',
              title: 'Word Limit Almost Reached',
              message: `You've used ${Math.round(usagePercentage)}% of your monthly word limit. Consider upgrading your plan.`,
              timestamp: new Date(Date.now() - 30 * 60 * 1000),
              read: false,
              actionLabel: 'Upgrade Plan',
              actionUrl: '/app/pricing',
              isDynamic: true
            });
          } else if (usagePercentage >= 75 && !dismissedIds.has('usage-warning')) {
            dynamicNotifications.push({
              id: 'usage-warning',
              type: 'info',
              title: 'Word Usage Update',
              message: `You've used ${Math.round(usagePercentage)}% of your monthly word limit.`,
              timestamp: new Date(Date.now() - 60 * 60 * 1000),
              read: false,
              isDynamic: true
            });
          }
        }

        // Combine database notifications with dynamic ones
        const allNotifications = [...dynamicNotifications, ...formattedNotifications]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        setNotifications(allNotifications);
      } catch (error) {
        console.error('Error in fetchNotifications:', error);
      }
    };

    if (user) {
      fetchDismissedNotifications().then(() => {
        if (profile) {
          fetchNotifications();
        }
      });
    }

    // Subscribe to real-time notification changes
    const channel = supabase
      .channel('notifications-panel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        if (profile) {
          fetchNotifications();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile, dismissedIds]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const removeNotification = async (id: string, isDynamic: boolean = false) => {
    if (!user) return;

    try {
      // For database notifications, record the dismissal
      if (!isDynamic) {
        const { error } = await supabase
          .from('dismissed_notifications')
          .insert({ user_id: user.id, notification_id: id });

        if (error) {
          console.error('Error dismissing notification:', error);
          toast.error('Failed to dismiss notification');
          return;
        }
      }

      // Update local state
      setDismissedIds(prev => new Set([...prev, id]));
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      toast.success('Notification dismissed');
    } catch (error) {
      console.error('Error removing notification:', error);
      toast.error('Failed to dismiss notification');
    }
  };

  const clearAllNotifications = async () => {
    if (!user) return;

    try {
      // Get all database notification ids that aren't dismissed yet
      const dbNotificationIds = notifications
        .filter(n => !n.isDynamic)
        .map(n => n.id);

      if (dbNotificationIds.length > 0) {
        const dismissals = dbNotificationIds.map(id => ({
          user_id: user.id,
          notification_id: id
        }));

        const { error } = await supabase
          .from('dismissed_notifications')
          .upsert(dismissals, { onConflict: 'user_id,notification_id' });

        if (error) {
          console.error('Error clearing notifications:', error);
          toast.error('Failed to clear notifications');
          return;
        }
      }

      // Update local state for all notifications including dynamic
      const allIds = notifications.map(n => n.id);
      setDismissedIds(prev => new Set([...prev, ...allIds]));
      setNotifications([]);
      toast.success('All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="pb-3 px-3 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-1 sm:gap-2 text-base sm:text-lg">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Notifications</span>
            <span className="sm:hidden">Notifs</span>
            {notifications.length > 0 && (
              <Badge variant="default" className="ml-1 sm:ml-2 text-xs px-1.5">
                {notifications.length}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-0.5 sm:gap-1">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-[10px] sm:text-xs h-7 px-2"
              >
                <span className="hidden sm:inline">Mark all read</span>
                <CheckCircle className="w-3 h-3 sm:hidden" />
              </Button>
            )}
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllNotifications}
                className="text-[10px] sm:text-xs h-7 px-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3 h-3 mr-0 sm:mr-1" />
                <span className="hidden sm:inline">Clear all</span>
              </Button>
            )}
          </div>
        </div>
        <CardDescription className="text-xs sm:text-sm mt-1">
          Stay updated with your account activity
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[70vh] sm:h-96">
          <div className="space-y-1 p-2 sm:p-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs sm:text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div 
                    className={`flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-muted/30' : ''
                    }`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-start justify-between gap-1 sm:gap-2">
                        <p className={`text-xs sm:text-sm font-medium leading-tight ${
                          !notification.read ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="w-5 h-5 sm:w-6 sm:h-6">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!notification.read && (
                                <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark as read
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => removeNotification(notification.id, notification.isDynamic)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {notification.message}
                      </p>
                      {notification.actionLabel && notification.actionUrl && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto p-0 text-[10px] sm:text-xs text-primary hover:text-primary-foreground"
                          asChild
                        >
                          <a href={notification.actionUrl}>
                            {notification.actionLabel}
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                  {index < notifications.length - 1 && <Separator className="my-1" />}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}