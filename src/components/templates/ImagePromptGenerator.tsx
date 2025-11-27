import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Copy, Image, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const imagePromptExamples = [
  "A futuristic cityscape at sunset with flying cars",
  "Portrait of a mystical forest guardian with glowing eyes",
  "Abstract representation of artificial intelligence",
  "Minimalist logo design for a tech startup"
];

export default function ImagePromptGenerator() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('');
  const [details, setDetails] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please describe the image you want to create",
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
      const enhancedPrompt = `Create a detailed and optimized image generation prompt for: ${prompt}. Style: ${style || 'realistic'}. Additional details: ${details || 'none'}. Include specific details about composition, lighting, colors, mood, and technical aspects. Make it suitable for AI image generators like Midjourney, DALL-E, or Stable Diffusion.`;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { 
          prompt: enhancedPrompt,
          templateType: 'image-prompt'
        }
      });

      if (error) throw error;

      const content = data.content;
      const wordCount = content.split(/\s+/).length;

      setGeneratedContent(content);

      await supabase.from('content_generations').insert({
        user_id: profile.user_id,
        template_type: 'image-prompt',
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
        description: "Image prompt generated successfully"
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate image prompt",
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
      description: "Image prompt copied to clipboard"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Image Prompt Generator</h1>
        <p className="text-muted-foreground">Create detailed prompts for AI image generation tools</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Image Details</CardTitle>
              <CardDescription>Describe the image you want to generate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="style">Art Style</Label>
                <Input
                  id="style"
                  placeholder="e.g., Photorealistic, Anime, Oil painting, 3D render"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Additional Details</Label>
                <Input
                  id="details"
                  placeholder="e.g., 4K, cinematic lighting, high detail"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">Image Description</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe what you want to see in the image..."
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
                    Generate Image Prompt
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Example Ideas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {imagePromptExamples.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-4"
                  onClick={() => setPrompt(example)}
                >
                  <Image className="mr-2 h-4 w-4 flex-shrink-0" />
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
              Generated Image Prompt
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
                <Image className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Your optimized image prompt will appear here</p>
              </div>
            )}
          </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
