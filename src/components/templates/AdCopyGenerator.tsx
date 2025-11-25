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
import { Megaphone, Sparkles, Copy, CreditCard, Lightbulb, Target } from 'lucide-react';

const adExamples = [
  "Create compelling ad copy for a new fitness app targeting busy professionals",
  "Write persuasive copy for a luxury skincare product launch",
  "Generate ads for a local restaurant's weekend special menu",
  "Create Facebook ads for an online course about digital marketing"
];

const adPlatforms = [
  { value: 'facebook', label: 'Facebook Ads', limit: 'Headlines: 40 chars, Text: 125 chars' },
  { value: 'google', label: 'Google Ads', limit: 'Headlines: 30 chars, Descriptions: 90 chars' },
  { value: 'instagram', label: 'Instagram Ads', limit: 'Text: 2200 chars' },
  { value: 'linkedin', label: 'LinkedIn Ads', limit: 'Headlines: 150 chars, Text: 600 chars' },
  { value: 'twitter', label: 'Twitter Ads', limit: 'Text: 280 chars' }
];

const adObjectives = [
  { value: 'awareness', label: 'Brand Awareness' },
  { value: 'traffic', label: 'Website Traffic' },
  { value: 'conversions', label: 'Conversions' },
  { value: 'leads', label: 'Lead Generation' },
  { value: 'sales', label: 'Sales' },
  { value: 'engagement', label: 'Engagement' }
];

export default function AdCopyGenerator() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('facebook');
  const [objective, setObjective] = useState('conversions');
  const [targetAudience, setTargetAudience] = useState('');
  const [offer, setOffer] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing information",
        description: "Please describe your product or service.",
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
      const selectedPlatform = adPlatforms.find(p => p.value === platform);
      const enhancedPrompt = `Create compelling ad copy for ${selectedPlatform?.label} about: ${prompt}.
        Campaign objective: ${objective}.
        ${targetAudience ? `Target audience: ${targetAudience}.` : ''}
        ${offer ? `Special offer: ${offer}.` : ''}
        Make it persuasive, include a strong call-to-action, and optimize for ${selectedPlatform?.label}.
        Follow platform guidelines: ${selectedPlatform?.limit}.`;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          template_type: 'ads',
          prompt: enhancedPrompt,
          language: 'en',
          keywords: []
        }
      });

      if (error) throw error;

      const generatedContentText = data.generated_content;
      const wordCount = data.word_count || generatedContentText.split(' ').length;
      
      // Save to database
      const { error: insertError } = await supabase
        .from('content_generations')
        .insert({
          user_id: profile.user_id,
          template_type: 'ads',
          prompt: prompt,
          generated_content: generatedContentText,
          word_count: wordCount,
          language: 'en',
          keywords: []
        });

      if (insertError) throw insertError;

      // Update word usage
      const { error: updateError } = await supabase.rpc('update_word_usage', {
        user_uuid: profile.user_id,
        words_to_add: wordCount
      });

      if (updateError) throw updateError;

      setGeneratedContent(generatedContentText);
      await refreshProfile();
      
      toast({
        title: "Ad copy generated!",
        description: `Generated ${wordCount} words for ${selectedPlatform?.label}.`
      });

    } catch (error: any) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate ad copy.",
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
      description: "Ad copy copied to clipboard."
    });
  };

  const selectedPlatformInfo = adPlatforms.find(p => p.value === platform);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-orange-600" />
          Ad Copy Generator
        </h2>
        <p className="text-muted-foreground">
          Create high-converting advertisements optimized for different platforms
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Ad Campaign Details
              </CardTitle>
              <CardDescription>
                Provide details about your advertising campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product/Service Description</Label>
                <Textarea
                  id="product"
                  placeholder="Describe your product or service..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Ad Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {adPlatforms.map((platformOption) => (
                        <SelectItem key={platformOption.value} value={platformOption.value}>
                          {platformOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedPlatformInfo && (
                    <p className="text-xs text-muted-foreground">
                      {selectedPlatformInfo.limit}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objective">Campaign Objective</Label>
                  <Select value={objective} onValueChange={setObjective}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select objective" />
                    </SelectTrigger>
                    <SelectContent>
                      {adObjectives.map((obj) => (
                        <SelectItem key={obj.value} value={obj.value}>
                          {obj.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Target Audience (optional)
                </Label>
                <Input
                  id="audience"
                  placeholder="e.g., Working professionals aged 25-40..."
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="offer">Special Offer (optional)</Label>
                <Input
                  id="offer"
                  placeholder="e.g., 20% off, Free trial, Limited time..."
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
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
                    Creating Ad Copy...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Ad Copy
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Example Campaigns
              </CardTitle>
              <CardDescription>
                Click on any example to use it as your starting point
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {adExamples.map((example, index) => (
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

        {/* Generated Content */}
        <div>
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Generated Ad Copy</CardTitle>
              {generatedContent && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyToClipboard}
                  className="w-fit"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Ad Copy
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
                  <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Your generated ad copy will appear here
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