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
import { Loader2, Copy, RefreshCw, Newspaper, Lightbulb, Pencil } from 'lucide-react';
import { RecentContent } from './RecentContent';
import { useRecentContent } from '@/hooks/useRecentContent';
import { ExportDropdown } from '@/components/ExportDropdown';
import { InfobaseToggle, useInfobaseContext } from '@/components/InfobaseToggle';

const pressReleaseExamples = [
  "New product launch announcement",
  "Company partnership or acquisition",
  "Award or recognition received",
  "New executive hire or leadership change",
  "Charity event or community initiative"
];

const releaseTypes = [
  { value: 'product', label: 'Product Launch' },
  { value: 'partnership', label: 'Partnership/Acquisition' },
  { value: 'event', label: 'Event Announcement' },
  { value: 'milestone', label: 'Company Milestone' },
  { value: 'award', label: 'Award/Recognition' },
  { value: 'leadership', label: 'Leadership Change' },
  { value: 'funding', label: 'Funding Announcement' },
  { value: 'crisis', label: 'Crisis Communication' }
];

const tones = [
  { value: 'formal', label: 'Formal & Corporate' },
  { value: 'exciting', label: 'Exciting & Dynamic' },
  { value: 'informative', label: 'Informative & Factual' },
  { value: 'inspirational', label: 'Inspirational & Visionary' }
];

export default function PressReleaseGenerator() {
  const [prompt, setPrompt] = useState('');
  const [headline, setHeadline] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [releaseType, setReleaseType] = useState('product');
  const [tone, setTone] = useState('formal');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { infobaseEnabled, setInfobaseEnabled, selectedEntry, setSelectedEntry, getBrandContextString } = useInfobaseContext();
  const { recentContent, loadRecentContent, copyContentToClipboard, handleDeleteContent } = useRecentContent('press_release');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please provide the news details",
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
      const typeLabel = releaseTypes.find(t => t.value === releaseType)?.label || 'Announcement';
      const toneLabel = tones.find(t => t.value === tone)?.label || 'Formal';
      
      const enhancedPrompt = `Write a professional press release for a ${typeLabel}.

${companyName ? `Company: ${companyName}` : ''}
${headline ? `Suggested Headline: ${headline}` : ''}
Tone: ${toneLabel}

News Details:
${prompt}

Follow standard press release format:
1. FOR IMMEDIATE RELEASE header with date
2. Compelling headline (attention-grabbing, newsworthy)
3. Strong lead paragraph (Who, What, When, Where, Why)
4. Supporting paragraphs with quotes and details
5. Company boilerplate/About section
6. Contact information placeholder
7. ### end marker

Guidelines:
- Use third-person perspective
- Include a compelling quote from a company executive
- Keep paragraphs short and scannable
- Focus on the newsworthy angle
- Approximately 400-500 words`;
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: enhancedPrompt,
          template_type: 'press_release',
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
        template_type: 'press_release',
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
        description: "Press release generated successfully!",
      });
    } catch (error) {
      console.error('Error generating press release:', error);
      toast({
        title: "Error",
        description: "Failed to generate press release. Please try again.",
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
      description: "Press release copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Newspaper className="w-6 h-6 text-primary" />
          Press Release Generator
        </h2>
        <p className="text-muted-foreground">
          Create professional press releases that get media attention.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Release Details</CardTitle>
          <CardDescription>
            Provide the news details and we'll create a media-ready press release.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name</label>
              <Input
                placeholder="Your company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Suggested Headline (Optional)</label>
              <Input
                placeholder="Main headline for the release"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Release Type</label>
              <Select value={releaseType} onValueChange={setReleaseType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {releaseTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tone</label>
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
          
          <div className="space-y-2">
            <label className="text-sm font-medium">News Details *</label>
            <Textarea
              placeholder="Describe the news - what happened, why it matters, key details, quotes to include, relevant dates and statistics..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
            />
          </div>

          <InfobaseToggle enabled={infobaseEnabled} onToggle={setInfobaseEnabled} selectedEntry={selectedEntry} onSelectEntry={setSelectedEntry} />

          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Writing Press Release...
              </>
            ) : (
              'Generate Press Release'
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Press Release</CardTitle>
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
                      templateType: 'press_release' 
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
        templateTitle="Press Releases"
        templateIcon={Newspaper}
        templateBgColor="bg-blue-100"
        templateColor="text-blue-600"
        onCopyContent={copyContentToClipboard}
        onDeleteContent={handleDeleteContent}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Example Announcements
          </CardTitle>
          <CardDescription>Click an example to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {pressReleaseExamples.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setPrompt(example)}
              >
                {example}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
