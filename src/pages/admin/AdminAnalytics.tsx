import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, Users, FileText, Image, MessageSquare, 
  TrendingUp, Calendar, Clock, Zap, Activity
} from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";

interface AnalyticsData {
  totalUsers: number;
  freeUsers: number;
  basicUsers: number;
  proUsers: number;
  enterpriseUsers: number;
  premiumUsers: number;
  totalWordsUsed: number;
  totalContentGenerations: number;
  totalImageGenerations: number;
  totalChatConversations: number;
  recentSignups: number;
  contentLast7Days: number;
  imagesLast7Days: number;
  chatsLast7Days: number;
  topTemplates: { template_type: string; count: number }[];
  dailyActivity: { date: string; content: number; images: number; chats: number }[];
}

export default function AdminAnalytics() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user?.id || !user?.email) return;

      try {
        // Load user stats
        const { data: statsData } = await supabase.functions.invoke('admin-operations', {
          body: { action: 'get-user-stats', userId: user.id, userEmail: user.email }
        });

        // Load content generation stats
        const { data: contentData } = await supabase.functions.invoke('admin-operations', {
          body: { action: 'get-analytics', userId: user.id, userEmail: user.email }
        });

        const stats = statsData?.stats;
        const analytics = contentData?.analytics;

        setData({
          totalUsers: stats?.totalUsers || 0,
          freeUsers: stats?.freeUsers || 0,
          basicUsers: stats?.basicUsers || 0,
          proUsers: stats?.proUsers || 0,
          enterpriseUsers: stats?.enterpriseUsers || 0,
          premiumUsers: stats?.premiumUsers || 0,
          totalWordsUsed: stats?.totalWordsUsed || 0,
          totalContentGenerations: analytics?.totalContentGenerations || 0,
          totalImageGenerations: analytics?.totalImageGenerations || 0,
          totalChatConversations: analytics?.totalChatConversations || 0,
          recentSignups: analytics?.recentSignups || 0,
          contentLast7Days: analytics?.contentLast7Days || 0,
          imagesLast7Days: analytics?.imagesLast7Days || 0,
          chatsLast7Days: analytics?.chatsLast7Days || 0,
          topTemplates: analytics?.topTemplates || [],
          dailyActivity: analytics?.dailyActivity || [],
        });
      } catch (error) {
        console.error('Error loading analytics:', error);
      }
      setLoading(false);
    };

    loadAnalytics();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground/80 mt-1">Loading platform analytics...</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse border-border/30 bg-background/60 backdrop-blur-sm">
              <CardContent className="p-5"><div className="h-20 bg-muted/50 rounded-xl" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const overviewCards = [
    { label: "Total Content", value: data?.totalContentGenerations || 0, icon: FileText, gradient: "from-primary/15 to-primary/5", iconBg: "bg-primary/15", iconColor: "text-primary", borderColor: "border-primary/20", sub: `${data?.contentLast7Days || 0} this week` },
    { label: "Images Generated", value: data?.totalImageGenerations || 0, icon: Image, gradient: "from-emerald-500/15 to-emerald-500/5", iconBg: "bg-emerald-500/15", iconColor: "text-emerald-500", borderColor: "border-emerald-500/20", sub: `${data?.imagesLast7Days || 0} this week` },
    { label: "AI Chats", value: data?.totalChatConversations || 0, icon: MessageSquare, gradient: "from-violet-500/15 to-violet-500/5", iconBg: "bg-violet-500/15", iconColor: "text-violet-500", borderColor: "border-violet-500/20", sub: `${data?.chatsLast7Days || 0} this week` },
    { label: "New Users (7d)", value: data?.recentSignups || 0, icon: TrendingUp, gradient: "from-amber-500/15 to-amber-500/5", iconBg: "bg-amber-500/15", iconColor: "text-amber-500", borderColor: "border-amber-500/20", sub: `${data?.totalUsers || 0} total` },
  ];

  const conversionRate = data?.totalUsers ? Math.round((data.premiumUsers / data.totalUsers) * 100) : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
        <p className="text-sm sm:text-base text-muted-foreground/80 mt-1">Platform usage and performance metrics.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {overviewCards.map((stat) => (
          <Card key={stat.label} className={`group bg-gradient-to-br ${stat.gradient} ${stat.borderColor} border backdrop-blur-sm hover:shadow-lg transition-all duration-300`}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground/80 truncate">{stat.label}</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-1">{stat.sub}</p>
                </div>
                <div className={`p-2.5 ${stat.iconBg} rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* User Distribution */}
        <Card className="border-border/30 bg-background/60 backdrop-blur-sm">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="flex items-center gap-2.5 text-base sm:text-lg">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              User Distribution
              <Badge variant="secondary" className="ml-auto text-xs">{data?.totalUsers || 0} total</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
            {[
              { label: "Free", count: data?.freeUsers || 0, cls: "" },
              { label: "Basic", count: data?.basicUsers || 0, cls: "[&>div]:bg-blue-500" },
              { label: "Pro", count: data?.proUsers || 0, cls: "[&>div]:bg-violet-500" },
              { label: "Enterprise", count: data?.enterpriseUsers || 0, cls: "[&>div]:bg-amber-500" },
            ].map((tier) => (
              <div key={tier.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs sm:text-sm font-medium">{tier.label}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground/70">
                    {tier.count} ({data?.totalUsers ? Math.round((tier.count / data.totalUsers) * 100) : 0}%)
                  </span>
                </div>
                <Progress value={data?.totalUsers ? (tier.count / data.totalUsers) * 100 : 0} className={`h-2 rounded-full ${tier.cls}`} />
              </div>
            ))}
            <div className="pt-2 border-t border-border/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Conversion Rate</span>
                <Badge variant={conversionRate > 10 ? "default" : "secondary"}>{conversionRate}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Templates */}
        <Card className="border-border/30 bg-background/60 backdrop-blur-sm">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="flex items-center gap-2.5 text-base sm:text-lg">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              Top Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
            {data?.topTemplates && data.topTemplates.length > 0 ? (
              <div className="space-y-3">
                {data.topTemplates.slice(0, 8).map((template, index) => {
                  const maxCount = data.topTemplates[0]?.count || 1;
                  return (
                    <div key={template.template_type} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground/60 w-5 text-right">{index + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs sm:text-sm font-medium truncate capitalize">{template.template_type.replace(/-/g, ' ')}</span>
                          <span className="text-xs text-muted-foreground/70">{template.count}</span>
                        </div>
                        <Progress value={(template.count / maxCount) * 100} className="h-1.5 rounded-full" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground/60 text-center py-8">No template usage data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Platform Metrics */}
      <Card className="border-border/30 bg-background/60 backdrop-blur-sm">
        <CardHeader className="p-5 sm:p-6">
          <CardTitle className="flex items-center gap-2.5 text-base sm:text-lg">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            Platform Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Words Generated", value: (data?.totalWordsUsed || 0).toLocaleString(), icon: FileText },
              { label: "Avg Words/User", value: data?.totalUsers ? Math.round((data.totalWordsUsed || 0) / data.totalUsers).toLocaleString() : "0", icon: TrendingUp },
              { label: "Premium Users", value: data?.premiumUsers || 0, icon: Zap },
              { label: "Active Templates", value: data?.topTemplates?.length || 0, icon: BarChart3 },
            ].map((metric) => (
              <div key={metric.label} className="p-4 rounded-xl border border-border/30 bg-background/40 backdrop-blur-sm text-center">
                <metric.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-lg sm:text-xl font-bold">{metric.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-1">{metric.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
