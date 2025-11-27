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
import { FileText, Sparkles, Copy, CreditCard, Lightbulb } from 'lucide-react';
import { ExportDropdown } from '@/components/ExportDropdown';

const cvExamples = [
  "Create a professional CV summary for a Senior Software Engineer with 5 years experience in React, Node.js, and cloud technologies",
  "Write a CV for an entry-level Marketing Manager with internship experience in digital marketing",
  "Generate a CV section for a Data Scientist with expertise in machine learning and Python",
  "Create professional experience descriptions for a Project Manager in the tech industry"
];

const cvSections = [
  { value: 'summary', label: 'Professional Summary' },
  { value: 'experience', label: 'Work Experience' },
  { value: 'skills', label: 'Skills Section' },
  { value: 'full', label: 'Full CV' }
];

export default function CVGenerator() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [section, setSection] = useState('full');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing information",
        description: "Please describe your background and experience.",
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
      const sectionText = section === 'full' ? 'complete CV' : cvSections.find(s => s.value === section)?.label;
      const enhancedPrompt = `Create a professional ${sectionText} for ${jobTitle ? `a ${jobTitle}` : 'the following professional'}:\n\n${prompt}\n\nMake it impactful, achievement-focused, and ATS-friendly with strong action verbs.`;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          template_type: 'cv',
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
          template_type: 'cv',
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
        title: "CV content generated!",
        description: `Generated ${wordCount} words successfully.`
      });

    } catch (error: any) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate CV content.",
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
          <FileText className="w-6 h-6 text-indigo-600" />
          CV/Resume Writer
        </h2>
        <p className="text-muted-foreground">
          Create professional, ATS-friendly CV content that highlights your achievements
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-3 gap-4 md:gap-6 flex lg:flex-none overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory lg:snap-none">
        <div className="lg:col-span-2 space-y-4 md:space-y-6 min-w-[320px] lg:min-w-0 snap-start flex-shrink-0 lg:flex-shrink">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Professional Details
              </CardTitle>
              <CardDescription>
                Provide information about your professional background
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Target Job Title (optional)</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g., Senior Software Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="section">CV Section</Label>
                <Select value={section} onValueChange={setSection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {cvSections.map((sectionOption) => (
                      <SelectItem key={sectionOption.value} value={sectionOption.value}>
                        {sectionOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background">Background & Experience</Label>
                <Textarea
                  id="background"
                  placeholder="Describe your experience, skills, achievements, education..."
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
                    Generating CV...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate CV Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

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
                {cvExamples.map((example, index) => (
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

        <div className="min-w-[320px] lg:min-w-0 snap-start flex-shrink-0 lg:flex-shrink">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Generated CV</CardTitle>
              {generatedContent && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyToClipboard}
                    className="w-fit"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <ExportDropdown
                    content={generatedContent}
                    filename={`cv-${Date.now()}`}
                  />
                </div>
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
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Your CV content will appear here
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