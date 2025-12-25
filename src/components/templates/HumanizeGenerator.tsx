import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Sparkles, 
  Copy, 
  CreditCard, 
  Lightbulb, 
  Settings2, 
  Wand2,
  Zap,
  Shield,
  MessageCircle,
  FileText,
  Briefcase,
  GraduationCap,
  Heart,
  Newspaper,
  ArrowLeftRight,
  Columns2,
  FileOutput
} from 'lucide-react';
import { useRecentContent } from '@/hooks/useRecentContent';
import { RecentContent } from './RecentContent';

const writingStyles = [
  { value: 'conversational', label: 'Conversational', icon: MessageCircle, description: 'Friendly and casual tone' },
  { value: 'professional', label: 'Professional', icon: Briefcase, description: 'Business-appropriate language' },
  { value: 'academic', label: 'Academic', icon: GraduationCap, description: 'Scholarly and formal' },
  { value: 'creative', label: 'Creative', icon: Heart, description: 'Artistic and expressive' },
  { value: 'journalistic', label: 'Journalistic', icon: Newspaper, description: 'News-style clarity' },
];

const contentTypes = [
  { value: 'general', label: 'General Text' },
  { value: 'blog', label: 'Blog Post' },
  { value: 'email', label: 'Email' },
  { value: 'social', label: 'Social Media' },
  { value: 'essay', label: 'Essay/Article' },
  { value: 'marketing', label: 'Marketing Copy' },
];

const humanizeExamples = [
  "The implementation of strategic methodologies facilitates optimal outcomes in organizational performance metrics.",
  "It is imperative to acknowledge that the aforementioned circumstances necessitate immediate attention and remediation.",
  "Per our previous correspondence, we would like to inform you that the deliverables have been finalized.",
  "The utilization of advanced technological solutions enables enhanced operational efficiency.",
  "In conclusion, it can be stated that the evidence presented supports the hypothesis outlined in the introduction."
];

