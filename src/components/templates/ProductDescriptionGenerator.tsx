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
import { Package, Sparkles, Copy, CreditCard, Lightbulb } from 'lucide-react';

const productExamples = [
  "Write a compelling product description for wireless noise-cancelling headphones with 30-hour battery life",
  "Create a description for an organic skincare serum with vitamin C and hyaluronic acid",
  "Generate product copy for a smart home security camera with AI detection",
  "Describe a premium leather laptop bag for professionals"
];

const toneOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual & Friendly' },
  { value: 'luxury', label: 'Luxury & Premium' },
  { value: 'technical', label: 'Technical & Detailed' },
  { value: 'persuasive', label: 'Persuasive & Sales-Focused' }
];

export default function ProductDescriptionGenerator() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [productName, setProductName] = useState('');
  const [features, setFeatures] = useState('');
  const [tone, setTone] = useState('professional');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing information",
        description: "Please describe your product.",
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
      const enhancedPrompt = `Create a compelling ${tone} product description for ${productName || 'this product'}:\n\n${prompt}\n\n${features ? `Key Features: ${features}\n\n` : ''}Focus on benefits, use sensory language, include a clear call-to-action, and make it SEO-friendly.`;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          template_type: 'product-description',
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
          template_type: 'product-description',
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
        title: "Product description generated!",
        description: `Generated ${wordCount} words successfully.`
      });

    } catch (error: any) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate product description.",
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
          <Package className="w-6 h-6 text-emerald-600" />
          Product Description Generator
        </h2>
        <p className="text-muted-foreground">
          Create compelling, SEO-optimized product descriptions that convert
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Product Details
              </CardTitle>
              <CardDescription>
                Provide information about your product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name (optional)</Label>
                <Input
                  id="productName"
                  placeholder="e.g., Premium Wireless Headphones"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Description Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {toneOptions.map((toneOption) => (
                      <SelectItem key={toneOption.value} value={toneOption.value}>
                        {toneOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product">Product Description</Label>
                <Textarea
                  id="product"
                  placeholder="Describe your product, its purpose, target audience..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Key Features (optional)</Label>
                <Textarea
                  id="features"
                  placeholder="List main features, specifications, benefits..."
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  rows={3}
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
                    Generating Description...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Description
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Example Products
              </CardTitle>
              <CardDescription>
                Click on any example to use it as your starting point
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {productExamples.map((example, index) => (
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

        <div>
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Generated Description</CardTitle>
              {generatedContent && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyToClipboard}
                  className="w-fit"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Content
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
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Your product description will appear here
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