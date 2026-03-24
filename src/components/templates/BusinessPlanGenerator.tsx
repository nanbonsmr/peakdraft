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
import { Loader2, Copy, RefreshCw, Briefcase, Lightbulb, Pencil , Workflow } from 'lucide-react';
import { RecentContent } from './RecentContent';
import { useRecentContent } from '@/hooks/useRecentContent';
import { ExportDropdown } from '@/components/ExportDropdown';
import { InfobaseToggle, useInfobaseContext } from '@/components/InfobaseToggle';
import { WorkflowPanel, type WorkflowContext } from '@/components/WorkflowPanel';

const businessPlanExamples = [
  "Tech startup developing AI-powered customer service",
  "E-commerce platform for sustainable products",
  "Mobile app for fitness and wellness coaching",
  "Restaurant franchise expansion plan",
  "SaaS platform for project management"
];

const planSections = [
  { value: 'full', label: 'Full Business Plan' },
  { value: 'executive', label: 'Executive Summary Only' },
  { value: 'market', label: 'Market Analysis' },
  { value: 'financial', label: 'Financial Projections' },
  { value: 'marketing', label: 'Marketing Strategy' },
  { value: 'operations', label: 'Operations Plan' }
];

const businessStages = [
  { value: 'idea', label: 'Idea Stage' },
  { value: 'startup', label: 'Startup (Pre-revenue)' },
  { value: 'early', label: 'Early Stage (Some revenue)' },
  { value: 'growth', label: 'Growth Stage' },
  { value: 'expansion', label: 'Expansion/Scale' }
];

export default function BusinessPlanGenerator() {
  const [prompt, setPrompt] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [planSection, setPlanSection] = useState('executive');
  const [businessStage, setBusinessStage] = useState('startup');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [workflowContext, setWorkflowContext] = useState<WorkflowContext | null>(null);
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { infobaseEnabled, setInfobaseEnabled, selectedEntry, setSelectedEntry, getBrandContextString } = useInfobaseContext();
  const { recentContent, loadRecentContent, copyContentToClipboard, handleDeleteContent } = useRecentContent('business_plan');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please describe your business idea",
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
      const sectionLabel = planSections.find(s => s.value === planSection)?.label || 'Executive Summary';
      const stageLabel = businessStages.find(s => s.value === businessStage)?.label || 'Startup';
      
      let sectionPrompt = '';
      if (planSection === 'full') {
        sectionPrompt = 'Include all major sections: Executive Summary, Company Description, Market Analysis, Organization & Management, Products/Services, Marketing Strategy, Funding Request (if applicable), and Financial Projections.';
      } else if (planSection === 'executive') {
        sectionPrompt = 'Focus on the Executive Summary with key highlights: mission statement, business concept, unique value proposition, target market, revenue model, and funding needs.';
      } else if (planSection === 'market') {
        sectionPrompt = 'Focus on Market Analysis: industry overview, target market size and demographics, competitor analysis, market trends, and opportunities.';
      } else if (planSection === 'financial') {
        sectionPrompt = 'Focus on Financial Projections: revenue forecasts, cost structure, break-even analysis, funding requirements, and key financial metrics.';
      } else if (planSection === 'marketing') {
        sectionPrompt = 'Focus on Marketing Strategy: target audience, positioning, pricing strategy, promotion channels, customer acquisition, and growth tactics.';
      } else if (planSection === 'operations') {
        sectionPrompt = 'Focus on Operations Plan: business model, key processes, technology requirements, team structure, and operational milestones.';
      }

      const enhancedPrompt = `Create a ${sectionLabel} for a business plan.

${businessName ? `Business Name: ${businessName}` : ''}
${industry ? `Industry: ${industry}` : ''}
Business Stage: ${stageLabel}

Business Concept:
${prompt}

${sectionPrompt}

Guidelines:
- Use professional business language
- Include specific, actionable insights
- Be realistic about projections and assumptions
- Highlight competitive advantages
- Address potential risks and mitigation strategies
- Format with clear headings and sections`;
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: enhancedPrompt,
          template_type: 'business_plan',
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
        template_type: 'business_plan',
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
        description: "Business plan generated successfully!",
      });
    } catch (error) {
      console.error('Error generating business plan:', error);
      toast({
        title: "Error",
        description: "Failed to generate business plan. Please try again.",
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
      description: "Business plan copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-primary" />
          Business Plan Writer
        </h2>
        <p className="text-muted-foreground">
          Create comprehensive business plans to attract investors and guide your strategy.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
          <CardDescription>
            Describe your business and we'll generate a professional plan section.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Name (Optional)</label>
              <Input
                placeholder="Your business name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Industry (Optional)</label>
              <Input
                placeholder="e.g., Technology, Healthcare, Retail"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan Section</label>
              <Select value={planSection} onValueChange={setPlanSection}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {planSections.map((section) => (
                    <SelectItem key={section.value} value={section.value}>
                      {section.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Stage</label>
              <Select value={businessStage} onValueChange={setBusinessStage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {businessStages.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Business Concept *</label>
            <Textarea
              placeholder="Describe your business idea, target market, unique value proposition, revenue model, and any other relevant details..."
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
                Writing Business Plan...
              </>
            ) : (
              'Generate Business Plan'
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Business Plan</CardTitle>
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
                      templateType: 'business_plan' 
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
        templateTitle="Business Plans"
        templateIcon={Briefcase}
        templateBgColor="bg-amber-100"
        templateColor="text-amber-600"
        onCopyContent={copyContentToClipboard}
        onDeleteContent={handleDeleteContent}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Example Business Ideas
          </CardTitle>
          <CardDescription>Click an example to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {businessPlanExamples.map((example, index) => (
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
