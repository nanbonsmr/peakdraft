import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/ui/stats-card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Target,
  ArrowUpRight,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface UsageStats {
  totalContent: number;
  thisMonthContent: number;
  avgWordsPerContent: number;
  mostUsedTemplate: string;
}

export default function Usage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const wordsUsed = profile?.words_used || 0;
  const wordsLimit = profile?.words_limit || 500;
  const usagePercentage = (wordsUsed / wordsLimit) * 100;
  const wordsRemaining = wordsLimit - wordsUsed;

  useEffect(() => {
    const fetchUsageStats = async () => {
      if (!profile) return;

      try {
        // Get all content generations
        const { data: allContent, error } = await supabase
          .from('content_generations')
          .select('*')
          .eq('user_id', profile.user_id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Get this month's content
        const thisMonth = new Date();
        thisMonth.setDate(1);
        const thisMonthContent = allContent?.filter(content => 
          new Date(content.created_at) >= thisMonth
        ) || [];

        // Calculate average words per content
        const totalWords = allContent?.reduce((sum, content) => sum + (content.word_count || 0), 0) || 0;
        const avgWordsPerContent = allContent?.length ? Math.round(totalWords / allContent.length) : 0;

        // Find most used template
        const templateCounts = allContent?.reduce((acc, content) => {
          acc[content.template_type] = (acc[content.template_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};
        
        const mostUsedTemplate = Object.entries(templateCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

        setStats({
          totalContent: allContent?.length || 0,
          thisMonthContent: thisMonthContent.length,
          avgWordsPerContent,
          mostUsedTemplate
        });

        // Set recent activity (last 10 items)
        setRecentActivity(allContent?.slice(0, 10) || []);
      } catch (error) {
        console.error('Error fetching usage stats:', error);
      }
    };

    fetchUsageStats();
  }, [profile]);

  const getUsageColor = () => {
    if (usagePercentage >= 90) return 'text-red-600';
    if (usagePercentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUsageStatus = () => {
    if (usagePercentage >= 90) return 'Critical';
    if (usagePercentage >= 70) return 'High';
    return 'Good';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Usage Analytics</h2>
          <p className="text-muted-foreground">
            Track your content generation and word usage statistics.
          </p>
        </div>
        <Button asChild>
          <Link to="/app/pricing">
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Link>
        </Button>
      </div>

      {/* Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Words Used"
          value={wordsUsed.toLocaleString()}
          description={`${wordsRemaining.toLocaleString()} remaining`}
          icon={<FileText className="w-4 h-4 text-primary" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Content Generated"
          value={stats?.totalContent || 0}
          description="Total pieces created"
          icon={<Sparkles className="w-4 h-4 text-primary" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="This Month"
          value={stats?.thisMonthContent || 0}
          description="Pieces this month"
          icon={<Calendar className="w-4 h-4 text-primary" />}
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Avg Words/Piece"
          value={stats?.avgWordsPerContent || 0}
          description="Average length"
          icon={<BarChart3 className="w-4 h-4 text-primary" />}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Usage Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Word Usage Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Word Usage Breakdown
            </CardTitle>
            <CardDescription>
              Current usage against your monthly limit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Usage Progress</span>
                <Badge variant={usagePercentage >= 90 ? 'destructive' : usagePercentage >= 70 ? 'default' : 'secondary'}>
                  {getUsageStatus()}
                </Badge>
              </div>
              <Progress value={usagePercentage} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{wordsUsed.toLocaleString()} used</span>
                <span className={getUsageColor()}>
                  {Math.round(usagePercentage)}%
                </span>
                <span>{wordsLimit.toLocaleString()} limit</span>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Plan Type</span>
                <Badge variant="outline" className="capitalize">
                  {profile?.subscription_plan || 'free'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Most Used Template</span>
                <span className="text-sm font-medium capitalize">
                  {stats?.mostUsedTemplate || 'None'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest content generations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No content generated yet. Start creating!
                </p>
              ) : (
                recentActivity.slice(0, 5).map((content, index) => (
                  <div key={content.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {content.template_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {content.word_count} words
                        </span>
                      </div>
                      <p className="text-sm line-clamp-1">
                        {content.prompt}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">
                      {new Date(content.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}