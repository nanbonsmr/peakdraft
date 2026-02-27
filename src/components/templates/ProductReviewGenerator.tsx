import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Copy, RefreshCw, Star, Sparkles, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useRecentContent } from '@/hooks/useRecentContent';
import { RecentContent } from './RecentContent';
import { ExportDropdown } from '@/components/ExportDropdown';
import { InfobaseToggle, useInfobaseContext } from '@/components/InfobaseToggle';

const reviewExamples = [
  "Review of the latest iPhone model with focus on camera quality",
  "Honest review of a standing desk after 6 months of use",
  "Review of a popular noise-canceling headphones for remote work",
  "In-depth review of a meal delivery subscription service",
  "Review of a productivity app for project management"
];

const reviewTypes = [
  { value: 'detailed', label: 'Detailed Review' },
  { value: 'quick', label: 'Quick Review' },
  { value: 'comparison', label: 'Comparison Review' },
  { value: 'unboxing', label: 'Unboxing/First Impressions' },
  { value: 'long-term', label: 'Long-term Review' }
];

const ratings = [
  { value: '5', label: '5 Stars - Excellent' },
  { value: '4', label: '4 Stars - Good' },
  { value: '3', label: '3 Stars - Average' },
  { value: '2', label: '2 Stars - Below Average' },
  { value: '1', label: '1 Star - Poor' }
];

const tones = [
  { value: 'objective', label: 'Objective' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
  { value: 'critical', label: 'Critical' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'casual', label: 'Casual' }
];

export function ProductReviewGenerator() {
  const [prompt, setPrompt] = useState('');
  const [productName, setProductName] = useState('');
  const [reviewType, setReviewType] = useState('detailed');
  const [rating, setRating] = useState('4');
  const [tone, setTone] = useState('balanced');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { infobaseEnabled, setInfobaseEnabled, selectedEntry, setSelectedEntry, getBrandContextString } = useInfobaseContext();
  const { recentContent, loadRecentContent, copyContentToClipboard, handleDeleteContent } = useRecentContent('product_review');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please describe the product and your experience",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate content",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    const wordsUsed = profile?.words_used || 0;
    const wordsLimit = profile?.words_limit || 5000;
    
    if (wordsUsed >= wordsLimit) {
      toast({
        title: "Word limit reached",
        description: "You've reached your word limit. Please upgrade your plan.",
        variant: "destructive"
      });
      navigate('/app/pricing');
      return;
    }

    setIsGenerating(true);
    try {
      const selectedType = reviewTypes.find(t => t.value === reviewType)?.label;
      const selectedRating = ratings.find(r => r.value === rating)?.label;
      const selectedTone = tones.find(t => t.value === tone)?.label;
      
      const enhancedPrompt = `Write a product review about: ${prompt}

${productName ? `Product Name: ${productName}` : ''}
Review Type: ${selectedType}
Rating: ${selectedRating}
Tone: ${selectedTone}

Requirements:
- Start with an attention-grabbing headline
- Include a brief product overview
- Cover key features and specifications
- Discuss pros and cons honestly
- Share personal experience/usage scenarios
- Provide a clear verdict/recommendation
- Include who this product is best for
- Keep it authentic and helpful
- Aim for 300-500 words`;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          template_type: 'product_review',
          prompt: enhancedPrompt,
          language: 'english',
          brand_context: getBrandContextString() || undefined
        }
      });

      if (error) throw error;

      setGeneratedContent(data.generated_content);

      await supabase.from('content_generations').insert({
        user_id: user.id,
        template_type: 'product_review',
        prompt: prompt,
        generated_content: data.generated_content,
        word_count: data.word_count
      });

      await supabase.rpc('update_word_usage', {
        user_uuid: user.id,
        words_to_add: data.word_count
      });

      await refreshProfile();
      await loadRecentContent();

      toast({
        title: "Success!",
        description: `Product review generated (${data.word_count} words used)`
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to generate product review. Please try again.",
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
      description: "Product review copied to clipboard"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Product Review Generator
          </CardTitle>
          <CardDescription>
            Create authentic and helpful product reviews that readers trust
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-name">Product Name (optional)</Label>
            <Input
              id="product-name"
              placeholder="E.g., Apple iPhone 15 Pro"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Describe your experience with the product</Label>
            <Textarea
              id="prompt"
              placeholder="E.g., Review of the latest iPhone model with focus on camera quality..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Review Type</Label>
              <Select value={reviewType} onValueChange={setReviewType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reviewTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ratings.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <InfobaseToggle enabled={infobaseEnabled} onToggle={setInfobaseEnabled} selectedEntry={selectedEntry} onSelectEntry={setSelectedEntry} />

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
                Generate Product Review
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Product Review</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Regenerate
                </Button>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => navigate('/app/editor', { 
                    state: { 
                      content: generatedContent, 
                      title: prompt.slice(0, 50),
                      templateType: 'product_review' 
                    } 
                  })}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit & Export
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
              {generatedContent}
            </div>
          </CardContent>
        </Card>
      )}

      <RecentContent 
        recentContent={recentContent}
        templateTitle="Product Reviews"
        templateIcon={Star}
        templateBgColor="bg-yellow-100"
        templateColor="text-yellow-600"
        onCopyContent={copyContentToClipboard}
        onDeleteContent={handleDeleteContent}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Review Ideas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {reviewExamples.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start h-auto py-2 px-3 text-left"
                onClick={() => setPrompt(example)}
              >
                <Sparkles className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm">{example}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