export default function HumanizeGenerator() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Advanced options
  const [writingStyle, setWritingStyle] = useState('conversational');
  const [contentType, setContentType] = useState('general');
  const [humanizationLevel, setHumanizationLevel] = useState([70]);
  const [preserveKeywords, setPreserveKeywords] = useState(true);
  const [addPersonality, setAddPersonality] = useState(true);
  const [removeAiPatterns, setRemoveAiPatterns] = useState(true);
  const [useContractions, setUseContractions] = useState(true);
  const [viewMode, setViewMode] = useState<'result' | 'comparison'>('result');
  const [originalText, setOriginalText] = useState('');

  const { recentContent, loadRecentContent, copyContentToClipboard, handleDeleteContent } = useRecentContent('humanize');

  const getHumanizationLabel = (value: number) => {
    if (value < 30) return { label: 'Subtle', color: 'bg-blue-500' };
    if (value < 60) return { label: 'Moderate', color: 'bg-yellow-500' };
    if (value < 85) return { label: 'Strong', color: 'bg-orange-500' };
    return { label: 'Maximum', color: 'bg-red-500' };
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter the text you want to humanize.",
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
      const styleDescriptions: Record<string, string> = {
        conversational: 'friendly, casual, and approachable like talking to a friend',
        professional: 'polished and business-appropriate while remaining personable',
        academic: 'scholarly yet accessible, maintaining intellectual rigor',
        creative: 'expressive and artistic with vivid language',
        journalistic: 'clear, factual, and engaging like quality journalism'
      };

      const contentTypeDescriptions: Record<string, string> = {
        general: '',
        blog: 'Format it appropriately for a blog post with good paragraph breaks.',
        email: 'Make it suitable for email communication with appropriate greeting/closing if needed.',
        social: 'Keep it punchy and suitable for social media.',
        essay: 'Maintain an essay structure with logical flow.',
        marketing: 'Make it persuasive while authentic.'
      };

      const humanizeSettings = [];
      if (removeAiPatterns) humanizeSettings.push('aggressively remove AI-typical phrases and patterns');
      if (useContractions) humanizeSettings.push('use natural contractions (don\'t, won\'t, it\'s, etc.)');
      if (addPersonality) humanizeSettings.push('inject subtle personality and human touches');
      if (preserveKeywords) humanizeSettings.push('preserve important keywords and key information');

      const intensityInstruction = humanizationLevel[0] > 70 
        ? 'Apply heavy transformation - significantly rephrase and restructure while keeping the meaning.'
        : humanizationLevel[0] > 40
        ? 'Apply moderate transformation - rephrase noticeably while maintaining structure.'
        : 'Apply subtle transformation - gentle refinements to remove obvious AI patterns.';

      const enhancedPrompt = `Transform this text to sound completely natural and human-written.

WRITING STYLE: ${styleDescriptions[writingStyle]}
${contentTypeDescriptions[contentType] ? `CONTENT TYPE: ${contentTypeDescriptions[contentType]}` : ''}
INTENSITY: ${intensityInstruction}

SPECIFIC INSTRUCTIONS:
${humanizeSettings.map(s => `- ${s}`).join('\n')}

TEXT TO HUMANIZE:
${prompt}`;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          template_type: 'humanize',
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
          template_type: 'humanize',
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

      setOriginalText(prompt);
      setGeneratedContent(generatedContentText);
      setViewMode('comparison');
      await refreshProfile();
      await loadRecentContent();
      
      toast({
        title: "Text humanized!",
        description: `Generated ${wordCount} words with ${writingStyles.find(s => s.value === writingStyle)?.label} style.`
      });

    } catch (error: any) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to humanize content.",
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

  const humanizationInfo = getHumanizationLabel(humanizationLevel[0]);

  return (
    <div className="space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bot className="w-6 h-6 text-cyan-600" />
          AI Text Humanizer
          <Badge variant="secondary" className="ml-2">Advanced</Badge>
        </h2>
        <p className="text-muted-foreground">
          Transform AI-generated text into natural, undetectable human writing with advanced customization
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Input Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Text to Humanize
              </CardTitle>
              <CardDescription>
                Paste AI-generated or robotic text to transform it into natural human writing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your AI-generated or formal text here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={10}
                className="resize-none"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{prompt.split(/\s+/).filter(Boolean).length} words</span>
                <span>{prompt.length} characters</span>
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
                    Humanizing Text...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Humanize Text
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Result
              </CardTitle>
              {generatedContent && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-lg p-1">
                    <Button
                      variant={viewMode === 'result' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => setViewMode('result')}
                    >
                      <FileOutput className="w-3 h-3 mr-1" />
                      Result
                    </Button>
                    <Button
                      variant={viewMode === 'comparison' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => setViewMode('comparison')}
                    >
                      <Columns2 className="w-3 h-3 mr-1" />
                      Compare
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyToClipboard}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {generatedContent ? (
                viewMode === 'comparison' ? (
                  /* Comparison View */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Original Text */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            Original (AI Text)
                          </Label>
                          <Badge variant="destructive" className="text-xs">Before</Badge>
                        </div>
                        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 max-h-80 overflow-y-auto">
                          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
                            {originalText}
                          </pre>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {originalText.split(/\s+/).filter(Boolean).length} words
                        </div>
                      </div>

                      {/* Humanized Text */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Humanized
                          </Label>
                          <Badge className="text-xs bg-green-500 hover:bg-green-600">After</Badge>
                        </div>
                        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 max-h-80 overflow-y-auto">
                          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                            {generatedContent}
                          </pre>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {generatedContent.split(/\s+/).filter(Boolean).length} words
                        </div>
                      </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-muted/50 rounded-lg border">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Word change:</span>
                          <Badge variant="outline">
                            {generatedContent.split(/\s+/).filter(Boolean).length - originalText.split(/\s+/).filter(Boolean).length > 0 ? '+' : ''}
                            {generatedContent.split(/\s+/).filter(Boolean).length - originalText.split(/\s+/).filter(Boolean).length} words
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="outline" className="gap-1">
                        <Shield className="w-3 h-3" />
                        AI Detection Optimized
                      </Badge>
                    </div>
                  </div>
                ) : (
                  /* Result Only View */
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto border">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {generatedContent}
                      </pre>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{generatedContent.split(/\s+/).filter(Boolean).length} words</span>
                      <Badge variant="outline" className="gap-1">
                        <Shield className="w-3 h-3" />
                        AI Detection Optimized
                      </Badge>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-12 border border-dashed rounded-lg">
                  <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Your humanized text will appear here
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Configure settings on the right and enter your text above
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings2 className="w-4 h-4" />
                Humanization Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Writing Style */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Writing Style</Label>
                <div className="grid grid-cols-1 gap-2">
                  {writingStyles.map((style) => (
                    <Button
                      key={style.value}
                      variant={writingStyle === style.value ? "default" : "outline"}
                      className="justify-start h-auto py-2 px-3"
                      onClick={() => setWritingStyle(style.value)}
                    >
                      <style.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <div className="text-left">
                        <div className="text-sm font-medium">{style.label}</div>
                        <div className="text-xs opacity-70">{style.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Content Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Content Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Humanization Intensity */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Humanization Intensity</Label>
                  <Badge className={`${humanizationInfo.color} text-white`}>
                    {humanizationInfo.label}
                  </Badge>
                </div>
                <Slider
                  value={humanizationLevel}
                  onValueChange={setHumanizationLevel}
                  max={100}
                  step={5}
                  className="py-2"
                />
                <p className="text-xs text-muted-foreground">
                  Higher intensity = more aggressive transformation
                </p>
              </div>

              {/* Toggle Options */}
              <div className="space-y-4 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Remove AI Patterns</Label>
                    <p className="text-xs text-muted-foreground">Eliminate common AI phrases</p>
                  </div>
                  <Switch
                    checked={removeAiPatterns}
                    onCheckedChange={setRemoveAiPatterns}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Use Contractions</Label>
                    <p className="text-xs text-muted-foreground">Add natural contractions</p>
                  </div>
                  <Switch
                    checked={useContractions}
                    onCheckedChange={setUseContractions}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Add Personality</Label>
                    <p className="text-xs text-muted-foreground">Inject human touches</p>
                  </div>
                  <Switch
                    checked={addPersonality}
                    onCheckedChange={setAddPersonality}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Preserve Keywords</Label>
                    <p className="text-xs text-muted-foreground">Keep important terms</p>
                  </div>
                  <Switch
                    checked={preserveKeywords}
                    onCheckedChange={setPreserveKeywords}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="w-4 h-4" />
                Try These Examples
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {humanizeExamples.slice(0, 3).map((example, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto p-2 text-xs"
                    onClick={() => setPrompt(example)}
                  >
                    <Zap className="w-3 h-3 mr-2 flex-shrink-0 text-primary" />
                    <span className="line-clamp-2">{example}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Content */}
      <RecentContent
        recentContent={recentContent}
        templateTitle="Humanized Texts"
        templateIcon={Bot}
        templateBgColor="bg-cyan-500/20"
        templateColor="text-cyan-600 dark:text-cyan-400"
        onCopyContent={copyContentToClipboard}
        onDeleteContent={handleDeleteContent}
      />
    </div>
  );
}
