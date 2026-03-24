import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Loader2, Copy, RefreshCw, Layers, Lightbulb, Pencil , Workflow } from 'lucide-react';
import { RecentContent } from './RecentContent';
import { InfobaseToggle, useInfobaseContext } from '@/components/InfobaseToggle';
import { WorkflowPanel, type WorkflowContext } from '@/components/WorkflowPanel';
import { useRecentContent } from '@/hooks/useRecentContent';

const backgroundExamples = [
  "Abstract gradient background for a tech website",
  "Nature-inspired wallpaper with mountains and clouds",
  "Minimalist geometric pattern for mobile app",
  "Futuristic city skyline for gaming banner",
  "Soft bokeh lights for photography portfolio"
];

const backgroundStyles = [
  { value: 'abstract', label: 'Abstract/Geometric' },
  { value: 'nature', label: 'Nature/Landscape' },
  { value: 'gradient', label: 'Gradient/Color' },
  { value: 'texture', label: 'Texture/Pattern' },
  { value: 'minimal', label: 'Minimalist' },
  { value: 'futuristic', label: 'Futuristic/Sci-Fi' },
  { value: 'bokeh', label: 'Bokeh/Light Effects' }
];

const useCases = [
  { value: 'website', label: 'Website Hero' },
  { value: 'mobile', label: 'Mobile App' },
  { value: 'desktop', label: 'Desktop Wallpaper' },
  { value: 'presentation', label: 'Presentation Slide' },
  { value: 'social', label: 'Social Media' },
  { value: 'print', label: 'Print/Poster' }
];

export default function BackgroundImagePromptGenerator() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('abstract');
  const [useCase, setUseCase] = useState('website');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [workflowContext, setWorkflowContext] = useState<WorkflowContext | null>(null);
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { infobaseEnabled, setInfobaseEnabled, selectedEntry, setSelectedEntry, getBrandContextString } = useInfobaseContext();
  const { recentContent, loadRecentContent, copyContentToClipboard, handleDeleteContent } = useRecentContent('background_image_prompt');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please describe your background requirements",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate content",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    const wordsUsed = profile?.words_used || 0;
    const wordsLimit = profile?.words_limit || 500;
    if (wordsUsed >= wordsLimit) {
      toast({
        title: "Word Limit Reached",
        description: "You've reached your word limit. Please upgrade your plan.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const styleLabel = backgroundStyles.find(s => s.value === style)?.label || 'Abstract';
      const useCaseLabel = useCases.find(u => u.value === useCase)?.label || 'Website';
      
      const enhancedPrompt = `Create a detailed AI image generation prompt for a ${styleLabel} background image for ${useCaseLabel} use with the following requirements: ${prompt}.

The prompt should specify:
1. Overall composition and visual flow
2. Color palette and mood
3. Key visual elements and their placement
4. Depth and layering effects
5. Lighting and atmosphere
6. Texture and detail level
7. Resolution and quality (8K, seamless, high quality)
8. Style reference (photography, digital art, 3D render)

Important: The background should be suitable for overlaying text or other content, so ensure there's appropriate negative space and the design doesn't distract from potential foreground elements.

Make the prompt optimized for AI image generators like Midjourney, DALL-E, or Stable Diffusion.`;
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: enhancedPrompt,
          template_type: 'background_image_prompt',
          brand_context: getBrandContextString() || undefined
        }
      });

      if (error) throw error;

      const content = data.generated_content;
      setGeneratedContent(content);

      const wordCount = content.split(/\s+/).length;

      await supabase.from('content_generations').insert({
        user_id: user.id,
        prompt: prompt,
        generated_content: content,
        template_type: 'background_image_prompt',
        word_count: wordCount
      });

      await supabase.rpc('update_word_usage', {
        user_uuid: user.id,
        words_to_add: wordCount
      });

      await refreshProfile();
      await loadRecentContent();

      toast({
        title: "Success",
        description: "Background image prompt generated successfully!",
      });
    } catch (error) {
      console.error('Error generating background prompt:', error);
      toast({
        title: "Error",
        description: "Failed to generate prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Layers className="w-6 h-6 text-primary" />
          AI Background Image Prompt Generator
        </h2>
        <p className="text-muted-foreground">
          Create prompts for stunning background images perfect for any design.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Background Requirements</CardTitle>
          <CardDescription>
            Describe your ideal background and we'll create an optimized AI prompt.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Style</label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {backgroundStyles.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Use Case</label>
              <Select value={useCase} onValueChange={setUseCase}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {useCases.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Background Description</label>
            <Textarea
              placeholder="Describe your ideal background - colors, mood, elements, and any specific requirements..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>

          <InfobaseToggle enabled={infobaseEnabled} onToggle={setInfobaseEnabled} selectedEntry={selectedEntry} onSelectEntry={setSelectedEntry} />

          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Prompt...
              </>
            ) : (
              'Generate Background Prompt'
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Prompt</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => navigate('/app/editor', { 
                    state: { 
                      content: generatedContent, 
                      title: prompt.slice(0, 50),
                      templateType: 'background_image_prompt' 
                    } 
                  })}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit & Export
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setWorkflowOpen(true)}
                  className="w-fit gap-2"
                >
                  <Workflow className="w-4 h-4" />
                  Workflow
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap bg-muted p-4 rounded-lg text-sm">
              {generatedContent}
            </div>
          </CardContent>
        </Card>
      )}

      <RecentContent
        recentContent={recentContent}
        templateTitle="Background Prompts"
        templateIcon={Layers}
        templateBgColor="bg-sky-100"
        templateColor="text-sky-600"
        onCopyContent={copyContentToClipboard}
        onDeleteContent={handleDeleteContent}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Example Backgrounds
          </CardTitle>
          <CardDescription>Click an example to use it as a starting point</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {backgroundExamples.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setPrompt(example)}
              >
                {example}
              </Button>
            ))}
          
      <WorkflowPanel
        open={workflowOpen}
        onOpenChange={setWorkflowOpen}
        context={workflowContext}
      />
    </div>
        </CardContent>
      </Card>
    </div>
  );
}
