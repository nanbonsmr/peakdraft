import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  CreditCard,
  Settings,
  Sparkles,
  Home,
  Shield,
  CheckSquare,
  Wrench,
  Wand2,
  ImageIcon,
  MessageCircle,
  Building2,
  ChevronRight,
  Workflow,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { WordUsageProgress } from "@/components/WordUsageProgress";
import { Badge } from "@/components/ui/badge";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";


export function AppSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isAdmin, setIsAdmin] = useState(false);
  const collapsed = state === "collapsed";

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

  const creativeItems = [
    { title: "AI Chat", url: "/app/chat", icon: MessageCircle, badge: "Pro", badgeVariant: "pro" as const },
    { title: "Templates", url: "/app/templates", icon: Sparkles, badge: "25+", badgeVariant: "default" as const },
    { title: "Image Gen", url: "/app/image-generation", icon: ImageIcon, badge: "Pro", badgeVariant: "pro" as const },
    { title: "Free AI Tools", url: "/app/free-ai-tools", icon: Wand2, badge: "Free", badgeVariant: "free" as const },
    { title: "Humanizer", url: "/app/humanizer", icon: Shield, badge: "New", badgeVariant: "new" as const },
  ];

  const workspaceItems = [
    { title: "Infobase", url: "/app/infobase", icon: Building2, badge: "New", badgeVariant: "new" as const },
    { title: "Tools", url: "/app/tools", icon: Wrench, badge: "New", badgeVariant: "new" as const },
    { title: "Tasks", url: "/app/tasks", icon: CheckSquare },
    { title: "Workflow", url: "/app/workflow", icon: Workflow, badge: "New", badgeVariant: "new" as const },
  ];

  const accountItems = [
    { title: "Usage", url: "/app/usage", icon: BarChart3 },
    { title: "Pricing", url: "/app/pricing", icon: CreditCard, badge: "Pro", badgeVariant: "pro" as const },
    { title: "Settings", url: "/app/settings", icon: Settings },
  ];

  if (isAdmin) {
    accountItems.push({ title: "Admin", url: "/admin", icon: Shield });
  }

  const isActive = (path: string) => currentPath === path;

  const getBadgeClasses = (variant?: string) => {
    switch (variant) {
      case 'free': return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20 dark:bg-emerald-400/15 dark:text-emerald-400';
      case 'new': return 'bg-amber-500/15 text-amber-600 border-amber-500/20 dark:bg-amber-400/15 dark:text-amber-400';
      case 'pro': return 'bg-violet-500/15 text-violet-600 border-violet-500/20 dark:bg-violet-400/15 dark:text-violet-400';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const renderItem = (item: { title: string; url: string; icon: any; badge?: string; badgeVariant?: string }) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.url}
          end
          className={({ isActive: active }) =>
            `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
              active
                ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary font-semibold shadow-sm shadow-primary/5 border border-primary/10"
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
            }`
          }
        >
          <item.icon className={`w-[18px] h-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110 ${
            isActive(item.url) ? 'text-primary' : ''
          }`} />
          {!collapsed && (
            <span className="flex items-center justify-between flex-1 min-w-0">
              <span className="truncate">{item.title}</span>
              <span className="flex items-center gap-1.5">
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className={`text-[9px] px-1.5 py-0 h-[18px] font-semibold border ${getBadgeClasses(item.badgeVariant)}`}
                  >
                    {item.badge}
                  </Badge>
                )}
                {isActive(item.url) && (
                  <ChevronRight className="w-3.5 h-3.5 text-primary/60" />
                )}
              </span>
            </span>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border/50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Logo */}
        <div className="p-4 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img src="/favicon.png" alt="PeakDraft Logo" className="w-9 h-9 rounded-xl shadow-md ring-1 ring-primary/10" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-sidebar" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-lg tracking-tight text-sidebar-foreground">
                  PeakDraft
                </h1>
                <p className="text-[10px] text-muted-foreground/60 font-medium -mt-0.5">AI Writing Platform</p>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard */}
        <div className="px-3 pt-1 pb-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/app"
                  end
                  className={({ isActive: active }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/25"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                    }`
                  }
                >
                  <Home className="w-[18px] h-[18px] shrink-0" />
                  {!collapsed && <span>Dashboard</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>

        {/* Creative Tools */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-[0.12em] px-4 mb-0.5">
            Create
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {creativeItems.map(renderItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Workspace */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-[0.12em] px-4 mb-0.5">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaceItems.map(renderItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-[0.12em] px-4 mb-0.5">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map(renderItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Word Usage Progress */}
        {!collapsed && (
          <div className="mt-auto p-3 pt-2">
            <div className="rounded-xl bg-sidebar-accent/50 border border-sidebar-border/50 p-3">
              <WordUsageProgress compact />
            </div>
          </div>
        )}

      </SidebarContent>
    </Sidebar>
  );
}
