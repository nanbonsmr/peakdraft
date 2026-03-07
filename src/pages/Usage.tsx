import { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart3, TrendingUp, Calendar, Target, ArrowUpRight, FileText, 
  Clock, Sparkles, AlertTriangle, PieChart, Activity, Flame,
  ChevronUp, ChevronDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { format, subDays, startOfDay, startOfWeek, startOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, AreaChart, Area, Legend } from 'recharts';

interface ContentGeneration {
  id: string;
  template_type: string;
  prompt: string;
  word_count: number;
  created_at: string;
  language: string | null;
}

const TEMPLATE_COLORS = [
  'hsl(var(--primary))',
  'hsl(210, 80%, 55%)',
  'hsl(150, 60%, 45%)',
  'hsl(45, 90%, 50%)',
  'hsl(0, 70%, 55%)',
  'hsl(270, 60%, 55%)',
  'hsl(180, 50%, 45%)',
  'hsl(330, 70%, 55%)',
  'hsl(30, 80%, 50%)',
  'hsl(120, 50%, 40%)',
];

export default function Usage() {
  const { profile } = useAuth();
  const [allContent, setAllContent] = useState<ContentGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const wordsUsed = profile?.words_used || 0;
  const wordsLimit = profile?.words_limit || 5000;
  const usagePercentage = Math.min((wordsUsed / wordsLimit) * 100, 100);
  const wordsRemaining = Math.max(0, wordsLimit - wordsUsed);

  useEffect(() => {
    const fetchContent = async () => {
      if (!profile) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('content_generations')
        .select('id, template_type, prompt, word_count, created_at, language')
        .eq('user_id', profile.user_id)
        .order('created_at', { ascending: false });
      if (!error && data) setAllContent(data);
      setLoading(false);
    };
    fetchContent();
  }, [profile]);

  // Filter content by time range
  const filteredContent = useMemo(() => {
    if (timeRange === 'all') return allContent;
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoff = subDays(new Date(), days);
    return allContent.filter(c => new Date(c.created_at) >= cutoff);
  }, [allContent, timeRange]);

  // Daily usage chart data
  const dailyChartData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 60;
    const interval = { start: subDays(new Date(), days), end: new Date() };
    const dayArray = eachDayOfInterval(interval);
    
    return dayArray.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      const dayContent = allContent.filter(c => {
        const d = new Date(c.created_at);
        return d >= dayStart && d < dayEnd;
      });
      
      return {
        date: format(day, days <= 14 ? 'EEE dd' : 'MMM dd'),
        words: dayContent.reduce((sum, c) => sum + (c.word_count || 0), 0),
        count: dayContent.length,
      };
    });
  }, [allContent, timeRange]);

  // Template breakdown
  const templateBreakdown = useMemo(() => {
    const map: Record<string, { words: number; count: number }> = {};
    filteredContent.forEach(c => {
      const type = c.template_type || 'unknown';
      if (!map[type]) map[type] = { words: 0, count: 0 };
      map[type].words += c.word_count || 0;
      map[type].count += 1;
    });
    return Object.entries(map)
      .map(([name, data], i) => ({
        name: name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        rawName: name,
        ...data,
        color: TEMPLATE_COLORS[i % TEMPLATE_COLORS.length],
      }))
      .sort((a, b) => b.words - a.words);
  }, [filteredContent]);

  // Stats
  const totalWordsGenerated = filteredContent.reduce((sum, c) => sum + (c.word_count || 0), 0);
  const avgWordsPerPiece = filteredContent.length ? Math.round(totalWordsGenerated / filteredContent.length) : 0;
  const todayContent = allContent.filter(c => new Date(c.created_at) >= startOfDay(new Date()));
  const todayWords = todayContent.reduce((sum, c) => sum + (c.word_count || 0), 0);

  // Streak calculation
  const streak = useMemo(() => {
    let count = 0;
    let day = startOfDay(new Date());
    while (true) {
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      const hasContent = allContent.some(c => {
        const d = new Date(c.created_at);
        return d >= day && d < nextDay;
      });
      if (!hasContent && count > 0) break;
      if (hasContent) count++;
      if (!hasContent && count === 0) break; // no content today
      day.setDate(day.getDate() - 1);
    }
    return count;
  }, [allContent]);

  const getUsageColor = () => {
    if (usagePercentage >= 90) return 'text-destructive';
    if (usagePercentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getProgressColor = () => {
    if (usagePercentage >= 90) return 'bg-destructive';
    if (usagePercentage >= 70) return 'bg-yellow-500';
    return 'bg-primary';
  };

  return (
    <>
      <Helmet>
        <title>Usage Analytics - Word Usage & Content Stats | PeakDraft</title>
        <meta name="description" content="Track your AI content generation usage, word consumption, and template analytics with detailed charts and insights." />
      </Helmet>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-0.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Usage Analytics</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Track your content generation, word consumption, and trends.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button asChild>
              <Link to="/app/pricing">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Upgrade
              </Link>
            </Button>
          </div>
        </div>

        {/* Usage Alert */}
        {usagePercentage >= 80 && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {usagePercentage >= 95 
                    ? "You've almost reached your word limit!" 
                    : `You've used ${Math.round(usagePercentage)}% of your word limit.`}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {wordsRemaining.toLocaleString()} words remaining. Upgrade for more capacity.
                </p>
              </div>
              <Button size="sm" asChild>
                <Link to="/app/pricing">Upgrade</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Word Usage Gauge */}
          <Card className="col-span-2 lg:col-span-1 row-span-1">
            <CardContent className="p-5 flex flex-col items-center justify-center h-full">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
                    strokeDasharray={`${usagePercentage * 2.64} ${264 - usagePercentage * 2.64}`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">{Math.round(usagePercentage)}%</span>
                  <span className="text-[10px] text-muted-foreground">used</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {wordsUsed.toLocaleString()} / {wordsLimit.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-primary/10 rounded-lg"><FileText className="h-4 w-4 text-primary" /></div>
                <Badge variant="secondary" className="text-[10px]">Total</Badge>
              </div>
              <p className="text-2xl font-bold">{totalWordsGenerated.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Words generated</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg"><Sparkles className="h-4 w-4 text-blue-500" /></div>
                <Badge variant="secondary" className="text-[10px]">{filteredContent.length}</Badge>
              </div>
              <p className="text-2xl font-bold">{avgWordsPerPiece.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Avg words/piece</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-500/10 rounded-lg"><Activity className="h-4 w-4 text-green-500" /></div>
              </div>
              <p className="text-2xl font-bold">{todayWords.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Words today</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-500/10 rounded-lg"><Flame className="h-4 w-4 text-orange-500" /></div>
              </div>
              <p className="text-2xl font-bold">{streak}</p>
              <p className="text-xs text-muted-foreground mt-1">Day streak 🔥</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Usage Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Daily Word Usage
              </CardTitle>
              <CardDescription className="text-xs">Words generated per day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyChartData}>
                    <defs>
                      <linearGradient id="wordGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} className="fill-muted-foreground" interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }} 
                    />
                    <Area type="monotone" dataKey="words" stroke="hsl(var(--primary))" fill="url(#wordGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Template Breakdown Pie */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChart className="h-4 w-4" /> Template Breakdown
              </CardTitle>
              <CardDescription className="text-xs">Words by template type</CardDescription>
            </CardHeader>
            <CardContent>
              {templateBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
              ) : (
                <>
                  <div className="h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={templateBreakdown}
                          dataKey="words"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={65}
                          paddingAngle={2}
                        >
                          {templateBreakdown.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                          formatter={(value: number) => [`${value.toLocaleString()} words`, '']}
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1.5 mt-2 max-h-[80px] overflow-y-auto">
                    {templateBreakdown.slice(0, 5).map((t, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                          <span className="truncate max-w-[100px]">{t.name}</span>
                        </div>
                        <span className="text-muted-foreground">{t.words.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section: Detailed Breakdown + Activity Log */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Per-Template Detailed Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" /> Template Performance
              </CardTitle>
              <CardDescription className="text-xs">Detailed usage per template</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Template</TableHead>
                      <TableHead className="text-xs text-right">Pieces</TableHead>
                      <TableHead className="text-xs text-right">Words</TableHead>
                      <TableHead className="text-xs text-right">Avg</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templateBreakdown.map((t, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                            {t.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-right">{t.count}</TableCell>
                        <TableCell className="text-sm text-right font-medium">{t.words.toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-right text-muted-foreground">
                          {Math.round(t.words / t.count).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {templateBreakdown.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                          No content generated yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" /> Recent Activity
              </CardTitle>
              <CardDescription className="text-xs">Latest content generations</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {filteredContent.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No content generated yet. Start creating!
                    </p>
                  ) : (
                    filteredContent.slice(0, 20).map((content) => (
                      <div key={content.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border/50 transition-colors">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] capitalize shrink-0">
                              {content.template_type?.replace(/-/g, ' ')}
                            </Badge>
                            <span className="text-xs font-medium text-primary">
                              {content.word_count} words
                            </span>
                          </div>
                          <p className="text-sm line-clamp-1 text-muted-foreground">
                            {content.prompt}
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground ml-2 shrink-0">
                          {format(new Date(content.created_at), 'MMM d, HH:mm')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Plan Info */}
        <Card>
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Current Plan: <Badge variant="outline" className="ml-1 capitalize">{profile?.subscription_plan || 'free'}</Badge>
                </p>
                <p className="text-xs text-muted-foreground">
                  {wordsRemaining.toLocaleString()} words remaining • Resets monthly
                  {profile?.subscription_end_date && ` • Expires ${format(new Date(profile.subscription_end_date), 'MMM d, yyyy')}`}
                </p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link to="/app/pricing">
                <ArrowUpRight className="w-4 h-4 mr-2" /> View Plans
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}