import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Copy, Lightbulb, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const postIdeasExamples = [
  "Generate 10 post ideas for a fitness coach targeting beginners",
  "Suggest content ideas for a sustainable fashion brand",
  "Create post ideas for a SaaS company in project management",
  "Generate engaging post ideas for a food blogger"
];

export default function PostIdeasGenerator() {
  const [prompt, setPrompt] = useState('');
  const [niche, setNiche] = useState('');
  const [audience, setAudience] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please describe what kind of post ideas you need",
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
      const enhancedPrompt = `Generate creative and engaging post ideas for: ${prompt}. Niche: ${niche || 'general'}. Target Audience: ${audience || 'general audience'}. Provide at least 10 diverse ideas with brief descriptions. Make them actionable and trendy.`;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { 
          prompt: enhancedPrompt,
          templateType: 'post-ideas'
        }
      });

      if (error) throw error;

      const content = data.content;
      const wordCount = content.split(/\s+/).length;

      setGeneratedContent(content);

      await supabase.from('content_generations').insert({
        user_id: profile.user_id,
        template_type: 'post-ideas',
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
        description: "Post ideas generated successfully"
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate post ideas",
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
      description: "Post ideas copied to clipboard"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Post Ideas Generator</h1>
        <p className="text-muted-foreground">Get creative post ideas for your social media and content strategy</p>
      </div>

      <div className="lg:grid lg:grid-cols-3 gap-4 md:gap-6 flex lg:flex-none overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory lg:snap-none">
        <div className="lg:col-span-2 space-y-4 md:space-y-6 min-w-[320px] lg:min-w-0 snap-start flex-shrink-0 lg:flex-shrink">
          <Card>
            <CardHeader>
              <CardTitle>Content Strategy</CardTitle>
              <CardDescription>Tell us about your content needs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="niche">Niche/Industry</Label>
                <Input
                  id="niche"
                  placeholder="e.g., Fitness, Marketing, Technology"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Input
                  id="audience"
                  placeholder="e.g., Young professionals, Parents, Students"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">What kind of post ideas do you need?</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe your content goals, themes, or specific topics..."
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
                    Generate Post Ideas
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
              {postIdeasExamples.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-4"
                  onClick={() => setPrompt(example)}
                >
                  <Lightbulb className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{example}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
        
        {/* Generated Content */}
        <div className="min-w-[320px] lg:min-w-0 snap-start flex-shrink-0 lg:flex-shrink">
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Generated Post Ideas
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
                <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Your post ideas will appear here</p>
              </div>
            )}
          </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
