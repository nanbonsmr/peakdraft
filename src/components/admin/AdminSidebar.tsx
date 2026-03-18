import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Users, 
  Bell, 
  Layout, 
  Megaphone, 
  Shield, 
  Settings,
  BarChart3,
  ArrowLeft,
  Sparkles,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const adminNavItems = [
  { title: "Overview", icon: LayoutDashboard, path: "/admin" },
  { title: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { title: "Users", icon: Users, path: "/admin/users" },
  { title: "Blog", icon: FileText, path: "/admin/blog" },
  { title: "Templates", icon: Layout, path: "/admin/templates" },
  { title: "Promotions", icon: Megaphone, path: "/admin/promotions" },
  { title: "Notifications", icon: Bell, path: "/admin/notifications" },
  { title: "Settings", icon: Settings, path: "/admin/settings" },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/admin") return currentPath === "/admin";
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar className="border-r border-border/30 bg-background/80 backdrop-blur-xl">
      <SidebarHeader className="p-4 sm:p-5 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <Shield className="h-5 w-5 text-primary" />
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-base sm:text-lg truncate">Admin Panel</h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground/70 truncate flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              PeakDraft Management
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 sm:px-3 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground/60 px-3 mb-1">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {adminNavItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      className={`w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${
                        active
                          ? "bg-primary/10 text-primary border border-primary/20 shadow-sm backdrop-blur-sm"
                          : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <item.icon className={`h-4 w-4 shrink-0 transition-transform duration-200 ${active ? "scale-110" : ""}`} />
                      <span className={`truncate ${active ? "font-semibold" : "font-medium"}`}>{item.title}</span>
                      {active && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 sm:p-4 border-t border-border/30">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-sm rounded-xl border-border/40 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
          onClick={() => navigate("/app")}
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span className="truncate">Back to Dashboard</span>
        </Button>
        <div className="flex items-center gap-2 mt-3 sm:mt-4 opacity-50">
          <img src={logo} alt="PeakDraft" className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="text-[10px] sm:text-xs text-muted-foreground truncate">PeakDraft Admin</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
