import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Copy, RefreshCw, Linkedin, Sparkles, Pencil , Workflow } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useRecentContent } from '@/hooks/useRecentContent';
import { RecentContent } from './RecentContent';
import { ExportDropdown } from '@/components/ExportDropdown';
import { InfobaseToggle, useInfobaseContext } from '@/components/InfobaseToggle';
import { WorkflowPanel, type WorkflowContext } from '@/components/WorkflowPanel';

const linkedinExamples = [
  "Share insights about the future of AI in business",
  "Announce my new role as Marketing Director",
  "Share lessons learned from a failed startup",
  "Celebrate a team milestone of reaching 1M users",
  "Discuss the importance of work-life balance"
];

const postTypes = [
  { value: 'thought-leadership', label: 'Thought Leadership' },
  { value: 'career-update', label: 'Career Update' },
  { value: 'industry-insights', label: 'Industry Insights' },
  { value: 'personal-story', label: 'Personal Story' },
  { value: 'tips-advice', label: 'Tips & Advice' },
  { value: 'celebration', label: 'Celebration/Win' }
];

const tones = [
  { value: 'professional', label: 'Professional' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'authentic', label: 'Authentic' },
  { value: 'motivational', label: 'Motivational' }
];

export function LinkedInPostGenerator() {
  const [prompt, setPrompt] = useState('');
  const [postType, setPostType] = useState('thought-leadership');
  const [tone, setTone] = useState('professional');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [workflowContext, setWorkflowContext] = useState<WorkflowContext | null>(null);
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { infobaseEnabled, setInfobaseEnabled, selectedEntry, setSelectedEntry, getBrandContextString } = useInfobaseContext();
  const { recentContent, loadRecentContent, copyContentToClipboard, handleDeleteContent } = useRecentContent('linkedin_post');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic or idea for your LinkedIn post",
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
      const selectedType = postTypes.find(t => t.value === postType)?.label;
      const selectedTone = tones.find(t => t.value === tone)?.label;
      
      const enhancedPrompt = `Create a LinkedIn post about: ${prompt}

Post Type: ${selectedType}
Tone: ${selectedTone}

Requirements:
- Start with a hook that grabs attention
- Use short paragraphs and line breaks for readability
- Include relevant emojis sparingly
- End with a call-to-action or question to encourage engagement
- Keep it under 1300 characters for optimal engagement
- Make it authentic and shareable`;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          template_type: 'linkedin_post',
          prompt: enhancedPrompt,
          language: 'english',
          brand_context: getBrandContextString() || undefined
        }
      });

      if (error) throw error;

      setGeneratedContent(data.generated_content);

      await supabase.from('content_generations').insert({
        user_id: user.id,
        template_type: 'linkedin_post',
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
        description: `LinkedIn post generated (${data.word_count} words used)`
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to generate LinkedIn post. Please try again.",
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
      description: "LinkedIn post copied to clipboard"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Linkedin className="h-5 w-5 text-primary" />
            LinkedIn Post Generator
          </CardTitle>
          <CardDescription>
            Create engaging LinkedIn posts that boost your professional presence
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">What do you want to post about?</Label>
            <Textarea
              id="prompt"
              placeholder="E.g., Share insights about the future of AI in business..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Post Type</Label>
              <Select value={postType} onValueChange={setPostType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {postTypes.map((type) => (
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
                Generate LinkedIn Post
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated LinkedIn Post</span>
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
                      templateType: 'linkedin_post' 
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
        templateTitle="LinkedIn Posts"
        templateIcon={Linkedin}
        templateBgColor="bg-blue-100"
        templateColor="text-blue-600"
        onCopyContent={copyContentToClipboard}
        onDeleteContent={handleDeleteContent}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Post Ideas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {linkedinExamples.map((example, index) => (
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
