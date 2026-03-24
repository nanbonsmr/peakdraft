import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Loader2, Copy, RefreshCw, ImagePlus, Lightbulb, Pencil , Workflow } from 'lucide-react';
import { RecentContent } from './RecentContent';
import { InfobaseToggle, useInfobaseContext } from '@/components/InfobaseToggle';
import { WorkflowPanel, type WorkflowContext } from '@/components/WorkflowPanel';
import { useRecentContent } from '@/hooks/useRecentContent';

const adsImageExamples = [
  "E-commerce product ad for wireless headphones",
  "Real estate advertisement for luxury apartments",
  "Food delivery app promotional banner",
  "Fitness supplement product advertisement",
  "SaaS software promotional image"
];

const adPlatforms = [
  { value: 'facebook', label: 'Facebook/Instagram Ads' },
  { value: 'google', label: 'Google Display Ads' },
  { value: 'linkedin', label: 'LinkedIn Ads' },
  { value: 'twitter', label: 'Twitter/X Ads' },
  { value: 'tiktok', label: 'TikTok Ads' },
  { value: 'pinterest', label: 'Pinterest Ads' }
];

const aspectRatios = [
  { value: '1:1', label: '1:1 (Square)' },
  { value: '16:9', label: '16:9 (Landscape)' },
  { value: '9:16', label: '9:16 (Portrait/Story)' },
  { value: '4:5', label: '4:5 (Instagram Feed)' },
  { value: '2:3', label: '2:3 (Pinterest)' }
];

export default function AdsImagePromptGenerator() {
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('facebook');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [brandColors, setBrandColors] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [workflowContext, setWorkflowContext] = useState<WorkflowContext | null>(null);
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { infobaseEnabled, setInfobaseEnabled, selectedEntry, setSelectedEntry, getBrandContextString } = useInfobaseContext();
  const { recentContent, loadRecentContent, copyContentToClipboard, handleDeleteContent } = useRecentContent('ads_image_prompt');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please describe your advertisement",
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
      const platformLabel = adPlatforms.find(p => p.value === platform)?.label || 'Social Media';
      const ratioLabel = aspectRatios.find(r => r.value === aspectRatio)?.label || '1:1';
      
      const enhancedPrompt = `Create a detailed AI image generation prompt for a ${platformLabel} advertisement with the following details: ${prompt}. 
      
Specifications:
- Aspect ratio: ${ratioLabel}
- Platform: ${platformLabel}
${brandColors ? `- Brand colors to incorporate: ${brandColors}` : ''}

The prompt should include:
1. Main visual composition and layout
2. Product/service placement and styling
3. Background design and atmosphere
4. Lighting and color scheme
5. Text overlay positioning suggestions
6. Call-to-action element placement
7. Style reference (photography, 3D render, illustration, etc.)
8. Technical quality specifications (8K, professional, commercial quality)

Make the prompt optimized for AI image generators like Midjourney, DALL-E, or Stable Diffusion.`;
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: enhancedPrompt,
          template_type: 'ads_image_prompt',
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
        template_type: 'ads_image_prompt',
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
        description: "Ad image prompt generated successfully!",
      });
    } catch (error) {
      console.error('Error generating ads image prompt:', error);
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
          <ImagePlus className="w-6 h-6 text-primary" />
          AI Ads Image Prompt Generator
        </h2>
        <p className="text-muted-foreground">
          Create detailed prompts for generating stunning advertisement images.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Advertisement Details</CardTitle>
          <CardDescription>
            Describe your ad and we'll create an optimized prompt for AI image generation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {adPlatforms.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Aspect Ratio</label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aspectRatios.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Brand Colors (Optional)</label>
              <Input
                placeholder="e.g., blue, gold, white"
                value={brandColors}
                onChange={(e) => setBrandColors(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Advertisement Description</label>
            <Textarea
              placeholder="Describe your product/service, target audience, key message, and desired mood..."
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
              'Generate Ad Image Prompt'
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
                      templateType: 'ads_image_prompt' 
                    } 
                  })}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit & Export
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
        templateTitle="Ads Image Prompts"
        templateIcon={ImagePlus}
        templateBgColor="bg-orange-100"
        templateColor="text-orange-600"
        onCopyContent={copyContentToClipboard}
        onDeleteContent={handleDeleteContent}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Example Ads
          </CardTitle>
          <CardDescription>Click an example to use it as a starting point</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {adsImageExamples.map((example, index) => (
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
