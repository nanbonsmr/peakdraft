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
import { Loader2, Copy, RefreshCw, Scale, Lightbulb, Pencil , Workflow } from 'lucide-react';
import { RecentContent } from './RecentContent';
import { useRecentContent } from '@/hooks/useRecentContent';
import { ExportDropdown } from '@/components/ExportDropdown';
import { InfobaseToggle, useInfobaseContext } from '@/components/InfobaseToggle';
import { WorkflowPanel, type WorkflowContext } from '@/components/WorkflowPanel';

const reportExamples = [
  "Summary of witness testimony in a civil lawsuit",
  "Legal brief for a contract dispute case",
  "Court report for a custody hearing",
  "Case summary for personal injury claim",
  "Legal memorandum on intellectual property infringement"
];

const reportTypes = [
  { value: 'brief', label: 'Legal Brief' },
  { value: 'memorandum', label: 'Legal Memorandum' },
  { value: 'summary', label: 'Case Summary' },
  { value: 'motion', label: 'Motion Document' },
  { value: 'affidavit', label: 'Affidavit' },
  { value: 'witness', label: 'Witness Statement' }
];

export default function CourtReportGenerator() {
  const [prompt, setPrompt] = useState('');
  const [reportType, setReportType] = useState('brief');
  const [caseNumber, setCaseNumber] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [workflowContext, setWorkflowContext] = useState<WorkflowContext | null>(null);
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { infobaseEnabled, setInfobaseEnabled, selectedEntry, setSelectedEntry, getBrandContextString } = useInfobaseContext();
  const { recentContent, loadRecentContent, copyContentToClipboard, handleDeleteContent } = useRecentContent('court_report');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please describe the case details",
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
      const typeLabel = reportTypes.find(t => t.value === reportType)?.label || 'Legal Brief';
      const enhancedPrompt = `Write a professional ${typeLabel} for court proceedings based on the following details: ${prompt}${caseNumber ? `. Case Reference: ${caseNumber}` : ''}. Use formal legal language, proper formatting with numbered paragraphs, relevant legal citations where appropriate, and maintain a professional, objective tone. Include proper headings and structure typical of legal documents.`;
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: enhancedPrompt,
          template_type: 'court_report',
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
        template_type: 'court_report',
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
        description: "Court report generated successfully!",
      });
    } catch (error) {
      console.error('Error generating court report:', error);
      toast({
        title: "Error",
        description: "Failed to generate court report. Please try again.",
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
      description: "Court report copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Scale className="w-6 h-6 text-primary" />
          Court Report Writer
        </h2>
        <p className="text-muted-foreground">
          Create professional legal documents and court reports with proper formatting.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case Details</CardTitle>
          <CardDescription>
            Provide the case information and we'll generate a formal legal document.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Case Number (Optional)</label>
              <Input
                placeholder="Enter case reference number"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Case Details</label>
            <Textarea
              placeholder="Describe the case facts, parties involved, key issues, and any specific points you want to address..."
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
                Generating Report...
              </>
            ) : (
              'Generate Court Report'
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Report</CardTitle>
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
                      templateType: 'court_report' 
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
            <div className="whitespace-pre-wrap bg-muted p-4 rounded-lg text-sm font-mono">
              {generatedContent}
            </div>
          </CardContent>
        </Card>
      )}

      <RecentContent
        recentContent={recentContent}
        templateTitle="Court Reports"
        templateIcon={Scale}
        templateBgColor="bg-slate-100"
        templateColor="text-slate-600"
        onCopyContent={copyContentToClipboard}
        onDeleteContent={handleDeleteContent}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Example Cases
          </CardTitle>
          <CardDescription>Click an example to use it as a starting point</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {reportExamples.map((example, index) => (
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
