import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { PenTool, Sparkles, Copy, CreditCard, Lightbulb, TrendingUp, Clock, Hash, Calendar, Trash2 } from 'lucide-react';
import { ExportDropdown } from '@/components/ExportDropdown';

const blogExamples = [
  "Write a comprehensive guide about sustainable living practices for beginners",
  "Create an in-depth analysis of the latest trends in artificial intelligence",
  "Explain the benefits of remote work for both employees and employers",
  "Write a detailed tutorial on starting a small business from scratch"
];

const blogTones = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'educational', label: 'Educational' }
];

export default function BlogGenerator() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentContent, setRecentContent] = useState<any[]>([]);

  const loadRecentContent = async () => {
    if (!profile) return;
    
    const { data } = await supabase
      .from('content_generations')
      .select('*')
      .eq('user_id', profile.user_id)
      .eq('template_type', 'blog')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) {
      setRecentContent(data);
    }
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

  useEffect(() => {
    loadRecentContent();
  }, [profile]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a topic or title for your blog post.",
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
      const enhancedPrompt = `Write a ${length} ${tone} blog post about: ${prompt}. 
        ${keywords ? `Include these keywords naturally: ${keywords}.` : ''}
        Make it engaging, well-structured with clear headings, and provide valuable insights.`;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          template_type: 'blog',
          prompt: enhancedPrompt,
          language: 'en',
          keywords: keywords.split(',').map(k => k.trim()).filter(k => k)
        }
      });

      if (error) throw error;

      const generatedContentText = data.generated_content;
      const wordCount = data.word_count || generatedContentText.split(' ').length;
      
      // Save to database
      const { error: insertError } = await supabase
        .from('content_generations')
        .insert({
          user_id: profile.user_id,
          template_type: 'blog',
          prompt: prompt,
          generated_content: generatedContentText,
          word_count: wordCount,
          language: 'en',
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
      await loadRecentContent(); // Reload recent content after generation
      
      toast({
        title: "Blog post generated!",
        description: `Generated ${wordCount} words successfully.`
      });

    } catch (error: any) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate blog content.",
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <PenTool className="w-6 h-6 text-blue-600" />
          Blog Post Generator
        </h2>
        <p className="text-muted-foreground">
          Create engaging, SEO-optimized blog posts and articles with AI assistance
        </p>
      </div>

      <div className="space-y-4 md:space-y-6">
        {/* Blog Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Blog Details
            </CardTitle>
            <CardDescription>
              Provide details about the blog post you want to create
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Blog Topic or Title</Label>
              <Textarea
                id="topic"
                placeholder="Enter your blog topic or title..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tone">Writing Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {blogTones.map((toneOption) => (
                      <SelectItem key={toneOption.value} value={toneOption.value}>
                        {toneOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="length">Content Length</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (300-500 words)</SelectItem>
                    <SelectItem value="medium">Medium (500-800 words)</SelectItem>
                    <SelectItem value="long">Long (800-1200 words)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">SEO Keywords (optional)</Label>
              <Input
                id="keywords"
                placeholder="Enter keywords separated by commas..."
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating Blog Post...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Blog Post
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Content */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
            {generatedContent && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyToClipboard}
                  className="w-fit"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <ExportDropdown
                  content={generatedContent}
                  filename={`blog-post-${Date.now()}`}
                />
              </div>
            )}
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {generatedContent}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <PenTool className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Your generated blog post will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Blog Posts */}
        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-violet-500/10 via-violet-500/5 to-transparent">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/20 rounded-xl">
                <TrendingUp className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              Recent Blog Posts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentContent.length > 0 ? (
                recentContent.map((content, index) => (
                  <div key={index} className="group flex items-center justify-between p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-2xl hover:from-muted/50 hover:to-muted/20 transition-all duration-300 border border-muted-foreground/10">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-3 rounded-xl bg-blue-100 text-blue-600 flex-shrink-0">
                        <PenTool className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" title={content.prompt}>
                          {content.prompt}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="font-medium">{content.word_count} words</span>
                          <span>•</span>
                          <span>{new Date(content.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <Clock className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <PenTool className="h-5 w-5" />
                              Blog Post Content
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
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyContentToClipboard(content.generated_content)}
                                    className="flex items-center gap-2"
                                  >
                                    <Copy className="w-4 h-4" />
                                    Copy
                                  </Button>
                                  <ExportDropdown
                                    content={content.generated_content}
                                    filename={`blog-${Date.now()}`}
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
                        className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete content"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="p-6 bg-muted/30 rounded-3xl mb-4 mx-auto w-fit">
                    <PenTool className="h-12 w-12 text-muted-foreground mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No blog posts yet</h3>
                  <p className="text-muted-foreground text-sm">
                    Create your first blog posts content to see it here!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Example Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Example Topics
            </CardTitle>
            <CardDescription>
              Click on any example to use it as your starting point
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {blogExamples.map((example, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="justify-start text-left h-auto p-3 whitespace-normal"
                  onClick={() => setPrompt(example)}
                >
                  <span className="text-sm">{example}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}