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
  return <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.02] to-accent/[0.03]">
      <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-blue p-8 sm:p-10 text-white shadow-2xl animate-gradient-shift">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]"></div>
          <div className="relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg">
                <Sparkles className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-1">
                  Welcome back, {profile?.display_name || 'Creator'}! 👋
                </h1>
                <p className="text-white/90 text-lg sm:text-xl">Ready to create something amazing today?</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-blue-200/60 dark:border-blue-700/60 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <div className="p-3.5 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl border border-blue-400/30 shadow-sm">
                  <TrendingUp className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 tracking-tight">{profile?.words_used?.toLocaleString() || "0"}</div>
                  <div className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mt-1">Words Used</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full bg-blue-200/60 dark:bg-blue-800/40 rounded-full h-2.5 overflow-hidden shadow-inner">
                  <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 h-2.5 rounded-full transition-all duration-700 ease-out shadow-sm" style={{
                  width: `${Math.min(usagePercentage, 100)}%`
                }}></div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">{Math.round(usagePercentage)}% used</span>
                  <span className="text-blue-500 dark:text-blue-500">{profile?.words_limit?.toLocaleString()} total</span>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/30 p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-emerald-200/60 dark:border-emerald-700/60 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3.5 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-2xl border border-emerald-400/30 shadow-sm">
                  <Sparkles className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 tracking-tight">{wordsRemaining.toLocaleString()}</div>
                  <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mt-1">Available</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-xl border border-emerald-400/20 backdrop-blur-sm">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 capitalize">{profile?.subscription_plan || "free"} Plan</span>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-50 via-violet-100 to-violet-50 dark:from-violet-900/30 dark:to-violet-800/30 p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-violet-200/60 dark:border-violet-700/60 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3.5 bg-gradient-to-br from-violet-500/20 to-violet-600/20 rounded-2xl border border-violet-400/30 shadow-sm">
                  <Zap className="h-7 w-7 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-violet-900 dark:text-violet-100 tracking-tight">{recentContent.length}</div>
                  <div className="text-xs font-medium text-violet-600 dark:text-violet-400 uppercase tracking-wide mt-1">Generated</div>
                </div>
              </div>
              <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">Total content pieces</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/30 p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-amber-200/60 dark:border-amber-700/60 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3.5 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl border border-amber-400/30 shadow-sm">
                  <Crown className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-amber-900 dark:text-amber-100 capitalize tracking-tight">{profile?.subscription_plan || "Free"}</div>
                  <div className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide mt-1">Plan</div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  {profile?.subscription_plan === 'free' ? '✨ Upgrade for unlimited power' : '🎉 Premium features unlocked'}
                </p>
                {profile?.subscription_plan === 'free' && <Button size="sm" onClick={() => navigate('/app/pricing')} className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Now
                  </Button>}
              </div>
            </div>
          </div>
        </div>

        {/* Content Generator */}
        

        {/* Recent Activity */}
        <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-background to-violet-500/5">
          <CardHeader className="bg-gradient-to-br from-violet-500/15 via-violet-500/5 to-transparent border-b border-violet-500/10">
            <CardTitle className="flex items-center gap-4 text-2xl">
              <div className="p-3 bg-gradient-to-br from-violet-500/30 to-violet-500/10 rounded-2xl shadow-lg border border-violet-500/20">
                <TrendingUp className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Recent Creations</h3>
                <p className="text-sm text-muted-foreground font-normal mt-1">Your latest AI-generated content</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentContent.length > 0 ? recentContent.map((content, index) => <div key={index} className="group flex items-center justify-between p-5 bg-gradient-to-r from-muted/40 to-muted/20 rounded-2xl hover:from-muted/60 hover:to-muted/30 transition-all duration-300 border border-muted-foreground/20 hover:border-primary/30 hover:shadow-lg">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`p-4 rounded-2xl shadow-md border ${content.template_type === 'blog' ? 'bg-gradient-to-br from-pink-500/30 to-pink-500/10 border-pink-400/30' : content.template_type === 'social' ? 'bg-gradient-to-br from-blue-500/30 to-blue-500/10 border-blue-400/30' : content.template_type === 'ads' ? 'bg-gradient-to-br from-purple-500/30 to-purple-500/10 border-purple-400/30' : 'bg-gradient-to-br from-green-500/30 to-green-500/10 border-green-400/30'}`}>
                        {content.template_type === 'blog' ? <Sparkles className="h-6 w-6 text-pink-600 dark:text-pink-400" /> : content.template_type === 'social' ? <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" /> : content.template_type === 'ads' ? <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" /> : <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-lg mb-1 truncate">{content.template_type.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-background/50 rounded-lg">
                            <FileText className="h-3.5 w-3.5" />
                            <span className="font-semibold">{content.word_count} words</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date(content.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors" onClick={() => setSelectedContent(content)}>
                            View
                          </Button>
                        </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {content.template_type === 'blog' ? <Sparkles className="h-5 w-5" /> : content.template_type === 'social' ? <Zap className="h-5 w-5" /> : content.template_type === 'ads' ? <Crown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                            {content.template_type.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} Content
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          {/* Content Info */}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                            <div className="flex items-center gap-1">
                              <Hash className="w-4 h-4" />
                              <span>{content.word_count} words</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(content.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Original Prompt */}
                          <div className="space-y-2">
                            <Label className="font-semibold">Original Prompt:</Label>
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-sm">{content.prompt}</p>
                            </div>
                          </div>

                          {/* Generated Content */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="font-semibold">Generated Content:</Label>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => copyContentToClipboard(content.generated_content)} className="flex items-center gap-2">
                                  <Copy className="w-4 h-4" />
                                  Copy
                                </Button>
                                <ExportDropdown content={content.generated_content} filename={`${content.template_type}-${Date.now()}`} />
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
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteContent(content.id)} className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>) : <div className="text-center py-16">
                  <div className="relative">
                    <div className="absolute inset-0 bg-violet-500/20 blur-3xl rounded-full"></div>
                    <div className="relative p-10 bg-gradient-to-br from-violet-500/20 to-violet-500/5 rounded-3xl mb-6 mx-auto w-fit border border-violet-500/20 shadow-lg">
                      <Sparkles className="h-20 w-20 text-violet-600 dark:text-violet-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Start Creating Today</h3>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
                    Your generated content will appear here. Choose a template above and start creating amazing content with AI!
                  </p>
                </div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}