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
import { FileEdit, Sparkles, Copy, CreditCard, Lightbulb } from 'lucide-react';
import { useRecentContent } from '@/hooks/useRecentContent';
import { RecentContent } from './RecentContent';

const letterExamples = [
  "Write a professional cover letter for a Software Engineer position at a tech startup",
  "Create a formal business proposal letter for a new partnership opportunity",
  "Generate a resignation letter with two weeks notice, maintaining positive relationships",
  "Write a recommendation letter for a former colleague applying to graduate school"
];

const letterTypes = [
  { value: 'cover', label: 'Cover Letter' },
  { value: 'business', label: 'Business Letter' },
  { value: 'resignation', label: 'Resignation Letter' },
  { value: 'recommendation', label: 'Recommendation Letter' },
  { value: 'complaint', label: 'Complaint Letter' },
  { value: 'thank-you', label: 'Thank You Letter' }
];

export default function LetterGenerator() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [recipient, setRecipient] = useState('');
  const [letterType, setLetterType] = useState('cover');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { recentContent, loadRecentContent, copyContentToClipboard, handleDeleteContent } = useRecentContent('letter');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing information",
        description: "Please describe the purpose of your letter.",
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
      const letterTypeLabel = letterTypes.find(t => t.value === letterType)?.label;
      const enhancedPrompt = `Write a professional ${letterTypeLabel} ${recipient ? `to ${recipient}` : ''}:\n\n${prompt}\n\nMake it well-structured with proper formatting, appropriate tone, clear opening and closing, and maintain professional standards.`;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          template_type: 'letter',
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
          template_type: 'letter',
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
      await loadRecentContent();
      
      toast({
        title: "Letter generated!",
        description: `Generated ${wordCount} words successfully.`
      });

    } catch (error: any) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate letter.",
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
          <FileEdit className="w-6 h-6 text-rose-600" />
          Letter Writer
        </h2>
        <p className="text-muted-foreground">
          Generate professional letters for any purpose with proper formatting
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Letter Details
            </CardTitle>
            <CardDescription>
              Provide information about the letter you need
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="letterType">Letter Type</Label>
              <Select value={letterType} onValueChange={setLetterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select letter type" />
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
              <Label htmlFor="recipient">Recipient (optional)</Label>
              <Input
                id="recipient"
                placeholder="e.g., Hiring Manager, Company Name, Person's Name"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose & Context</Label>
              <Textarea
                id="purpose"
                placeholder="Describe the purpose of the letter, key points to include, relevant background..."
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
                  Generating Letter...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Letter
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Generated Letter</CardTitle>
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
                <FileEdit className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Your letter will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Content */}
        <RecentContent
          recentContent={recentContent}
          templateTitle="Letters"
          templateIcon={FileEdit}
          templateBgColor="bg-rose-500/20"
          templateColor="text-rose-600 dark:text-rose-400"
          onCopyContent={copyContentToClipboard}
          onDeleteContent={handleDeleteContent}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Example Prompts
            </CardTitle>
            <CardDescription>
              Click on any example to use it as your starting point
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {letterExamples.map((example, index) => (
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
    </div>
  );
}
