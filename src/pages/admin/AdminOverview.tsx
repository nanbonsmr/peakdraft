import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Crown, FileText, TrendingUp, Activity, Zap } from "lucide-react";

interface UserStats {
  totalUsers: number;
  freeUsers: number;
  basicUsers: number;
  proUsers: number;
  enterpriseUsers: number;
  premiumUsers: number;
  totalWordsUsed: number;
}

export default function AdminOverview() {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id || !user?.email) return;

      try {
        const { data, error } = await supabase.functions.invoke('admin-operations', {
          body: {
            action: 'get-user-stats',
            userId: user.id,
            userEmail: user.email
          }
        });

        if (!error && data?.stats) {
          setUserStats(data.stats);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
      setLoading(false);
    };

    loadStats();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse border-border/30 bg-background/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="h-20 bg-muted/50 rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: userStats?.totalUsers || 0,
      icon: Users,
      gradient: "from-primary/15 to-primary/5",
      iconBg: "bg-primary/15",
      iconColor: "text-primary",
      borderColor: "border-primary/20",
    },
    {
      label: "Premium Users",
      value: userStats?.premiumUsers || 0,
      icon: Crown,
      gradient: "from-amber-500/15 to-amber-500/5",
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-500",
      borderColor: "border-amber-500/20",
    },
    {
      label: "Words Generated",
      value: userStats?.totalWordsUsed?.toLocaleString() || 0,
      icon: FileText,
      gradient: "from-emerald-500/15 to-emerald-500/5",
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-500",
      borderColor: "border-emerald-500/20",
    },
    {
      label: "Conversion Rate",
      value: `${userStats?.totalUsers ? Math.round((userStats.premiumUsers / userStats.totalUsers) * 100) : 0}%`,
      icon: TrendingUp,
      gradient: "from-violet-500/15 to-violet-500/5",
      iconBg: "bg-violet-500/15",
      iconColor: "text-violet-500",
      borderColor: "border-violet-500/20",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-sm sm:text-base text-muted-foreground/80 mt-1">Welcome back! Here's what's happening with PeakDraft.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className={`group bg-gradient-to-br ${stat.gradient} ${stat.borderColor} border backdrop-blur-sm hover:shadow-lg transition-all duration-300`}
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground/80 truncate">{stat.label}</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 truncate">{stat.value}</p>
                </div>
                <div className={`p-2.5 sm:p-3 ${stat.iconBg} rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscription Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="border-border/30 bg-background/60 backdrop-blur-sm">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="flex items-center gap-2.5 text-base sm:text-lg">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              Subscription Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
            {[
              { label: "Free Users", count: userStats?.freeUsers || 0, cls: "" },
              { label: "Basic", count: userStats?.basicUsers || 0, cls: "[&>div]:bg-blue-500" },
              { label: "Pro", count: userStats?.proUsers || 0, cls: "[&>div]:bg-violet-500" },
              { label: "Enterprise", count: userStats?.enterpriseUsers || 0, cls: "[&>div]:bg-amber-500" },
            ].map((tier) => (
              <div key={tier.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs sm:text-sm font-medium">{tier.label}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground/70">{tier.count}</span>
                </div>
                <Progress 
                  value={userStats?.totalUsers ? (tier.count / userStats.totalUsers) * 100 : 0}
                  className={`h-2 rounded-full ${tier.cls}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/30 bg-background/60 backdrop-blur-sm">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="flex items-center gap-2.5 text-base sm:text-lg">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "/admin/users", icon: Users, label: "Manage Users" },
                { href: "/admin/promotions", icon: Activity, label: "Promotions" },
                { href: "/admin/notifications", icon: FileText, label: "Notifications" },
                { href: "/admin/templates", icon: Crown, label: "Templates" },
              ].map((action) => (
                <a
                  key={action.href}
                  href={action.href}
                  className="group p-4 rounded-xl border border-border/30 bg-background/40 backdrop-blur-sm hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
                >
                  <action.icon className="h-5 w-5 mb-2 text-primary group-hover:scale-110 transition-transform duration-200" />
                  <p className="font-medium text-xs sm:text-sm">{action.label}</p>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
