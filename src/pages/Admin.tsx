import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Bell, Settings, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  target_users: string;
  is_active: boolean;
  created_at: string;
}

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [serverVerifiedAdmin, setServerVerifiedAdmin] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Form states
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "info",
    target_users: "all"
  });

  // Server-side admin verification
  const verifyAdminServer = async () => {
    if (!user?.id || !user?.email) return false;

    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'check-admin',
          userId: user.id,
          userEmail: user.email
        }
      });

      if (error) {
        console.error('Admin verification error:', error);
        return false;
      }

      return data?.isAdmin === true;
    } catch (error) {
      console.error('Admin verification failed:', error);
      return false;
    }
  };

  useEffect(() => {
    const initAdmin = async () => {
      if (isAdmin && user) {
        const isVerified = await verifyAdminServer();
        setServerVerifiedAdmin(isVerified);
        if (isVerified) {
          await loadNotifications();
        }
      }
      setLoading(false);
    };

    initAdmin();
  }, [isAdmin, user]);

  const loadNotifications = async () => {
    if (!user?.id || !user?.email) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'get-notifications',
          userId: user.id,
          userEmail: user.email
        }
      });

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      setNotifications(data?.notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const createNotification = async () => {
    if (!newNotification.title || !newNotification.message) return;
    if (!user?.id || !user?.email) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'create-notification',
          userId: user.id,
          userEmail: user.email,
          data: newNotification
        }
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Success",
        description: "Notification created successfully",
      });

      setNewNotification({ title: "", message: "", type: "info", target_users: "all" });
      await loadNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast({
        title: "Error",
        description: "Failed to create notification",
        variant: "destructive",
      });
    }
  };

  const toggleNotificationStatus = async (id: string, currentStatus: boolean) => {
    if (!user?.id || !user?.email) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'toggle-notification',
          userId: user.id,
          userEmail: user.email,
          data: { notificationId: id, isActive: currentStatus }
        }
      });

      if (error) throw error;
      await loadNotifications();
    } catch (error) {
      console.error('Error toggling notification status:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!user?.id || !user?.email) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'delete-notification',
          userId: user.id,
          userEmail: user.email,
          data: { notificationId: id }
        }
      });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Notification deleted successfully",
      });
      await loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin || !serverVerifiedAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. You don't have admin privileges.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage notifications</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Create Notification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Create New Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="notification-title">Title</Label>
                <Input
                  id="notification-title"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  placeholder="Notification title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notification-type">Type</Label>
                <Select 
                  value={newNotification.type} 
                  onValueChange={(value) => setNewNotification({ ...newNotification, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notification-message">Message</Label>
              <Textarea
                id="notification-message"
                value={newNotification.message}
                onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                placeholder="Notification message"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-users">Target Users</Label>
              <Select 
                value={newNotification.target_users} 
                onValueChange={(value) => setNewNotification({ ...newNotification, target_users: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="premium">Premium Users</SelectItem>
                  <SelectItem value="free">Free Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={createNotification} className="w-full">
              Create Notification
            </Button>
          </CardContent>
        </Card>

        {/* Existing Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Existing Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{notification.title}</h3>
                      <Badge variant={notification.type as any}>{notification.type}</Badge>
                      <Badge variant="outline">{notification.target_users}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={notification.is_active}
                        onCheckedChange={() => toggleNotificationStatus(notification.id, notification.is_active)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {notification.is_active ? "Active" : "Inactive"}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No notifications found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
