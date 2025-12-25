import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  Bell,
  Settings,
  Trash2,
  Users,
  LayoutDashboard,
  RefreshCw,
  Crown,
  Shield,
  Loader2,
  Search,
  RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  target_users: string;
  is_active: boolean;
  created_at: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  subscription_plan: string;
  words_used: number;
  words_limit: number;
  created_at: string;
  subscription_end_date: string | null;
  role: string;
}

interface UserStats {
  totalUsers: number;
  freeUsers: number;
  basicUsers: number;
  proUsers: number;
  enterpriseUsers: number;
  premiumUsers: number;
  totalWordsUsed: number;
}

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [serverVerifiedAdmin, setServerVerifiedAdmin] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

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
          await Promise.all([
            loadNotifications(),
            loadUsers(),
            loadUserStats()
          ]);
        }
      }
      setLoading(false);
    };

    initAdmin();
  }, [isAdmin, user]);

  const refreshAllData = async () => {
    setRefreshing(true);
    await Promise.all([
      loadNotifications(),
      loadUsers(),
      loadUserStats()
    ]);
    setRefreshing(false);
    toast({ title: "Data refreshed" });
  };

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

  const loadUsers = async () => {
    if (!user?.id || !user?.email) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'get-users',
          userId: user.id,
          userEmail: user.email
        }
      });

      if (error) {
        console.error('Error loading users:', error);
        return;
      }

      setUsers(data?.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadUserStats = async () => {
    if (!user?.id || !user?.email) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'get-user-stats',
          userId: user.id,
          userEmail: user.email
        }
      });

      if (error) {
        console.error('Error loading user stats:', error);
        return;
      }

      setUserStats(data?.stats || null);
    } catch (error) {
      console.error('Error loading user stats:', error);
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
      const { error } = await supabase.functions.invoke('admin-operations', {
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
      const { error } = await supabase.functions.invoke('admin-operations', {
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

  const updateUserPlan = async (targetUserId: string, newPlan: string) => {
    if (!user?.id || !user?.email) return;

    try {
      const { error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'update-user-plan',
          userId: user.id,
          userEmail: user.email,
          data: { targetUserId, newPlan }
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `User plan updated to ${newPlan}`,
      });
      await Promise.all([loadUsers(), loadUserStats()]);
    } catch (error) {
      console.error('Error updating user plan:', error);
      toast({
        title: "Error",
        description: "Failed to update user plan",
        variant: "destructive",
      });
    }
  };

  const resetUserWords = async (targetUserId: string) => {
    if (!user?.id || !user?.email) return;

    try {
      const { error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'reset-user-words',
          userId: user.id,
          userEmail: user.email,
          data: { targetUserId }
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User word count reset to 0",
      });
      await loadUsers();
    } catch (error) {
      console.error('Error resetting user words:', error);
      toast({
        title: "Error",
        description: "Failed to reset user words",
        variant: "destructive",
      });
    }
  };

  const toggleUserRole = async (targetUserId: string, currentRole: string) => {
    if (!user?.id || !user?.email) return;

    const makeAdmin = currentRole !== 'admin';

    try {
      const { error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'toggle-user-role',
          userId: user.id,
          userEmail: user.email,
          data: { targetUserId, makeAdmin }
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `User role updated to ${makeAdmin ? 'admin' : 'user'}`,
      });
      await loadUsers();
    } catch (error) {
      console.error('Error toggling user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(u => 
    u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">Manage users and notifications</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={refreshAllData}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats?.totalUsers || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Premium Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{userStats?.premiumUsers || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Free Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats?.freeUsers || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Words Generated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats?.totalWordsUsed?.toLocaleString() || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Free</span>
                  <span className="text-sm font-medium">{userStats?.freeUsers || 0}</span>
                </div>
                <Progress value={userStats?.totalUsers ? (userStats.freeUsers / userStats.totalUsers) * 100 : 0} className="h-2" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Basic</span>
                  <span className="text-sm font-medium">{userStats?.basicUsers || 0}</span>
                </div>
                <Progress value={userStats?.totalUsers ? (userStats.basicUsers / userStats.totalUsers) * 100 : 0} className="h-2" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pro</span>
                  <span className="text-sm font-medium">{userStats?.proUsers || 0}</span>
                </div>
                <Progress value={userStats?.totalUsers ? (userStats.proUsers / userStats.totalUsers) * 100 : 0} className="h-2" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enterprise</span>
                  <span className="text-sm font-medium">{userStats?.enterpriseUsers || 0}</span>
                </div>
                <Progress value={userStats?.totalUsers ? (userStats.enterpriseUsers / userStats.totalUsers) * 100 : 0} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {notifications.filter(n => n.is_active).length}
                </div>
                <p className="text-sm text-muted-foreground">
                  of {notifications.length} total notifications
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {users.filter(u => {
                    const createdAt = new Date(u.created_at);
                    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return createdAt > oneWeekAgo;
                  }).length}
                </div>
                <p className="text-sm text-muted-foreground">
                  joined in the last 7 days
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Badge variant="secondary">{filteredUsers.length} users</Badge>
          </div>

          <Card>
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((userProfile) => (
                    <TableRow key={userProfile.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                            {userProfile.display_name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{userProfile.display_name || 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {userProfile.user_id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={userProfile.subscription_plan}
                          onValueChange={(value) => updateUserPlan(userProfile.user_id, value)}
                        >
                          <SelectTrigger className="w-[110px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-xs">
                            {userProfile.words_used?.toLocaleString()} / {userProfile.words_limit?.toLocaleString()}
                          </div>
                          <Progress 
                            value={(userProfile.words_used / userProfile.words_limit) * 100} 
                            className="h-1 w-20"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={userProfile.role === 'admin' ? 'default' : 'secondary'}
                          className="cursor-pointer"
                          onClick={() => toggleUserRole(userProfile.user_id, userProfile.role)}
                        >
                          {userProfile.role === 'admin' && <Crown className="h-3 w-3 mr-1" />}
                          {userProfile.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(userProfile.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => resetUserWords(userProfile.user_id)}
                          title="Reset word count"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          {/* Create Notification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Create New Notification
              </CardTitle>
              <CardDescription>Send notifications to your users</CardDescription>
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
              <CardDescription>{notifications.length} total notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{notification.title}</h3>
                          <Badge 
                            variant={
                              notification.type === 'success' ? 'default' :
                              notification.type === 'warning' ? 'secondary' :
                              notification.type === 'error' ? 'destructive' : 'outline'
                            }
                          >
                            {notification.type}
                          </Badge>
                          <Badge variant="outline">{notification.target_users}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Created: {format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={notification.is_active}
                            onCheckedChange={() => toggleNotificationStatus(notification.id, notification.is_active)}
                          />
                          <span className="text-sm text-muted-foreground w-16">
                            {notification.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
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
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No notifications found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
