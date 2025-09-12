import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatsCard } from "@/components/ui/stats-card";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { Copy, Download, Sparkles, Zap, Crown, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [prompt, setPrompt] = useState('');
  const [keywords, setKeywords] = useState('');
  const [language, setLanguage] = useState('en');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentContent, setRecentContent] = useState<any[]>([]);

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
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate content generation (replace with actual API call later)
      const mockContent = generateMockContent(selectedTemplate, prompt);
      const wordCount = mockContent.split(' ').length;
      
      // Save to database
      const { error } = await supabase
        .from('content_generations')
        .insert({
          user_id: profile.user_id,
          template_type: selectedTemplate,
          prompt: prompt,
          generated_content: mockContent,
          word_count: wordCount,
          language: language,
          keywords: keywords.split(',').map(k => k.trim()).filter(k => k)
        });

      if (error) throw error;

      // Update word usage
      const { error: updateError } = await supabase.rpc('update_word_usage', {
        user_uuid: profile.user_id,
        words_to_add: wordCount
      });

      if (updateError) throw updateError;

      setGeneratedContent(mockContent);
      await refreshProfile();
      await loadRecentContent();
      
      toast({
        title: "Content generated!",
        description: `Generated ${wordCount} words successfully.`
      });

    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate content.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockContent = (template: string, prompt: string) => {
    const templates = {
      'blog-post': `# ${prompt}\n\nThis is a comprehensive blog post about ${prompt}. Here's an engaging introduction that captures the reader's attention and sets the stage for the valuable insights to follow.\n\n## Key Points\n\n- Important insight about the topic\n- Actionable advice for readers\n- Data-driven conclusions\n\n## Conclusion\n\nIn conclusion, ${prompt} is a crucial topic that deserves our attention. By following these guidelines, you can achieve excellent results.`,
      'social-media': `🚀 ${prompt} is changing the game! Here's what you need to know:\n\n✨ Key benefit #1\n💡 Key benefit #2\n🎯 Key benefit #3\n\n#${prompt.replace(/\s+/g, '')} #innovation #growth`,
      'ad-copy': `Headline: Transform Your ${prompt} Today!\n\nSubheading: Discover the secret that industry leaders don't want you to know.\n\nBody: Are you tired of struggling with ${prompt}? Our proven solution has helped thousands achieve remarkable results in just days.\n\nCall-to-Action: Get started now and see results in 24 hours!`,
      'email': `Subject: Important Update About ${prompt}\n\nHi there!\n\nI hope this email finds you well. I wanted to reach out regarding ${prompt} and share some exciting developments.\n\nHere are the key points:\n- Benefit 1\n- Benefit 2\n- Next steps\n\nI'd love to hear your thoughts on this. Please don't hesitate to reply with any questions.\n\nBest regards,\n[Your Name]`
    };
    
    return templates[template as keyof typeof templates] || `Generated content for ${prompt}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard."
    });
  };

  const wordsRemaining = profile ? profile.words_limit - profile.words_used : 0;
  const usagePercentage = profile ? (profile.words_used / profile.words_limit) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Words Used"
            value={profile?.words_used?.toLocaleString() || "0"}
            description={`${Math.round(usagePercentage)}% of limit`}
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <StatsCard
            title="Words Remaining"
            value={wordsRemaining.toLocaleString()}
            description={profile?.subscription_plan || "free"}
            icon={<Sparkles className="h-4 w-4" />}
          />
          <StatsCard
            title="Content Generated"
            value={recentContent.length.toString()}
            description="Recent items"
            icon={<Zap className="h-4 w-4" />}
          />
          <StatsCard
            title="Plan"
            value={profile?.subscription_plan || "Free"}
            description={profile?.subscription_plan === 'free' ? 'Upgrade available' : 'Active'}
            icon={<Crown className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Content Generator */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Content Generator
            </CardTitle>
            <CardDescription>
              Select a template and describe what you want to create
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog-post">Blog Post</SelectItem>
                  <SelectItem value="social-media">Social Media Caption</SelectItem>
                  <SelectItem value="ad-copy">Ad Copy</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>What do you want to write about?</Label>
              <Textarea 
                placeholder="Describe your topic or provide key points..."
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Keywords (optional)</Label>
                <Input 
                  placeholder="SEO, marketing, growth..." 
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
              </div>
            </div>
            
            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleGenerate}
              disabled={isGenerating || !selectedTemplate || !prompt.trim()}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Content'}
            </Button>
            
            {wordsRemaining <= 0 && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
                You've reached your word limit. Upgrade your plan to continue generating content.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generated Content */}
        <Card className="border-elegant">
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
            <CardDescription>
              Your AI-generated content will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-h-[400px] p-4 bg-muted/50 rounded-lg border border-muted-foreground/25">
              {generatedContent ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">{selectedTemplate}</Badge>
                    <span>{generatedContent.split(' ').length} words</span>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {generatedContent}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground text-center">
                    Select a template and generate content to see it here
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyToClipboard}
                disabled={!generatedContent}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={!generatedContent}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Content Templates</h2>
            <p className="text-muted-foreground">Choose a template to get started</p>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {templates.map((template) => (
            <TemplateCard key={template.title} {...template} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentContent.length > 0 ? (
              recentContent.map((content, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{content.template_type.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{content.word_count} words</span>
                      <span>•</span>
                      <span>{new Date(content.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No content generated yet. Create your first piece above!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}