import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Settings, LogOut, Bell, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { NotificationPanel } from "./NotificationPanel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user || !profile) return;
      
      // Fetch dismissed notifications
      const { data: dismissedData } = await supabase
        .from('dismissed_notifications')
        .select('notification_id')
        .eq('user_id', user.id);
      
      const dismissedIds = new Set(dismissedData?.map(d => d.notification_id) || []);
      
      // Fetch active notifications
      const { data: dbNotifications, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('is_active', true);
      
      if (!error && dbNotifications) {
        // Filter out dismissed notifications
        const activeNotifications = dbNotifications.filter(n => !dismissedIds.has(n.id));
        
        // Add dynamic notifications count based on user state
        let dynamicCount = 0;
        if (profile.words_used === 0 && !dismissedIds.has('welcome')) dynamicCount++;
        if (profile.words_used && profile.words_limit) {
          const usage = (profile.words_used / profile.words_limit) * 100;
          if (usage >= 90 && !dismissedIds.has('usage-critical')) dynamicCount++;
          else if (usage >= 75 && !dismissedIds.has('usage-warning')) dynamicCount++;
        }
        setUnreadCount(activeNotifications.length + dynamicCount);
      }
    };

    fetchUnreadCount();

    // Subscribe to real-time notification changes
    const notifChannel = supabase
      .channel('notifications-header')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchUnreadCount();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dismissed_notifications' }, () => {
        fetchUnreadCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(notifChannel);
    };
  }, [user, profile]);
  
  const handleSignOut = async () => {
    await signOut();
  };

  const handleSettingsClick = () => {
    navigate('/app/settings');
  };

  const handleBillingClick = () => {
    navigate('/app/pricing');
  };
  
  const initials = profile?.display_name
    ? profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  const wordsUsed = profile?.words_used || 0;
  const wordsLimit = profile?.words_limit || 500;

  return (
    <header className="flex h-16 items-center gap-2 sm:gap-4 border-b px-4 sm:px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger />
      <div className="flex-1" />
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Usage Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-gradient-primary/10 rounded-lg border">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <span className="text-sm font-medium">{wordsUsed.toLocaleString()} / {wordsLimit.toLocaleString()} words used</span>
        </div>

        {/* Mobile Usage Badge */}
        <div className="flex lg:hidden items-center gap-1 px-2 py-1 bg-gradient-primary/10 rounded border">
          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
          <span className="text-xs font-medium">{Math.round((wordsUsed / wordsLimit) * 100)}%</span>
        </div>

        {/* Notifications */}
        <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 min-w-5 p-0 text-xs flex items-center justify-center"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80 p-0" align="end">
            <NotificationPanel />
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-primary text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profile?.display_name || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSettingsClick}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleBillingClick}>
              <CreditCard className="w-4 h-4 mr-2" />
              Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}