import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Download, Sparkles, Zap, Crown, TrendingUp, CreditCard, FileText, BarChart3, Clock, Calendar, Hash } from "lucide-react";
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

  const wordsRemaining = profile ? profile.words_limit - profile.words_used : 0;
  const usagePercentage = profile ? (profile.words_used / profile.words_limit) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.02] to-accent/[0.03]">
      <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary/90 via-primary to-primary/80 p-6 sm:p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 opacity-20"></div>
          <div className="relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl sm:rounded-2xl backdrop-blur-sm">
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{profile?.display_name || 'Creator'}!</h1>
                <p className="text-white/90 text-base sm:text-lg mt-1">Let's create something amazing today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200/50 dark:border-blue-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{profile?.words_used?.toLocaleString() || "0"}</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Words Used</div>
              </div>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">{Math.round(usagePercentage)}% of {profile?.words_limit?.toLocaleString()} limit</div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-200/50 dark:border-emerald-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <Sparkles className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{wordsRemaining.toLocaleString()}</div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400">Words Remaining</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 bg-emerald-500/20 rounded-lg">
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300 capitalize">{profile?.subscription_plan || "free"} Plan</span>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-violet-200/50 dark:border-violet-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-violet-500/10 rounded-xl">
                <Zap className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-violet-900 dark:text-violet-100">{recentContent.length}</div>
                <div className="text-xs text-violet-600 dark:text-violet-400">Content Generated</div>
              </div>
            </div>
            <div className="text-xs text-violet-600 dark:text-violet-400">Recent creations</div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-200/50 dark:border-amber-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <Crown className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-900 dark:text-amber-100 capitalize">{profile?.subscription_plan || "Free"}</div>
                <div className="text-xs text-amber-600 dark:text-amber-400">Current Plan</div>
              </div>
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400 mb-3">
              {profile?.subscription_plan === 'free' ? 'Upgrade available' : 'Active subscription'}
            </div>
            {profile?.subscription_plan === 'free' && (
              <Button
                size="sm"
                onClick={() => navigate('/app/pricing')}
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity text-white"
              >
                <CreditCard className="w-3 h-3 mr-1" />
                Upgrade Plan
              </Button>
            )}
          </div>
        </div>

        {/* Templates Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Choose Your Template</h2>
            <p className="text-muted-foreground text-base sm:text-lg">Select from our professionally designed templates to get started</p>
          </div>
          
          <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {templates.map((template, index) => (
              <div
                key={template.title}
                onClick={() => setSelectedTemplate(template.href.split('/').pop())}
                className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                  selectedTemplate === template.href.split('/').pop()
                    ? 'ring-2 sm:ring-4 ring-primary ring-offset-2 sm:ring-offset-4 shadow-2xl'
                    : 'shadow-lg hover:shadow-xl'
                } ${
                  index === 0 ? 'bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/20 dark:to-rose-800/20 border border-pink-200/50 dark:border-pink-700/50' :
                  index === 1 ? 'bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-800/20 border border-blue-200/50 dark:border-blue-700/50' :
                  index === 2 ? 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 border border-green-200/50 dark:border-green-700/50' :
                  'bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-800/20 border border-purple-200/50 dark:border-purple-700/50'
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`p-4 rounded-2xl ${
                    index === 0 ? 'bg-pink-500/10' :
                    index === 1 ? 'bg-blue-500/10' :
                    index === 2 ? 'bg-green-500/10' :
                    'bg-purple-500/10'
                  }`}>
                    {template.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">{template.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{template.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {template.examples.map((example, i) => (
                      <span key={i} className={`px-2 py-1 text-xs rounded-lg ${
                        index === 0 ? 'bg-pink-500/20 text-pink-700 dark:text-pink-300' :
                        index === 1 ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300' :
                        index === 2 ? 'bg-green-500/20 text-green-700 dark:text-green-300' :
                        'bg-purple-500/20 text-purple-700 dark:text-purple-300'
                      }`}>
                        {example.split(' ').slice(0, 3).join(' ')}...
                      </span>
                    ))}
                  </div>
                </div>
                {selectedTemplate === template.href.split('/').pop() && (
                  <div className="absolute top-4 right-4">
                    <div className="p-2 bg-primary rounded-full text-white shadow-lg">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Generator */}
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-background to-muted/30">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent pb-8">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-3 bg-primary/20 rounded-2xl">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                AI Content Generator
              </CardTitle>
              <CardDescription className="text-base">
                Describe what you want to create and let our AI do the magic ✨
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              {!selectedTemplate && (
                <div className="text-center p-8 bg-muted/30 rounded-2xl border-2 border-dashed border-muted-foreground/20">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">Please select a template above to get started</p>
                </div>
              )}
              
              {selectedTemplate && (
                <>
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        {templates.find(t => t.href.split('/').pop() === selectedTemplate)?.title}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {templates.find(t => t.href.split('/').pop() === selectedTemplate)?.description}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">What do you want to write about?</Label>
                    <Textarea 
                      placeholder="Describe your topic in detail. The more specific you are, the better the AI can help you..."
                      rows={5}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="resize-none rounded-xl border-2 focus:border-primary/50 transition-colors"
                    />
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="rounded-xl">
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
                    
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Keywords (optional)</Label>
                      <Input 
                        placeholder="SEO, marketing, growth..." 
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300" 
                    onClick={handleGenerate}
                    disabled={isGenerating || !selectedTemplate || !prompt.trim()}
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Generating Magic...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-3" />
                        Generate Content with AI
                      </>
                    )}
                  </Button>
                  
                  {wordsRemaining <= 0 && (
                    <div className="p-6 bg-gradient-to-r from-destructive/10 to-destructive/5 text-destructive rounded-2xl border border-destructive/20">
                      <div className="flex items-center gap-3">
                        <Crown className="h-5 w-5" />
                        <div>
                          <div className="font-semibold">Word limit reached</div>
                          <div className="text-sm opacity-80">Upgrade your plan to continue generating amazing content.</div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Generated Content */}
          <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-background to-muted/30">
            <CardHeader className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent pb-8">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-3 bg-emerald-500/20 rounded-2xl">
                  <Copy className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                Your Generated Content
              </CardTitle>
              <CardDescription className="text-base">
                AI-crafted content ready for you to use and customize
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="min-h-[500px] rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-gradient-to-br from-muted/30 to-muted/10">
                {generatedContent ? (
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 px-3 py-1">
                          {templates.find(t => t.href.split('/').pop() === selectedTemplate)?.title}
                        </Badge>
                        <span className="text-sm text-muted-foreground font-medium">
                          {generatedContent.split(' ').length} words
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={copyToClipboard}
                          className="rounded-xl hover:bg-primary/10"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="rounded-xl hover:bg-primary/10"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                    <div className="bg-background rounded-xl p-6 shadow-sm border">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                          {generatedContent}
                        </pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-12">
                    <div className="p-6 bg-muted/50 rounded-3xl mb-6">
                      <Sparkles className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Ready to Create?</h3>
                    <p className="text-muted-foreground text-lg max-w-md">
                      Select a template and describe your content. Our AI will generate professional, engaging content in seconds.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-violet-500/10 via-violet-500/5 to-transparent">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/20 rounded-xl">
                <TrendingUp className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              Recent Creations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentContent.length > 0 ? (
                recentContent.map((content, index) => (
                  <div key={index} className="group flex items-center justify-between p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-2xl hover:from-muted/50 hover:to-muted/20 transition-all duration-300 border border-muted-foreground/10">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        content.template_type === 'blog' ? 'bg-pink-500/20 text-pink-600' :
                        content.template_type === 'social' ? 'bg-blue-500/20 text-blue-600' :
                        content.template_type === 'ads' ? 'bg-purple-500/20 text-purple-600' :
                        'bg-green-500/20 text-green-600'
                      }`}>
                        {content.template_type === 'blog' ? <Sparkles className="h-5 w-5" /> :
                         content.template_type === 'social' ? <Zap className="h-5 w-5" /> :
                         content.template_type === 'ads' ? <Crown className="h-5 w-5" /> :
                         <TrendingUp className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{content.template_type.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="font-medium">{content.word_count} words</span>
                          <span>•</span>
                          <span>{new Date(content.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
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
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="p-8 bg-muted/30 rounded-3xl mb-6 mx-auto w-fit">
                    <Sparkles className="h-16 w-16 text-muted-foreground mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No content yet</h3>
                  <p className="text-muted-foreground text-lg">
                    Create your first piece of content above to see it here!
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