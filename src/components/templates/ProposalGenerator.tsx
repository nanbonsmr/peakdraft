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
import { Loader2, Copy, RefreshCw, FileCheck, Lightbulb, Pencil } from 'lucide-react';
import { RecentContent } from './RecentContent';
import { useRecentContent } from '@/hooks/useRecentContent';
import { ExportDropdown } from '@/components/ExportDropdown';
import { InfobaseToggle, useInfobaseContext } from '@/components/InfobaseToggle';

const proposalExamples = [
  "A proposal for a new marketing campaign for a tech startup",
  "Business proposal for partnership between two companies",
  "Project proposal for website redesign and development",
  "Proposal for implementing a new CRM system",
  "Research proposal for market analysis study"
];

const proposalTypes = [
  { value: 'business', label: 'Business Proposal' },
  { value: 'project', label: 'Project Proposal' },
  { value: 'research', label: 'Research Proposal' },
  { value: 'partnership', label: 'Partnership Proposal' },
  { value: 'funding', label: 'Funding/Grant Proposal' },
  { value: 'sales', label: 'Sales Proposal' }
];

export default function ProposalGenerator() {
  const [prompt, setPrompt] = useState('');
  const [proposalType, setProposalType] = useState('business');
  const [clientName, setClientName] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { infobaseEnabled, setInfobaseEnabled, selectedEntry, setSelectedEntry, getBrandContextString } = useInfobaseContext();
  const { recentContent, loadRecentContent, copyContentToClipboard, handleDeleteContent } = useRecentContent('proposal');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please describe your proposal requirements",
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
      const typeLabel = proposalTypes.find(t => t.value === proposalType)?.label || 'Business Proposal';
      const enhancedPrompt = `Write a professional ${typeLabel} for the following: ${prompt}${clientName ? `. Client/Recipient: ${clientName}` : ''}. Include proper sections like executive summary, objectives, methodology, timeline, budget considerations, and conclusion. Make it persuasive and well-structured.`;
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: enhancedPrompt,
          template_type: 'proposal',
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
        template_type: 'proposal',
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
        description: "Proposal generated successfully!",
      });
    } catch (error) {
      console.error('Error generating proposal:', error);
      toast({
        title: "Error",
        description: "Failed to generate proposal. Please try again.",
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
      description: "Proposal copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileCheck className="w-6 h-6 text-primary" />
          Proposal Writer
        </h2>
        <p className="text-muted-foreground">
          Create professional proposals that win clients and close deals.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proposal Details</CardTitle>
          <CardDescription>
            Describe your proposal requirements and we'll generate a professional document.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Proposal Type</label>
              <Select value={proposalType} onValueChange={setProposalType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {proposalTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Client/Recipient Name (Optional)</label>
              <Input
                placeholder="Enter client or recipient name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Proposal Requirements</label>
            <Textarea
              placeholder="Describe what your proposal is about, the problem you're solving, your solution, and any specific requirements..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
            />
          </div>

          <InfobaseToggle enabled={infobaseEnabled} onToggle={setInfobaseEnabled} selectedEntry={selectedEntry} onSelectEntry={setSelectedEntry} />

          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Proposal...
              </>
            ) : (
              'Generate Proposal'
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Proposal</CardTitle>
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
                      templateType: 'proposal' 
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
        templateTitle="Proposals"
        templateIcon={FileCheck}
        templateBgColor="bg-teal-100"
        templateColor="text-teal-600"
        onCopyContent={copyContentToClipboard}
        onDeleteContent={handleDeleteContent}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Example Proposals
          </CardTitle>
          <CardDescription>Click an example to use it as a starting point</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {proposalExamples.map((example, index) => (
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
