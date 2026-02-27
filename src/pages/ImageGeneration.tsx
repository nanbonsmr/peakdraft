import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Loader2, Download, ImageIcon, Sparkles, Instagram, Film, Megaphone,
  LayoutTemplate, Palette, Type, ShoppingBag, BarChart3, RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const imageTemplates = [
  {
    id: 'social-media',
    name: 'Social Media Post',
    description: 'Instagram, Facebook, Twitter posts optimized for engagement',
    icon: Instagram,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    examples: [
      'A motivational quote post with sunrise background',
      'Product launch announcement with confetti',
      'Behind-the-scenes team photo for a tech startup',
    ],
  },
  {
    id: 'poster',
    name: 'Poster Design',
    description: 'Event posters, movie posters, promotional posters',
    icon: LayoutTemplate,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    examples: [
      'Music festival poster with neon lights',
      'Conference event poster with speakers',
      'Movie-style poster for a product launch',
    ],
  },
  {
    id: 'advertisement',
    name: 'Advertisement',
    description: 'Digital ads, banners, promotional creatives',
    icon: Megaphone,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    examples: [
      'Black Friday sale banner with bold typography',
      'Fitness app promotion with energetic visuals',
      'Restaurant ad featuring gourmet food photography',
    ],
  },
  {
    id: 'youtube-thumbnail',
    name: 'YouTube Thumbnail',
    description: 'Click-worthy thumbnails that maximize views',
    icon: Film,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    examples: [
      'Tech review thumbnail with dramatic lighting',
      'Cooking tutorial thumbnail with appetizing food',
      'Travel vlog thumbnail with stunning landscape',
    ],
  },
  {
    id: 'logo',
    name: 'Logo Design',
    description: 'Brand logos, icons, and mark designs',
    icon: Palette,
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    examples: [
      'Modern tech startup logo with abstract shapes',
      'Elegant restaurant logo with script typography',
      'Eco-friendly brand logo with leaf motif',
    ],
  },
  {
    id: 'banner',
    name: 'Web Banner',
    description: 'Website headers, social media covers, email banners',
    icon: Type,
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/10',
    examples: [
      'Professional LinkedIn cover with gradient',
      'E-commerce hero banner with products',
      'SaaS landing page hero section visual',
    ],
  },
  {
    id: 'product-mockup',
    name: 'Product Mockup',
    description: 'Realistic product shots and lifestyle mockups',
    icon: ShoppingBag,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    examples: [
      'Smartphone mockup on a marble desk',
      'T-shirt mockup in a lifestyle setting',
      'Coffee mug with custom design in cozy café',
    ],
  },
  {
    id: 'infographic',
    name: 'Infographic',
    description: 'Data visualization, statistics, process flows',
    icon: BarChart3,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    examples: [
      'Business growth statistics infographic',
      'Step-by-step process flow diagram',
      'Market trends comparison chart',
    ],
  },
];

const stylePresets = [
  { value: 'professional', label: 'Professional' },
  { value: 'vibrant', label: 'Vibrant & Bold' },
  { value: 'minimal', label: 'Minimalist' },
  { value: 'artistic', label: 'Artistic' },
  { value: 'dark', label: 'Dark & Moody' },
  { value: 'retro', label: 'Retro / Vintage' },
];

export default function ImageGeneration() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [stylePreset, setStylePreset] = useState('professional');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageDescription, setImageDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const activeTemplate = imageTemplates.find(t => t.id === selectedTemplate);

  const handleGenerate = async () => {
    if (!selectedTemplate || !prompt.trim()) {
      toast({ title: "Missing info", description: "Select a template and describe your image.", variant: "destructive" });
      return;
    }
    if (!profile) {
      toast({ title: "Sign in required", description: "Please sign in to generate images.", variant: "destructive" });
      return;
    }
    if ((profile.words_used || 0) >= (profile.words_limit || 500)) {
      toast({ title: "Limit reached", description: "Upgrade your plan to continue generating.", variant: "destructive" });
      navigate('/app/pricing');
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt, template_type: selectedTemplate, style_preset: stylePreset },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setGeneratedImage(data.image_url);
      setImageDescription(data.description || '');

      // Count as word usage (image = 50 words equivalent)
      await supabase.rpc('update_word_usage', { user_uuid: profile.user_id, words_to_add: 50 });
      await refreshProfile();

      toast({ title: "Image generated!", description: "Your AI image is ready." });
    } catch (err: any) {
      console.error('Image generation error:', err);
      toast({ title: "Generation failed", description: err.message || "Failed to generate image.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `peakdraft-${selectedTemplate}-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <ImageIcon className="h-7 w-7 text-primary" />
          </div>
          AI Image Generation
        </h1>
        <p className="text-muted-foreground mt-1">Create stunning visuals with AI — choose a template and describe your vision</p>
      </div>

      {/* Template Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Choose a Template</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {imageTemplates.map((tpl) => {
            const Icon = tpl.icon;
            const isSelected = selectedTemplate === tpl.id;
            return (
              <Card
                key={tpl.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:border-primary/40'
                }`}
                onClick={() => {
                  setSelectedTemplate(tpl.id);
                  setGeneratedImage(null);
                }}
              >
                <CardContent className="p-4 text-center">
                  <div className={`mx-auto w-12 h-12 rounded-xl ${tpl.bgColor} flex items-center justify-center mb-3`}>
                    <Icon className={`h-6 w-6 ${tpl.color}`} />
                  </div>
                  <h3 className="font-medium text-sm">{tpl.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tpl.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Generation Form */}
      {selectedTemplate && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {activeTemplate && <activeTemplate.icon className={`h-5 w-5 ${activeTemplate.color}`} />}
                {activeTemplate?.name}
              </CardTitle>
              <CardDescription>{activeTemplate?.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Style Preset</Label>
                <Select value={stylePreset} onValueChange={setStylePreset}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stylePresets.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Describe Your Image</Label>
                <Textarea
                  placeholder="Be specific about what you want — colors, composition, mood, elements..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Example Ideas */}
              {activeTemplate?.examples && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Quick ideas:</Label>
                  <div className="flex flex-wrap gap-2">
                    {activeTemplate.examples.map((ex, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent transition-colors text-xs"
                        onClick={() => setPrompt(ex)}
                      >
                        {ex.length > 45 ? ex.slice(0, 45) + '…' : ex}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={handleGenerate} disabled={isGenerating} className="w-full" size="lg">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating image...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Image
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview / Result */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Image</CardTitle>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
                  <p className="font-medium">Creating your image...</p>
                  <p className="text-sm mt-1">This may take 10-30 seconds</p>
                </div>
              ) : generatedImage ? (
                <div className="space-y-4">
                  <div className="rounded-xl overflow-hidden border bg-muted">
                    <img
                      src={generatedImage}
                      alt={prompt}
                      className="w-full h-auto object-contain max-h-[500px]"
                    />
                  </div>
                  {imageDescription && (
                    <p className="text-sm text-muted-foreground">{imageDescription}</p>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={downloadImage} className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <ImageIcon className="h-16 w-16 mb-4 opacity-20" />
                  <p className="font-medium">Your image will appear here</p>
                  <p className="text-sm mt-1">Select a template and describe your vision</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
