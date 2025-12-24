import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Download, Sparkles, Zap, Crown, TrendingUp, CreditCard, FileText, BarChart3, Clock, Calendar, Hash, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { ExportDropdown } from "@/components/ExportDropdown";
const templates = [{
  title: "Blog Post Generator",
  description: "Create engaging blog posts with AI assistance",
  icon: <Sparkles className="w-6 h-6 text-primary" />,
  href: "/templates/blog",
  examples: ["Write a blog post about sustainable living", "Create content about digital marketing trends"]
}, {
  title: "Social Media Captions",
  description: "Generate catchy captions for your social posts",
  icon: <Zap className="w-6 h-6 text-primary" />,
  href: "/templates/social",
  examples: ["Instagram caption for a coffee shop", "LinkedIn post about productivity"]
}, {
  title: "Email Writer",
  description: "Craft professional emails in seconds",
  icon: <TrendingUp className="w-6 h-6 text-primary" />,
  href: "/templates/email",
  examples: ["Follow-up email after meeting", "Welcome email for new customers"]
}, {
  title: "Ad Copy Maker",
  description: "Create compelling advertisements",
  icon: <Crown className="w-6 h-6 text-primary" />,
  href: "/templates/ads",
  examples: ["Facebook ad for fitness app", "Google ad for online course"]
}];
export default function Dashboard() {
  const {
    profile,
    refreshProfile
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [prompt, setPrompt] = useState('');
  const [keywords, setKeywords] = useState('');
  const [language, setLanguage] = useState('en');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentContent, setRecentContent] = useState<any[]>([]);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const loadRecentContent = async () => {
    if (!profile) return;
    const {
      data
    } = await supabase.from('content_generations').select('*').eq('user_id', profile.user_id).order('created_at', {
      ascending: false
    }).limit(5);
    if (data) {
      setRecentContent(data);
    }
  };
  // Check for successful payment and refresh profile
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
      // Refresh profile to get updated subscription status
      refreshProfile();
      toast({
        title: "Payment successful!",
        description: "Your subscription has been updated. Thank you for upgrading!",
      });
      // Remove the query parameter from URL
      window.history.replaceState({}, '', '/app');
    }
  }, []);

  useEffect(() => {
    loadRecentContent();
  }, [profile]);
  const handleGenerate = async () => {
    if (!selectedTemplate || !prompt.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a template and enter a prompt.",
        variant: "destructive"
      });
      return;
    }
    if (!profile) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate content.",
        variant: "destructive"
      });
      return;
    }

    // Check word limit
    if (profile.words_used >= profile.words_limit) {
      toast({
        title: "Word limit reached",
        description: "Please upgrade your plan to generate more content.",
        variant: "destructive",
        action: <Button variant="outline" size="sm" onClick={() => navigate('/app/pricing')} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <CreditCard className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
      });
      return;
    }
    setIsGenerating(true);
    try {
      // Call the edge function to generate content with Gemini API
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-content', {
        body: {
          template_type: selectedTemplate,
          prompt: prompt,
          language: language,
          keywords: keywords.split(',').map(k => k.trim()).filter(k => k)
        }
      });
      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to generate content');
      }
      if (!data || !data.generated_content) {
        throw new Error('No content generated');
      }
      const generatedContentText = data.generated_content;
      const wordCount = data.word_count || generatedContentText.split(' ').length;

      // Save to database
      const {
        error: insertError
      } = await supabase.from('content_generations').insert({
        user_id: profile.user_id,
        template_type: selectedTemplate,
        prompt: prompt,
        generated_content: generatedContentText,
        word_count: wordCount,
        language: language,
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k)
      });
      if (insertError) throw insertError;

      // Update word usage
      const {
        error: updateError
      } = await supabase.rpc('update_word_usage', {
        user_uuid: profile.user_id,
        words_to_add: wordCount
      });
      if (updateError) throw updateError;
      setGeneratedContent(generatedContentText);
      await refreshProfile();
      await loadRecentContent();
      toast({
        title: "Content generated!",
        description: `Generated ${wordCount} words successfully using Google Gemini AI.`
      });
    } catch (error: any) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate content.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard."
    });
  };
  const copyContentToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard."
    });
  };
  const handleDeleteContent = async (contentId: string) => {
    try {
      const {
        error
      } = await supabase.from('content_generations').delete().eq('id', contentId);
      if (error) throw error;
      setRecentContent(prev => prev.filter(item => item.id !== contentId));
      toast({
        title: "Deleted!",
        description: "Content deleted successfully."
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete content.",
        variant: "destructive"
      });
    }
  };
  const wordsRemaining = profile ? profile.words_limit - profile.words_used : 0;
  const usagePercentage = profile ? profile.words_used / profile.words_limit * 100 : 0;
  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Welcome Header - Sleek glassmorphism design */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 sm:p-8 text-primary-foreground shadow-xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                Welcome back, {profile?.display_name?.split(' ')[0] || 'Creator'}!
              </h1>
              <p className="text-primary-foreground/80 text-sm sm:text-base mt-1">
                Ready to create something amazing today?
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid - Clean card design */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {/* Words Used */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {Math.round(usagePercentage)}%
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-2xl sm:text-3xl font-bold">{profile?.words_used?.toLocaleString() || "0"}</p>
                <p className="text-sm text-muted-foreground mt-0.5">Words used</p>
              </div>
              <div className="mt-3 w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Words Available */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <Badge variant="outline" className="text-xs capitalize">
                  {profile?.subscription_plan || "free"}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-2xl sm:text-3xl font-bold">{wordsRemaining.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-0.5">Words available</p>
              </div>
            </CardContent>
          </Card>

          {/* Content Generated */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="p-2.5 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
                  <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl sm:text-3xl font-bold">{recentContent.length}</p>
                <p className="text-sm text-muted-foreground mt-0.5">Content pieces</p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                  <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl sm:text-3xl font-bold capitalize">{profile?.subscription_plan || "Free"}</p>
                <p className="text-sm text-muted-foreground mt-0.5">Current plan</p>
              </div>
              {profile?.subscription_plan === 'free' && (
                <Button 
                  size="sm" 
                  onClick={() => navigate('/app/pricing')} 
                  className="w-full mt-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  <Crown className="w-3.5 h-3.5 mr-1.5" />
                  Upgrade
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((template, index) => (
            <Link key={index} to={`/app${template.href}`}>
              <Card className="group h-full border border-border/50 hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                      {template.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{template.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Creations */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Recent Creations</CardTitle>
                  <CardDescription>Your latest AI-generated content</CardDescription>
                </div>
              </div>
              <Link to="/app/templates">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {recentContent.length > 0 ? (
              <div className="space-y-3">
                {recentContent.map((content, index) => (
                  <div 
                    key={index} 
                    className="group flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 rounded-xl transition-colors border border-transparent hover:border-border/50"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`p-3 rounded-xl ${
                        content.template_type === 'blog' 
                          ? 'bg-pink-100 dark:bg-pink-900/30' 
                          : content.template_type === 'social' 
                          ? 'bg-blue-100 dark:bg-blue-900/30' 
                          : content.template_type === 'ads' 
                          ? 'bg-purple-100 dark:bg-purple-900/30' 
                          : 'bg-green-100 dark:bg-green-900/30'
                      }`}>
                        {content.template_type === 'blog' 
                          ? <Sparkles className="h-5 w-5 text-pink-600 dark:text-pink-400" /> 
                          : content.template_type === 'social' 
                          ? <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" /> 
                          : content.template_type === 'ads' 
                          ? <Crown className="h-5 w-5 text-purple-600 dark:text-purple-400" /> 
                          : <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {content.template_type.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {content.word_count} words
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(content.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setSelectedContent(content)}
                          >
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {content.template_type === 'blog' 
                                ? <Sparkles className="h-5 w-5" /> 
                                : content.template_type === 'social' 
                                ? <Zap className="h-5 w-5" /> 
                                : content.template_type === 'ads' 
                                ? <Crown className="h-5 w-5" /> 
                                : <TrendingUp className="h-5 w-5" />
                              }
                              {content.template_type.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} Content
                            </DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                              <div className="flex items-center gap-1.5">
                                <Hash className="w-4 h-4" />
                                <span>{content.word_count} words</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(content.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="font-semibold">Original Prompt</Label>
                              <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-sm">{content.prompt}</p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="font-semibold">Generated Content</Label>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => copyContentToClipboard(content.generated_content)}
                                  >
                                    <Copy className="w-4 h-4 mr-1.5" />
                                    Copy
                                  </Button>
                                  <ExportDropdown 
                                    content={content.generated_content} 
                                    filename={`${content.template_type}-${Date.now()}`} 
                                  />
                                </div>
                              </div>
                              <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                                  {content.generated_content}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteContent(content.id)} 
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-6 bg-primary/5 rounded-2xl w-fit mx-auto mb-4">
                  <Sparkles className="h-12 w-12 text-primary/60" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No content yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Choose a template above and start creating amazing content with AI!
                </p>
                <Link to="/app/templates">
                  <Button className="mt-4">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start Creating
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}