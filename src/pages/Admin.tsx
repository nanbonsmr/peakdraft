import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Bell, Percent, Users, Settings, Trash2 } from "lucide-react";
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

interface DiscountCode {
  id: string;
  code: string;
  discount_percent: number;
  max_uses?: number;
  used_count: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);

  // Form states
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "info",
    target_users: "all"
  });
  const [newDiscountCode, setNewDiscountCode] = useState({
    code: "",
    discount_percent: 10,
    max_uses: undefined as number | undefined,
    expires_at: ""
  });

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.rpc('is_admin', { user_uuid: user.id });
      if (error) throw error;
      setIsAdmin(data);
      if (data) {
        await loadData();
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    await Promise.all([loadNotifications(), loadDiscountCodes()]);
  };

  const loadNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading notifications:', error);
    } else {
      setNotifications(data || []);
    }
  };

  const loadDiscountCodes = async () => {
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading discount codes:', error);
    } else {
      setDiscountCodes(data || []);
    }
  };

  const createNotification = async () => {
    if (!newNotification.title || !newNotification.message) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .insert([newNotification]);

      if (error) throw error;

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

  const createDiscountCode = async () => {
    if (!newDiscountCode.code || newDiscountCode.discount_percent <= 0) return;

    try {
      const discountData = {
        ...newDiscountCode,
        expires_at: newDiscountCode.expires_at ? new Date(newDiscountCode.expires_at).toISOString() : null,
      };

      const { error } = await supabase
        .from('discount_codes')
        .insert([discountData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Discount code created successfully",
      });

      setNewDiscountCode({ code: "", discount_percent: 10, max_uses: undefined, expires_at: "" });
      await loadDiscountCodes();
    } catch (error) {
      console.error('Error creating discount code:', error);
      toast({
        title: "Error",
        description: "Failed to create discount code",
        variant: "destructive",
      });
    }
  };

  const toggleNotificationStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      await loadNotifications();
    } catch (error) {
      console.error('Error toggling notification status:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

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

  const deleteDiscountCode = async (id: string) => {
    try {
      const { error } = await supabase
        .from('discount_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Discount code deleted successfully",
      });
      await loadDiscountCodes();
    } catch (error) {
      console.error('Error deleting discount code:', error);
      toast({
        title: "Error",
        description: "Failed to delete discount code",
        variant: "destructive",
      });
    }
  };

  const toggleDiscountCodeStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('discount_codes')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      await loadDiscountCodes();
    } catch (error) {
      console.error('Error toggling discount code status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
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
          <p className="text-muted-foreground">Manage notifications and discount codes</p>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="discounts" className="flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Discount Codes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="discounts" className="space-y-6">
          {/* Create Discount Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Create New Discount Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount-code">Code</Label>
                  <Input
                    id="discount-code"
                    value={newDiscountCode.code}
                    onChange={(e) => setNewDiscountCode({ ...newDiscountCode, code: e.target.value.toUpperCase() })}
                    placeholder="DISCOUNT20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount-percent">Discount Percentage</Label>
                  <Input
                    id="discount-percent"
                    type="number"
                    min="1"
                    max="100"
                    value={newDiscountCode.discount_percent}
                    onChange={(e) => setNewDiscountCode({ ...newDiscountCode, discount_percent: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-uses">Max Uses (Optional)</Label>
                  <Input
                    id="max-uses"
                    type="number"
                    min="1"
                    value={newDiscountCode.max_uses || ""}
                    onChange={(e) => setNewDiscountCode({ ...newDiscountCode, max_uses: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires-at">Expiry Date (Optional)</Label>
                  <Input
                    id="expires-at"
                    type="datetime-local"
                    value={newDiscountCode.expires_at}
                    onChange={(e) => setNewDiscountCode({ ...newDiscountCode, expires_at: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={createDiscountCode} className="w-full">
                Create Discount Code
              </Button>
            </CardContent>
          </Card>

          {/* Existing Discount Codes */}
          <Card>
            <CardHeader>
              <CardTitle>Existing Discount Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {discountCodes.map((code) => (
                  <div key={code.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold font-mono">{code.code}</h3>
                        <Badge>{code.discount_percent}% OFF</Badge>
                        {code.max_uses && (
                          <Badge variant="outline">{code.used_count}/{code.max_uses} used</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={code.is_active}
                          onCheckedChange={() => toggleDiscountCodeStatus(code.id, code.is_active)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {code.is_active ? "Active" : "Inactive"}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteDiscountCode(code.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Created: {new Date(code.created_at).toLocaleDateString()}</span>
                      {code.expires_at && (
                        <span>Expires: {new Date(code.expires_at).toLocaleDateString()}</span>
                      )}
                      <span>Used: {code.used_count} times</span>
                    </div>
                  </div>
                ))}
                {discountCodes.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No discount codes found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
