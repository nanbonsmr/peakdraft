import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [serverVerifiedAdmin, setServerVerifiedAdmin] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!user?.id || !user?.email) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('admin-operations', {
          body: {
            action: 'check-admin',
            userId: user.id,
            userEmail: user.email
          }
        });

        if (!error && data?.isAdmin) {
          setServerVerifiedAdmin(true);
        }
      } catch (error) {
        console.error('Admin verification failed:', error);
      }
      setLoading(false);
    };

    if (user) {
      verifyAdmin();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
            <Loader2 className="relative h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!serverVerifiedAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Alert className="max-w-md border-destructive/30 bg-destructive/5 backdrop-blur-sm">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Access denied. You don't have admin privileges.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
        </div>
        
        <AdminSidebar />
        <SidebarInset className="flex-1 min-w-0">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border/30 bg-background/60 backdrop-blur-xl px-4 sm:px-6">
            <SidebarTrigger className="shrink-0" />
            <div className="h-5 w-px bg-border/40" />
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Shield className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="font-semibold text-sm sm:text-base truncate">Admin Dashboard</span>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
