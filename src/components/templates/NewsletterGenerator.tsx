import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Copy, RefreshCw, Newspaper, Sparkles, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useRecentContent } from '@/hooks/useRecentContent';
import { RecentContent } from './RecentContent';
import { ExportDropdown } from '@/components/ExportDropdown';
import { InfobaseToggle, useInfobaseContext } from '@/components/InfobaseToggle';

const newsletterExamples = [
  "Weekly tech industry roundup for startup founders",
  "Monthly wellness tips for busy professionals",
  "Bi-weekly marketing trends and strategies",
  "Weekly personal finance insights for millennials",
  "Monthly book recommendations for entrepreneurs"
];

const newsletterTypes = [
  { value: 'curated', label: 'Curated Content' },
  { value: 'educational', label: 'Educational' },
  { value: 'news-roundup', label: 'News Roundup' },
  { value: 'tips-tricks', label: 'Tips & Tricks' },
  { value: 'industry-update', label: 'Industry Update' },
  { value: 'personal', label: 'Personal/Creator' }
];

const tones = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'casual', label: 'Casual' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'conversational', label: 'Conversational' }
];

export function NewsletterGenerator() {
  const [prompt, setPrompt] = useState('');
  const [newsletterName, setNewsletterName] = useState('');
  const [newsletterType, setNewsletterType] = useState('curated');
  const [tone, setTone] = useState('friendly');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { infobaseEnabled, setInfobaseEnabled, selectedEntry, setSelectedEntry, getBrandContextString } = useInfobaseContext();
  const { recentContent, loadRecentContent, copyContentToClipboard, handleDeleteContent } = useRecentContent('newsletter');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic or theme for your newsletter",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate content",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    const wordsUsed = profile?.words_used || 0;
    const wordsLimit = profile?.words_limit || 5000;
    
    if (wordsUsed >= wordsLimit) {
      toast({
        title: "Word limit reached",
        description: "You've reached your word limit. Please upgrade your plan.",
        variant: "destructive"
      });
      navigate('/app/pricing');
      return;
    }

    setIsGenerating(true);
    try {
      const selectedType = newsletterTypes.find(t => t.value === newsletterType)?.label;
      const selectedTone = tones.find(t => t.value === tone)?.label;
      
      const enhancedPrompt = `Create a newsletter about: ${prompt}

${newsletterName ? `Newsletter Name: ${newsletterName}` : ''}
Newsletter Type: ${selectedType}
Tone: ${selectedTone}

Requirements:
- Start with a compelling subject line suggestion
- Include a warm greeting/intro
- Structure content with clear sections and headers
- Add 3-5 key points or stories
- Include actionable takeaways
- End with a CTA and sign-off
- Keep it scannable with bullet points where appropriate
- Aim for 400-600 words`;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          template_type: 'newsletter',
          prompt: enhancedPrompt,
          language: 'english',
          brand_context: getBrandContextString() || undefined
        }
      });

      if (error) throw error;

      setGeneratedContent(data.generated_content);

      await supabase.from('content_generations').insert({
        user_id: user.id,
        template_type: 'newsletter',
        prompt: prompt,
        generated_content: data.generated_content,
        word_count: data.word_count
      });

      await supabase.rpc('update_word_usage', {
        user_uuid: user.id,
        words_to_add: data.word_count
      });

      await refreshProfile();
      await loadRecentContent();

      toast({
        title: "Success!",
        description: `Newsletter generated (${data.word_count} words used)`
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to generate newsletter. Please try again.",
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
      description: "Newsletter copied to clipboard"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            Newsletter Generator
          </CardTitle>
          <CardDescription>
            Create engaging newsletters that keep your audience coming back
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newsletter-name">Newsletter Name (optional)</Label>
            <Input
              id="newsletter-name"
              placeholder="E.g., The Weekly Digest"
              value={newsletterName}
              onChange={(e) => setNewsletterName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">What's this newsletter about?</Label>
            <Textarea
              id="prompt"
              placeholder="E.g., Weekly tech industry roundup for startup founders..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Newsletter Type</Label>
              <Select value={newsletterType} onValueChange={setNewsletterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {newsletterTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <InfobaseToggle enabled={infobaseEnabled} onToggle={setInfobaseEnabled} selectedEntry={selectedEntry} onSelectEntry={setSelectedEntry} />

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
                Generate Newsletter
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Newsletter</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Regenerate
                </Button>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => navigate('/app/editor', { 
                    state: { 
                      content: generatedContent, 
                      title: prompt.slice(0, 50),
                      templateType: 'newsletter' 
                    } 
                  })}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit & Export
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
              {generatedContent}
            </div>
          </CardContent>
        </Card>
      )}

      <RecentContent 
        recentContent={recentContent}
        templateTitle="Newsletters"
        templateIcon={Newspaper}
        templateBgColor="bg-green-100"
        templateColor="text-green-600"
        onCopyContent={copyContentToClipboard}
        onDeleteContent={handleDeleteContent}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Newsletter Ideas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {newsletterExamples.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start h-auto py-2 px-3 text-left"
                onClick={() => setPrompt(example)}
              >
                <Sparkles className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm">{example}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
