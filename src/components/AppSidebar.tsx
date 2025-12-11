import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  PenTool,
  MessageSquare,
  Mail,
  Megaphone,
  BarChart3,
  CreditCard,
  Settings,
  Sparkles,
  Home,
  Shield,
  CheckSquare,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";


export function AppSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.rpc('is_admin', { user_uuid: user.id });
      if (error) throw error;
      setIsAdmin(data);
    } catch (error) {
      console.error('Error checking admin access:', error);
    }
  };

  const mainItems = [
    { title: "Dashboard", url: "/app", icon: Home },
    { title: "Templates", url: "/app/templates", icon: Sparkles },
    { title: "Tasks", url: "/app/tasks", icon: CheckSquare },
    { title: "Usage", url: "/app/usage", icon: BarChart3 },
    { title: "Pricing", url: "/app/pricing", icon: CreditCard },
    { title: "Settings", url: "/app/settings", icon: Settings },
  ];

  // Add admin item if user is admin
  if (isAdmin) {
    mainItems.push({
      title: "Admin",
      url: "/app/admin",
      icon: Shield,
    });
  }

  const isActive = (path: string) => currentPath === path;
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm" 
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200";

  return (
    <Sidebar className={state === "collapsed" ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-sidebar">
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="PeakDraft Logo" className="w-8 h-8 rounded-lg" />
            {state !== "collapsed" && (
              <div>
                <h1 className="font-bold text-lg text-sidebar-foreground">
                  PeakDraft
                </h1>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider px-2">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="w-4 h-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  );
}