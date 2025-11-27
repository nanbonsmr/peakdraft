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
import { Mail, Sparkles, Copy, CreditCard, Lightbulb, Send } from 'lucide-react';
import { ExportDropdown } from '@/components/ExportDropdown';

const emailExamples = [
  "Welcome new subscribers to our newsletter with a special offer",
  "Follow up with customers who abandoned their shopping cart",
  "Announce our new product features to existing customers",
  "Send a professional thank you email after a meeting"
];

const emailTypes = [
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'welcome', label: 'Welcome Email' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'thank-you', label: 'Thank You' }
];

const emailTones = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'casual', label: 'Casual' },
  { value: 'urgent', label: 'Urgent' }
];

export default function EmailGenerator() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [emailType, setEmailType] = useState('newsletter');
  const [tone, setTone] = useState('professional');
  const [subject, setSubject] = useState('');
  const [callToAction, setCallToAction] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing information",
        description: "Please describe your email content.",
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
      const enhancedPrompt = `Write a ${tone} ${emailType} email about: ${prompt}.
        ${subject ? `Use this subject line: "${subject}".` : 'Include a compelling subject line.'}
        ${callToAction ? `Include this call-to-action: "${callToAction}".` : 'Include a clear call-to-action.'}
        Make it well-structured with proper greeting, body, and closing. Keep it engaging and professional.`;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          template_type: 'email',
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
          template_type: 'email',
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
        title: "Email generated!",
        description: `Generated ${wordCount} words successfully.`
      });

    } catch (error: any) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate email content.",
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
      description: "Email content copied to clipboard."
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Mail className="w-6 h-6 text-green-600" />
          Email Writer
        </h2>
        <p className="text-muted-foreground">
          Create professional emails, newsletters, and campaigns that convert
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-3 gap-4 md:gap-6 flex lg:flex-none overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory lg:snap-none">
        {/* Generator Form */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6 min-w-[320px] lg:min-w-0 snap-start flex-shrink-0 lg:flex-shrink">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Email Details
              </CardTitle>
              <CardDescription>
                Provide details about the email you want to create
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Email Content Description</Label>
                <Textarea
                  id="content"
                  placeholder="Describe what your email should be about..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Email Type</Label>
                  <Select value={emailType} onValueChange={setEmailType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {emailTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {emailTones.map((toneOption) => (
                        <SelectItem key={toneOption.value} value={toneOption.value}>
                          {toneOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line (optional)</Label>
                <Input
                  id="subject"
                  placeholder="Enter a custom subject line..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cta" className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Call-to-Action (optional)
                </Label>
                <Input
                  id="cta"
                  placeholder="e.g., Shop Now, Learn More, Sign Up..."
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
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
                    Writing Email...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Email
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
                {emailExamples.map((example, index) => (
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
              <CardTitle>Generated Email</CardTitle>
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
                    filename={`email-${Date.now()}`}
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
                  <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Your generated email will appear here
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