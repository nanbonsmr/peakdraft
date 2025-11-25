import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Video, Sparkles, Copy, CreditCard, Lightbulb } from 'lucide-react';

const scriptExamples = [
  "Create a 2-minute explainer video script about blockchain technology for beginners",
  "Write a YouTube video script for a product review of wireless earbuds",
  "Generate a podcast intro script for a tech news show",
  "Create a TikTok video script about productivity tips for students"
];

const scriptTypes = [
  { value: 'youtube', label: 'YouTube Video' },
  { value: 'explainer', label: 'Explainer Video' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'tiktok', label: 'TikTok/Short-form' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'presentation', label: 'Presentation' }
];

const durations = [
  { value: '30s', label: '30 seconds' },
  { value: '1min', label: '1 minute' },
  { value: '2min', label: '2 minutes' },
  { value: '5min', label: '5 minutes' },
  { value: '10min', label: '10+ minutes' }
];

export default function ScriptGenerator() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [scriptType, setScriptType] = useState('youtube');
  const [duration, setDuration] = useState('2min');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing information",
        description: "Please describe your script topic and content.",
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
      const scriptTypeLabel = scriptTypes.find(t => t.value === scriptType)?.label;
      const durationLabel = durations.find(d => d.value === duration)?.label;
      const enhancedPrompt = `Create a ${durationLabel} ${scriptTypeLabel} script ${title ? `titled "${title}"` : ''} about:\n\n${prompt}\n\nInclude engaging hooks, clear structure with scene descriptions, natural dialogue/narration, timing cues, and strong call-to-action. Format it professionally with proper scene breaks.`;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          template_type: 'script',
          prompt: enhancedPrompt,
          language: 'en'
        }
      });

      if (error) throw error;

      const generatedContentText = data.generated_content;
      const wordCount = data.word_count || generatedContentText.split(' ').length;
      
      const { error: insertError } = await supabase
        .from('content_generations')
        .insert({
          user_id: profile.user_id,
          template_type: 'script',
          prompt: prompt,
          generated_content: generatedContentText,
          word_count: wordCount,
          language: 'en'
        });

      if (insertError) throw insertError;

      const { error: updateError } = await supabase.rpc('update_word_usage', {
        user_uuid: profile.user_id,
        words_to_add: wordCount
      });

      if (updateError) throw updateError;

      setGeneratedContent(generatedContentText);
      await refreshProfile();
      
      toast({
        title: "Script generated!",
        description: `Generated ${wordCount} words successfully.`
      });

    } catch (error: any) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate script.",
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
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Video className="w-6 h-6 text-amber-600" />
          Script Writer
        </h2>
        <p className="text-muted-foreground">
          Generate engaging video and audio scripts with proper timing and structure
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Script Details
              </CardTitle>
              <CardDescription>
                Provide information about the script you need
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title (optional)</Label>
                <Input
                  id="title"
                  placeholder="e.g., Top 5 Productivity Hacks"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scriptType">Script Type</Label>
                  <Select value={scriptType} onValueChange={setScriptType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {scriptTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {durations.map((dur) => (
                        <SelectItem key={dur.value} value={dur.value}>
                          {dur.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Script Topic & Content</Label>
                <Textarea
                  id="topic"
                  placeholder="Describe what the script is about, key points to cover, target audience..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
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
                    Generating Script...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Script
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Example Scripts
              </CardTitle>
              <CardDescription>
                Click on any example to use it as your starting point
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {scriptExamples.map((example, index) => (
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

        <div>
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Generated Script</CardTitle>
              {generatedContent && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyToClipboard}
                  className="w-fit"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Content
                </Button>
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
                  <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Your script will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}