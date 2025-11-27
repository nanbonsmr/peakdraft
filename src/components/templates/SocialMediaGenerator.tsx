import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Sparkles, Copy, CreditCard, Lightbulb, Hash } from 'lucide-react';
import { ExportDropdown } from '@/components/ExportDropdown';

const socialExamples = [
  "Promote a new product launch with excitement and call-to-action",
  "Share behind-the-scenes content from our workplace culture",
  "Create an inspirational post about overcoming challenges",
  "Announce a special discount or limited-time offer"
];

const platforms = [
  { value: 'instagram', label: 'Instagram', limit: '2200 characters' },
  { value: 'twitter', label: 'Twitter/X', limit: '280 characters' },
  { value: 'facebook', label: 'Facebook', limit: '63206 characters' },
  { value: 'linkedin', label: 'LinkedIn', limit: '3000 characters' },
  { value: 'tiktok', label: 'TikTok', limit: '4000 characters' }
];

const postTypes = [
  { value: 'promotional', label: 'Promotional' },
  { value: 'educational', label: 'Educational' },
  { value: 'entertaining', label: 'Entertaining' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'behind-scenes', label: 'Behind the Scenes' }
];

export default function SocialMediaGenerator() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [postType, setPostType] = useState('promotional');
  const [hashtags, setHashtags] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing information",
        description: "Please describe what you want to post about.",
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
      const selectedPlatform = platforms.find(p => p.value === platform);
      const enhancedPrompt = `Create a ${postType} social media post for ${selectedPlatform?.label} about: ${prompt}. 
        Make it engaging, include relevant emojis, and optimize for ${selectedPlatform?.label}'s audience.
        ${hashtags ? `Include these hashtags: ${hashtags}` : 'Include relevant hashtags.'}
        Keep within ${selectedPlatform?.limit}.`;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          template_type: 'social',
          prompt: enhancedPrompt,
          language: 'en',
          keywords: hashtags.split(',').map(k => k.trim()).filter(k => k)
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
          template_type: 'social',
          prompt: prompt,
          generated_content: generatedContentText,
          word_count: wordCount,
          language: 'en',
          keywords: hashtags.split(',').map(k => k.trim()).filter(k => k)
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
        title: "Social media post generated!",
        description: `Generated content for ${selectedPlatform?.label} successfully.`
      });

    } catch (error: any) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate social media content.",
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

  const selectedPlatformInfo = platforms.find(p => p.value === platform);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-purple-600" />
          Social Media Generator
        </h2>
        <p className="text-muted-foreground">
          Create engaging social media posts optimized for different platforms
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-3 gap-4 md:gap-6 flex lg:flex-none overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory lg:snap-none">
        {/* Generator Form */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6 min-w-[320px] lg:min-w-0 snap-start flex-shrink-0 lg:flex-shrink">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Post Details
              </CardTitle>
              <CardDescription>
                Configure your social media post settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">What do you want to post about?</Label>
                <Textarea
                  id="topic"
                  placeholder="Describe your post content..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((platformOption) => (
                        <SelectItem key={platformOption.value} value={platformOption.value}>
                          {platformOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedPlatformInfo && (
                    <p className="text-xs text-muted-foreground">
                      Limit: {selectedPlatformInfo.limit}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Post Type</Label>
                  <Select value={postType} onValueChange={setPostType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="hashtags" className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Hashtags (optional)
                </Label>
                <Input
                  id="hashtags"
                  placeholder="Enter hashtags separated by commas..."
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
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
                    Generating Post...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Social Post
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
                Example Ideas
              </CardTitle>
              <CardDescription>
                Click on any example to use it as your starting point
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {socialExamples.map((example, index) => (
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
        <div className="min-w-[320px] lg:min-w-0 snap-start flex-shrink-0 lg:flex-shrink">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Generated Post</CardTitle>
              {generatedContent && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyToClipboard}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <ExportDropdown
                    content={generatedContent}
                    filename={`social-post-${Date.now()}`}
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
                  <div className="text-xs text-muted-foreground">
                    Character count: {generatedContent.length} / {selectedPlatformInfo?.limit}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Your social media post will appear here
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