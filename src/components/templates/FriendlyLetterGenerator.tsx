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
import { Loader2, Copy, RefreshCw, Heart, Lightbulb, Pencil , Workflow } from 'lucide-react';
import { RecentContent } from './RecentContent';
import { useRecentContent } from '@/hooks/useRecentContent';
import { ExportDropdown } from '@/components/ExportDropdown';
import { InfobaseToggle, useInfobaseContext } from '@/components/InfobaseToggle';
import { WorkflowPanel, type WorkflowContext } from '@/components/WorkflowPanel';

const letterExamples = [
  "Thank you letter to a friend for their support",
  "Birthday wishes to a family member",
  "Congratulations letter for a friend's new job",
  "Get well soon letter for a sick relative",
  "Apology letter to a close friend"
];

const letterTypes = [
  { value: 'thank-you', label: 'Thank You Letter' },
  { value: 'congratulations', label: 'Congratulations' },
  { value: 'birthday', label: 'Birthday Wishes' },
  { value: 'get-well', label: 'Get Well Soon' },
  { value: 'apology', label: 'Apology Letter' },
  { value: 'invitation', label: 'Invitation' },
  { value: 'sympathy', label: 'Sympathy/Condolence' },
  { value: 'friendship', label: 'General Friendship' }
];

const tones = [
  { value: 'warm', label: 'Warm & Caring' },
  { value: 'casual', label: 'Casual & Fun' },
  { value: 'heartfelt', label: 'Heartfelt & Sincere' },
  { value: 'cheerful', label: 'Cheerful & Uplifting' },
  { value: 'supportive', label: 'Supportive & Encouraging' }
];

export default function FriendlyLetterGenerator() {
  const [prompt, setPrompt] = useState('');
  const [letterType, setLetterType] = useState('thank-you');
  const [tone, setTone] = useState('warm');
  const [recipientName, setRecipientName] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [workflowContext, setWorkflowContext] = useState<WorkflowContext | null>(null);
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { infobaseEnabled, setInfobaseEnabled, selectedEntry, setSelectedEntry, getBrandContextString } = useInfobaseContext();
  const { recentContent, loadRecentContent, copyContentToClipboard, handleDeleteContent } = useRecentContent('friendly_letter');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please describe what you want to say in your letter",
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
      const typeLabel = letterTypes.find(t => t.value === letterType)?.label || 'Friendly Letter';
      const toneLabel = tones.find(t => t.value === tone)?.label || 'Warm';
      
      const enhancedPrompt = `Write a ${typeLabel} with a ${toneLabel} tone${recipientName ? ` addressed to ${recipientName}` : ''}. 

The letter should be about: ${prompt}

Guidelines:
- Keep the language friendly and personal
- Use a conversational yet caring tone
- Include appropriate greetings and closing
- Make it genuine and heartfelt
- Keep it an appropriate length (not too short, not too long)
- Add personal touches that make the recipient feel valued

The letter should feel authentic and convey genuine emotion.`;
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: enhancedPrompt,
          template_type: 'friendly_letter',
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
        template_type: 'friendly_letter',
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
        description: "Friendly letter generated successfully!",
      });
    } catch (error) {
      console.error('Error generating letter:', error);
      toast({
        title: "Error",
        description: "Failed to generate letter. Please try again.",
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
      description: "Letter copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary" />
          AI Friendly Letter Writer
        </h2>
        <p className="text-muted-foreground">
          Create warm, heartfelt letters for friends and family.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Letter Details</CardTitle>
          <CardDescription>
            Tell us about your letter and we'll help you express your feelings perfectly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Letter Type</label>
              <Select value={letterType} onValueChange={setLetterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {letterTypes.map((type) => (
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient's Name</label>
              <Input
                placeholder="e.g., Sarah, Mom, John"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">What do you want to say?</label>
            <Textarea
              placeholder="Describe what you want to express in your letter - the occasion, your feelings, memories to mention..."
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
                Writing Your Letter...
              </>
            ) : (
              'Generate Friendly Letter'
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Letter</CardTitle>
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
                      templateType: 'friendly_letter' 
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
        templateTitle="Friendly Letters"
        templateIcon={Heart}
        templateBgColor="bg-pink-100"
        templateColor="text-pink-600"
        onCopyContent={copyContentToClipboard}
        onDeleteContent={handleDeleteContent}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Example Ideas
          </CardTitle>
          <CardDescription>Click an example to use it as inspiration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {letterExamples.map((example, index) => (
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
