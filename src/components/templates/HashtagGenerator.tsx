import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Copy, Hash, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const hashtagExamples = [
  "Generate trending hashtags for a fitness motivation post",
  "Create hashtags for a food blogger posting about Italian cuisine",
  "Suggest hashtags for a tech startup launching a new app",
  "Generate hashtags for a travel post about Bali"
];

export default function HashtagGenerator() {
  const [prompt, setPrompt] = useState('');
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic or description",
        variant: "destructive"
      });
      return;
    }

    if (!profile) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate content",
        variant: "destructive"
      });
      return;
    }

    if ((profile.words_used || 0) >= (profile.words_limit || 500)) {
      toast({
        title: "Word Limit Reached",
        description: "Please upgrade your plan to continue",
        variant: "destructive"
      });
      navigate('/app/pricing');
      return;
    }

    setIsGenerating(true);

    try {
      const enhancedPrompt = `Generate relevant and trending hashtags for: ${prompt}. Platform: ${platform}. Topic: ${topic || 'general'}. Provide a mix of popular, niche, and branded hashtags. Format them as a clean list.`;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { 
          prompt: enhancedPrompt,
          templateType: 'hashtag'
        }
      });

      if (error) throw error;

      const content = data.content;
      const wordCount = content.split(/\s+/).length;

      setGeneratedContent(content);

      await supabase.from('content_generations').insert({
        user_id: profile.user_id,
        template_type: 'hashtag',
        prompt: prompt,
        generated_content: content,
        word_count: wordCount
      });

      await supabase.rpc('update_word_usage', {
        user_uuid: profile.user_id,
        words_to_add: wordCount
      });

      await refreshProfile();

      toast({
        title: "Success!",
        description: "Hashtags generated successfully"
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate hashtags",
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
      description: "Hashtags copied to clipboard"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Hashtag Generator</h1>
        <p className="text-muted-foreground">Generate relevant and trending hashtags for your social media posts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Details</CardTitle>
              <CardDescription>Describe your post or content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic/Niche</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Fitness, Food, Travel, Tech"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <select
                  id="platform"
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                >
                  <option value="instagram">Instagram</option>
                  <option value="twitter">Twitter/X</option>
                  <option value="tiktok">TikTok</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">Content Description</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe what your post is about..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Hashtags
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Example Prompts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {hashtagExamples.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-4"
                  onClick={() => setPrompt(example)}
                >
                  <Hash className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{example}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
        
        {/* Generated Content */}
        <div>
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Generated Hashtags
              {generatedContent && (
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans">{generatedContent}</pre>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Hash className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Your generated hashtags will appear here</p>
              </div>
            )}
          </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
