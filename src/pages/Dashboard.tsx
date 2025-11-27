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

const templates = [
  {
    title: "Blog Post Generator",
    description: "Create engaging blog posts with AI assistance",
    icon: <Sparkles className="w-6 h-6 text-primary" />,
    href: "/templates/blog",
    examples: [
      "Write a blog post about sustainable living",
      "Create content about digital marketing trends"
    ]
  },
  {
    title: "Social Media Captions",
    description: "Generate catchy captions for your social posts",
    icon: <Zap className="w-6 h-6 text-primary" />,
    href: "/templates/social",
    examples: [
      "Instagram caption for a coffee shop",
      "LinkedIn post about productivity"
    ]
  },
  {
    title: "Email Writer",
    description: "Craft professional emails in seconds",
    icon: <TrendingUp className="w-6 h-6 text-primary" />,
    href: "/templates/email",
    examples: [
      "Follow-up email after meeting",
      "Welcome email for new customers"
    ]
  },
  {
    title: "Ad Copy Maker",
    description: "Create compelling advertisements",
    icon: <Crown className="w-6 h-6 text-primary" />,
    href: "/templates/ads",
    examples: [
      "Facebook ad for fitness app",
      "Google ad for online course"
    ]
  }
];

export default function Dashboard() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
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
    
    const { data } = await supabase
      .from('content_generations')
      .select('*')
      .eq('user_id', profile.user_id)
      .order('created_at', { ascending: false })
      .limit(5);
    
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
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/pricing')}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
        )
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Call the edge function to generate content with Gemini API
      const { data, error } = await supabase.functions.invoke('generate-content', {
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
      const { error: insertError } = await supabase
        .from('content_generations')
        .insert({
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
      const { error: updateError } = await supabase.rpc('update_word_usage', {
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
      const { error } = await supabase
        .from('content_generations')
        .delete()
        .eq('id', contentId);

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
  const usagePercentage = profile ? (profile.words_used / profile.words_limit) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.02] to-accent/[0.03]">
      <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/95 to-primary/80 p-8 sm:p-10 text-white shadow-2xl animate-gradient-shift">
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
                  <div 
                    className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 h-2.5 rounded-full transition-all duration-700 ease-out shadow-sm"
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  ></div>
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
                {profile?.subscription_plan === 'free' && (
                  <Button
                    size="sm"
                    onClick={() => navigate('/app/pricing')}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Templates Section */}
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Choose Your Template</h2>
            <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto">Select from our professionally designed templates to get started with AI-powered content creation</p>
          </div>
          
          <div className="grid gap-6 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {templates.map((template, index) => (
              <div
                key={template.title}
                onClick={() => setSelectedTemplate(template.href.split('/').pop())}
                className={`group relative overflow-hidden rounded-3xl p-6 cursor-pointer transition-all duration-500 hover:scale-[1.03] ${
                  selectedTemplate === template.href.split('/').pop()
                    ? 'ring-4 ring-primary ring-offset-4 shadow-2xl scale-[1.02]'
                    : 'shadow-xl hover:shadow-2xl'
                } ${
                  index === 0 ? 'bg-gradient-to-br from-pink-50 via-rose-50 to-rose-100 dark:from-pink-900/30 dark:to-rose-800/30 border-2 border-pink-200/60 dark:border-pink-700/60' :
                  index === 1 ? 'bg-gradient-to-br from-blue-50 via-cyan-50 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-800/30 border-2 border-blue-200/60 dark:border-blue-700/60' :
                  index === 2 ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 border-2 border-green-200/60 dark:border-green-700/60' :
                  'bg-gradient-to-br from-purple-50 via-violet-50 to-violet-100 dark:from-purple-900/30 dark:to-violet-800/30 border-2 border-purple-200/60 dark:border-purple-700/60'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex flex-col items-center text-center space-y-4">
                  <div className={`p-5 rounded-2xl shadow-lg border ${
                    index === 0 ? 'bg-gradient-to-br from-pink-500/20 to-rose-500/20 border-pink-400/30' :
                    index === 1 ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400/30' :
                    index === 2 ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400/30' :
                    'bg-gradient-to-br from-purple-500/20 to-violet-500/20 border-purple-400/30'
                  }`}>
                    {template.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">{template.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{template.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {template.examples.map((example, i) => (
                      <span key={i} className={`px-2.5 py-1.5 text-xs font-medium rounded-lg shadow-sm ${
                        index === 0 ? 'bg-pink-500/20 text-pink-700 dark:text-pink-300 border border-pink-400/30' :
                        index === 1 ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-400/30' :
                        index === 2 ? 'bg-green-500/20 text-green-700 dark:text-green-300 border border-green-400/30' :
                        'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-400/30'
                      }`}>
                        {example.split(' ').slice(0, 3).join(' ')}...
                      </span>
                    ))}
                  </div>
                </div>
                {selectedTemplate === template.href.split('/').pop() && (
                  <div className="absolute top-4 right-4 animate-scale-in">
                    <div className="p-2.5 bg-gradient-to-br from-primary to-primary/80 rounded-full text-white shadow-xl border-2 border-white/50">
                      <Sparkles className="h-5 w-5" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Generator */}
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent pb-8 border-b border-primary/10">
              <CardTitle className="flex items-center gap-4 text-2xl">
                <div className="p-4 bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl shadow-lg border border-primary/20">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">AI Content Generator</h3>
                  <p className="text-sm text-muted-foreground font-normal mt-1">Powered by Google Gemini</p>
                </div>
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Describe what you want to create and let our AI work its magic ✨
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              {!selectedTemplate && (
                <div className="text-center p-12 bg-gradient-to-br from-muted/50 to-muted/30 rounded-3xl border-2 border-dashed border-muted-foreground/20">
                  <div className="p-6 bg-primary/10 rounded-full w-fit mx-auto mb-4 border border-primary/20">
                    <Sparkles className="h-16 w-16 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Ready to Create?</h3>
                  <p className="text-muted-foreground text-lg">Select a template above to get started with AI content generation</p>
                </div>
              )}
              
              {selectedTemplate && (
                <>
                  <div className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl border-2 border-primary/20 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="secondary" className="bg-gradient-to-r from-primary/30 to-primary/20 text-primary border border-primary/30 px-3 py-1.5 shadow-sm">
                        <Sparkles className="w-3 h-3 mr-1.5" />
                        {templates.find(t => t.href.split('/').pop() === selectedTemplate)?.title}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {templates.find(t => t.href.split('/').pop() === selectedTemplate)?.description}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-base font-bold flex items-center gap-2">
                      <span className="text-primary">✨</span>
                      What do you want to write about?
                    </Label>
                    <Textarea 
                      placeholder="Describe your topic in detail. The more specific you are, the better the AI can help you create amazing content..."
                      rows={6}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="resize-none rounded-2xl border-2 border-muted focus:border-primary/50 transition-all shadow-sm"
                    />
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label className="text-base font-bold">🌍 Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="rounded-xl border-2 shadow-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">🇺🇸 English</SelectItem>
                          <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                          <SelectItem value="fr">🇫🇷 French</SelectItem>
                          <SelectItem value="de">🇩🇪 German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-base font-bold">🏷️ Keywords (optional)</Label>
                      <Input 
                        placeholder="SEO, marketing, growth..." 
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        className="rounded-xl border-2 shadow-sm"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full h-16 text-lg font-bold rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-primary/20" 
                    onClick={handleGenerate}
                    disabled={isGenerating || !selectedTemplate || !prompt.trim()}
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        <span className="animate-pulse">Generating Magic...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-6 w-6 mr-3" />
                        Generate Content with AI
                      </>
                    )}
                  </Button>
                  
                  {wordsRemaining <= 0 && (
                    <div className="p-6 bg-gradient-to-r from-destructive/15 via-destructive/10 to-destructive/5 rounded-2xl border-2 border-destructive/30 shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-destructive/20 rounded-xl">
                          <Crown className="h-6 w-6 text-destructive" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-lg text-destructive">Word Limit Reached</div>
                          <div className="text-sm text-destructive/80 mt-1">Upgrade your plan to continue generating amazing content with unlimited words.</div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Generated Content */}
          <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-background via-background to-emerald-500/5 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent pb-8 border-b border-emerald-500/10">
              <CardTitle className="flex items-center gap-4 text-2xl">
                <div className="p-4 bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 rounded-2xl shadow-lg border border-emerald-500/20">
                  <Copy className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Your Generated Content</h3>
                  <p className="text-sm text-muted-foreground font-normal mt-1">AI-crafted content ready to use</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="min-h-[500px] rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-background via-muted/20 to-primary/5 shadow-inner">
                {generatedContent ? (
                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/30 px-4 py-2 text-sm font-semibold shadow-sm">
                          <Sparkles className="w-3.5 h-3.5 mr-2" />
                          {templates.find(t => t.href.split('/').pop() === selectedTemplate)?.title}
                        </Badge>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-muted-foreground/20">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground font-medium">
                            {generatedContent.split(' ').length} words
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={copyToClipboard}
                          className="rounded-xl hover:bg-primary/10 shadow-sm border-primary/20"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="rounded-xl hover:bg-primary/10 shadow-sm border-primary/20"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                    <div className="bg-background rounded-2xl p-8 shadow-lg border-2 border-primary/10">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                          {generatedContent}
                        </pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-12">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
                      <div className="relative p-8 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl mb-6 border border-primary/20 shadow-lg">
                        <Sparkles className="h-20 w-20 text-primary animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Your Content Appears Here</h3>
                    <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
                      Select a template and describe your content. Our AI will generate professional, engaging content in seconds.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

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
              {recentContent.length > 0 ? (
                recentContent.map((content, index) => (
                  <div key={index} className="group flex items-center justify-between p-5 bg-gradient-to-r from-muted/40 to-muted/20 rounded-2xl hover:from-muted/60 hover:to-muted/30 transition-all duration-300 border border-muted-foreground/20 hover:border-primary/30 hover:shadow-lg">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`p-4 rounded-2xl shadow-md border ${
                        content.template_type === 'blog' ? 'bg-gradient-to-br from-pink-500/30 to-pink-500/10 border-pink-400/30' :
                        content.template_type === 'social' ? 'bg-gradient-to-br from-blue-500/30 to-blue-500/10 border-blue-400/30' :
                        content.template_type === 'ads' ? 'bg-gradient-to-br from-purple-500/30 to-purple-500/10 border-purple-400/30' :
                        'bg-gradient-to-br from-green-500/30 to-green-500/10 border-green-400/30'
                      }`}>
                        {content.template_type === 'blog' ? <Sparkles className="h-6 w-6 text-pink-600 dark:text-pink-400" /> :
                         content.template_type === 'social' ? <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" /> :
                         content.template_type === 'ads' ? <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" /> :
                         <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />}
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                            onClick={() => setSelectedContent(content)}
                          >
                            View
                          </Button>
                        </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {content.template_type === 'blog' ? <Sparkles className="h-5 w-5" /> :
                             content.template_type === 'social' ? <Zap className="h-5 w-5" /> :
                             content.template_type === 'ads' ? <Crown className="h-5 w-5" /> :
                             <TrendingUp className="h-5 w-5" />}
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyContentToClipboard(content.generated_content)}
                                className="flex items-center gap-2"
                              >
                                <Copy className="w-4 h-4" />
                                Copy Content
                              </Button>
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
                      className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                ))
              ) : (
                <div className="text-center py-16">
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
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}