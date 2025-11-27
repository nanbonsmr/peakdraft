import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Copy, Bot, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const promptExamples = [
  "Create a prompt for generating marketing copy for a SaaS product",
  "Generate a prompt for a creative writing assistant",
  "Create a prompt for a coding tutor specializing in Python",
  "Generate a prompt for a business strategy consultant"
];

export default function ChatGPTPromptGenerator() {
  const [prompt, setPrompt] = useState('');
  const [purpose, setPurpose] = useState('');
  const [context, setContext] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please describe what kind of ChatGPT prompt you need",
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
      const enhancedPrompt = `Generate an effective and detailed ChatGPT prompt for: ${prompt}. Purpose: ${purpose || 'general use'}. Context: ${context || 'none'}. Include clear instructions, role definition, constraints, and desired output format. Make it comprehensive and professional.`;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { 
          prompt: enhancedPrompt,
          templateType: 'chatgpt-prompt'
        }
      });

      if (error) throw error;

      const content = data.content;
      const wordCount = content.split(/\s+/).length;

      setGeneratedContent(content);

      await supabase.from('content_generations').insert({
        user_id: profile.user_id,
        template_type: 'chatgpt-prompt',
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
        description: "ChatGPT prompt generated successfully"
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate prompt",
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
      description: "Prompt copied to clipboard"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">ChatGPT Prompt Generator</h1>
        <p className="text-muted-foreground">Create effective and detailed prompts for ChatGPT and other AI assistants</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prompt Requirements</CardTitle>
              <CardDescription>Describe the AI assistant you want to create</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose/Use Case</Label>
                <Input
                  id="purpose"
                  placeholder="e.g., Content creation, Code review, Tutoring"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="context">Additional Context</Label>
                <Input
                  id="context"
                  placeholder="e.g., Target audience, tone, constraints"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">What should the prompt do?</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe in detail what you want the AI to help with..."
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
                    Generate Prompt
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Example Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {promptExamples.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-4"
                  onClick={() => setPrompt(example)}
                >
                  <Bot className="mr-2 h-4 w-4 flex-shrink-0" />
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
              Generated Prompt
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
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Your generated prompt will appear here</p>
              </div>
            )}
          </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
