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
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionLabel?: string;
  actionUrl?: string;
}

export function NotificationPanel() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
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

        // Convert database notifications to component format
        const formattedNotifications: Notification[] = (dbNotifications || []).map(notif => ({
          id: notif.id,
          type: notif.type as Notification['type'],
          title: notif.title,
          message: notif.message,
          timestamp: new Date(notif.created_at),
          read: false
        }));

        // Add dynamic notifications based on user state
        const dynamicNotifications: Notification[] = [];

        // Welcome notification for new users
        if (profile?.words_used === 0) {
          dynamicNotifications.push({
            id: 'welcome',
            type: 'info',
            title: 'Welcome to QuickWrite AI!',
            message: 'Start creating amazing content with our AI-powered templates.',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            read: false,
            actionLabel: 'Get Started',
            actionUrl: '/app/templates'
          });
        }

        // Usage warnings
        if (profile?.words_used && profile?.words_limit) {
          const usagePercentage = (profile.words_used / profile.words_limit) * 100;
          
          if (usagePercentage >= 90) {
            dynamicNotifications.push({
              id: 'usage-critical',
              type: 'warning',
              title: 'Word Limit Almost Reached',
              message: `You've used ${Math.round(usagePercentage)}% of your monthly word limit. Consider upgrading your plan.`,
              timestamp: new Date(Date.now() - 30 * 60 * 1000),
              read: false,
              actionLabel: 'Upgrade Plan',
              actionUrl: '/app/pricing'
            });
          } else if (usagePercentage >= 75) {
            dynamicNotifications.push({
              id: 'usage-warning',
              type: 'info',
              title: 'Word Usage Update',
              message: `You've used ${Math.round(usagePercentage)}% of your monthly word limit.`,
              timestamp: new Date(Date.now() - 60 * 60 * 1000),
              read: false
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

    if (profile) {
      fetchNotifications();
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
  }, [profile]);

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

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
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
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="w-5 h-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
        <CardDescription>
          Stay updated with your account activity and new features
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-1 p-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div 
                    className={`flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-muted/30' : ''
                    }`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium leading-none ${
                          !notification.read ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="w-6 h-6">
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
                                onClick={() => removeNotification(notification.id)}
                                className="text-red-600"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {notification.message}
                      </p>
                      {notification.actionLabel && notification.actionUrl && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto p-0 text-xs text-primary hover:text-primary-foreground"
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