import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Loader2, Download, ImageIcon, Sparkles, Instagram, Film, Megaphone,
  LayoutTemplate, Palette, Type, ShoppingBag, BarChart3, RefreshCw, Trash2,
  Clock, Crown, Lock, Pencil, X, ZoomIn, ChevronLeft, ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAvatars } from '@/hooks/useAvatars';
import { UserCircle2 } from 'lucide-react';

const imageTemplates = [
  { id: 'social-media', name: 'Social Media Post', description: 'Instagram, Facebook, Twitter posts optimized for engagement', icon: Instagram, color: 'text-pink-500', bgColor: 'bg-pink-500/10',
    examples: ['A motivational quote post with sunrise background', 'Product launch announcement with confetti', 'Behind-the-scenes team photo for a tech startup'] },
  { id: 'poster', name: 'Poster Design', description: 'Event posters, movie posters, promotional posters', icon: LayoutTemplate, color: 'text-violet-500', bgColor: 'bg-violet-500/10',
    examples: ['Music festival poster with neon lights', 'Conference event poster with speakers', 'Movie-style poster for a product launch'] },
  { id: 'advertisement', name: 'Advertisement', description: 'Digital ads, banners, promotional creatives', icon: Megaphone, color: 'text-amber-500', bgColor: 'bg-amber-500/10',
    examples: ['Black Friday sale banner with bold typography', 'Fitness app promotion with energetic visuals', 'Restaurant ad featuring gourmet food photography'] },
  { id: 'youtube-thumbnail', name: 'YouTube Thumbnail', description: 'Click-worthy thumbnails that maximize views', icon: Film, color: 'text-red-500', bgColor: 'bg-red-500/10',
    examples: ['Tech review thumbnail with dramatic lighting', 'Cooking tutorial thumbnail with appetizing food', 'Travel vlog thumbnail with stunning landscape'] },
  { id: 'logo', name: 'Logo Design', description: 'Brand logos, icons, and mark designs', icon: Palette, color: 'text-teal-500', bgColor: 'bg-teal-500/10',
    examples: ['Modern tech startup logo with abstract shapes', 'Elegant restaurant logo with script typography', 'Eco-friendly brand logo with leaf motif'] },
  { id: 'banner', name: 'Web Banner', description: 'Website headers, social media covers, email banners', icon: Type, color: 'text-sky-500', bgColor: 'bg-sky-500/10',
    examples: ['Professional LinkedIn cover with gradient', 'E-commerce hero banner with products', 'SaaS landing page hero section visual'] },
  { id: 'product-mockup', name: 'Product Mockup', description: 'Realistic product shots and lifestyle mockups', icon: ShoppingBag, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10',
    examples: ['Smartphone mockup on a marble desk', 'T-shirt mockup in a lifestyle setting', 'Coffee mug with custom design in cozy café'] },
  { id: 'infographic', name: 'Infographic', description: 'Data visualization, statistics, process flows', icon: BarChart3, color: 'text-orange-500', bgColor: 'bg-orange-500/10',
    examples: ['Business growth statistics infographic', 'Step-by-step process flow diagram', 'Market trends comparison chart'] },
];

const stylePresets = [
  { value: 'professional', label: 'Professional' },
  { value: 'vibrant', label: 'Vibrant & Bold' },
  { value: 'minimal', label: 'Minimalist' },
  { value: 'artistic', label: 'Artistic' },
  { value: 'dark', label: 'Dark & Moody' },
  { value: 'retro', label: 'Retro / Vintage' },
];

interface ImageRecord {
  id: string;
  template_type: string;
  prompt: string;
  style_preset: string;
  image_url: string;
  created_at: string;
}

export default function ImageGeneration() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [stylePreset, setStylePreset] = useState('professional');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageDescription, setImageDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [gallery, setGallery] = useState<ImageRecord[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(true);

  // Preview & Edit state
  const [previewImage, setPreviewImage] = useState<ImageRecord | null>(null);
  const [previewIndex, setPreviewIndex] = useState(-1);
  const [isEditing, setIsEditing] = useState(false);
  const [editInstruction, setEditInstruction] = useState('');
  const [isEditProcessing, setIsEditProcessing] = useState(false);

  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { avatars, defaultAvatar } = useAvatars();
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('none');
  useEffect(() => {
    if (defaultAvatar && selectedAvatarId === 'none') setSelectedAvatarId(defaultAvatar.id);
  }, [defaultAvatar, selectedAvatarId]);

  const activeTemplate = imageTemplates.find(t => t.id === selectedTemplate);
  const plan = profile?.subscription_plan?.toLowerCase() || 'free';
  const hasAccess = plan === 'pro' || plan === 'enterprise';

  const loadGallery = useCallback(async () => {
    if (!profile) return;
    try {
      const { data, error } = await supabase
        .from('image_generations')
        .select('*')
        .eq('user_id', profile.user_id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      setGallery((data as ImageRecord[]) || []);
    } catch (err) {
      console.error('Failed to load gallery:', err);
    } finally {
      setIsLoadingGallery(false);
    }
  }, [profile]);

  useEffect(() => { loadGallery(); }, [loadGallery]);

  const base64ToBlob = (base64: string): Blob => {
    const parts = base64.split(',');
    const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
    const raw = atob(parts[1]);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    return new Blob([arr], { type: mime });
  };

  const saveImageToStorage = async (base64Url: string, templateType?: string): Promise<string> => {
    if (!profile) throw new Error('Not authenticated');
    const blob = base64ToBlob(base64Url);
    const fileName = `${profile.user_id}/${Date.now()}-${templateType || 'edited'}.png`;

    const { error: uploadError } = await supabase.storage
      .from('generated-images')
      .upload(fileName, blob, { contentType: 'image/png', upsert: false });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('generated-images').getPublicUrl(fileName);
    return urlData.publicUrl;
  };

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

      const base64Url = data.image_url;
      setGeneratedImage(base64Url);
      setImageDescription(data.description || '');

      const publicUrl = await saveImageToStorage(base64Url, selectedTemplate);

      await supabase.from('image_generations').insert({
        user_id: profile.user_id,
        template_type: selectedTemplate,
        prompt,
        style_preset: stylePreset,
        image_url: publicUrl,
      });

      await supabase.rpc('update_word_usage', { user_uuid: profile.user_id, words_to_add: 50 });
      await refreshProfile();
      await loadGallery();

      toast({ title: "Image generated & saved!", description: "Your AI image is ready and saved to your gallery." });
    } catch (err: any) {
      console.error('Image generation error:', err);
      toast({ title: "Generation failed", description: err.message || "Failed to generate image.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditImage = async () => {
    if (!editInstruction.trim() || !previewImage) return;
    if (!profile) return;

    setIsEditProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          mode: 'edit',
          source_image_url: previewImage.image_url,
          edit_instruction: editInstruction,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const base64Url = data.image_url;

      // Save edited image
      const publicUrl = await saveImageToStorage(base64Url, previewImage.template_type + '-edited');

      await supabase.from('image_generations').insert({
        user_id: profile.user_id,
        template_type: previewImage.template_type,
        prompt: `[Edited] ${editInstruction} — Original: ${previewImage.prompt}`,
        style_preset: previewImage.style_preset,
        image_url: publicUrl,
      });

      await supabase.rpc('update_word_usage', { user_uuid: profile.user_id, words_to_add: 50 });
      await refreshProfile();
      await loadGallery();

      // Update preview to show new image
      setPreviewImage(prev => prev ? { ...prev, image_url: publicUrl, prompt: `[Edited] ${editInstruction}` } : null);
      setEditInstruction('');
      setIsEditing(false);

      toast({ title: "Image edited & saved!", description: "Your edited image has been saved to the gallery." });
    } catch (err: any) {
      console.error('Image edit error:', err);
      toast({ title: "Edit failed", description: err.message || "Failed to edit image.", variant: "destructive" });
    } finally {
      setIsEditProcessing(false);
    }
  };

  const handleDeleteImage = async (image: ImageRecord) => {
    try {
      const url = new URL(image.image_url);
      const pathParts = url.pathname.split('/generated-images/');
      if (pathParts[1]) {
        await supabase.storage.from('generated-images').remove([decodeURIComponent(pathParts[1])]);
      }
      await supabase.from('image_generations').delete().eq('id', image.id);
      setGallery(prev => prev.filter(g => g.id !== image.id));
      if (previewImage?.id === image.id) setPreviewImage(null);
      toast({ title: "Deleted", description: "Image removed from gallery." });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  const downloadImage = (url?: string) => {
    const src = url || generatedImage;
    if (!src) return;
    const link = document.createElement('a');
    link.href = src;
    link.download = `peakdraft-${selectedTemplate || 'image'}-${Date.now()}.png`;
    link.target = '_blank';
    link.click();
  };

  const openPreview = (img: ImageRecord, index: number) => {
    setPreviewImage(img);
    setPreviewIndex(index);
    setIsEditing(false);
    setEditInstruction('');
  };

  const navigatePreview = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? previewIndex - 1 : previewIndex + 1;
    if (newIndex >= 0 && newIndex < gallery.length) {
      setPreviewImage(gallery[newIndex]);
      setPreviewIndex(newIndex);
      setIsEditing(false);
      setEditInstruction('');
    }
  };

  const templateLabel = (type: string) => imageTemplates.find(t => t.id === type)?.name || type;

  if (!hasAccess) {
    return (
      <div className="max-w-2xl mx-auto py-8 sm:py-16 px-4 text-center space-y-6">
        <div className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
          <Lock className="h-10 w-10 text-primary" />
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">AI Image Generation</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-lg">
            This feature is available on <span className="font-semibold text-primary">Pro</span> and <span className="font-semibold text-primary">Enterprise</span> plans.
          </p>
        </div>
        <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Crown className="h-5 w-5" />
              <span className="font-semibold">Unlock AI Image Generation</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2.5 text-left max-w-md mx-auto">
              <li className="flex items-center gap-2.5"><Sparkles className="h-4 w-4 text-primary shrink-0" /> 8 professional image templates</li>
              <li className="flex items-center gap-2.5"><Sparkles className="h-4 w-4 text-primary shrink-0" /> 6 style presets (Professional, Vibrant, Artistic...)</li>
              <li className="flex items-center gap-2.5"><Sparkles className="h-4 w-4 text-primary shrink-0" /> Unlimited image gallery with cloud storage</li>
              <li className="flex items-center gap-2.5"><Sparkles className="h-4 w-4 text-primary shrink-0" /> AI-powered image editing</li>
              <li className="flex items-center gap-2.5"><Sparkles className="h-4 w-4 text-primary shrink-0" /> Download in high resolution</li>
            </ul>
            <Button size="lg" onClick={() => navigate('/app/pricing')} className="w-full max-w-xs mx-auto">
              <Crown className="mr-2 h-4 w-4" />
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
    <Helmet>
      <title>AI Image Generator - Create Stunning Images from Text | PeakDraft</title>
      <meta name="description" content="Generate stunning AI images from text prompts. Create social media posts, posters, ads, YouTube thumbnails, logos, and product mockups with PeakDraft's AI image generator." />
      <meta name="keywords" content="AI image generator, text to image, AI art, social media images, poster design, YouTube thumbnail maker, logo generator, AI graphics, PeakDraft" />
      <link rel="canonical" href="https://peakdraft.vercel.app/app/image-generation" />
      <meta property="og:title" content="AI Image Generator | PeakDraft" />
      <meta property="og:description" content="Create stunning images from text prompts. Social media, posters, ads, thumbnails & more." />
      <meta property="og:url" content="https://peakdraft.vercel.app/app/image-generation" />
      <meta property="og:type" content="website" />
    </Helmet>
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-3xl font-bold flex items-center gap-3 flex-wrap">
          <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl border border-primary/20">
            <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          AI Image Generation
          <Badge variant="secondary" className="bg-violet-500/15 text-violet-400 border-violet-500/20 text-xs backdrop-blur-sm">Pro</Badge>
        </h1>
        <p className="text-muted-foreground/80 mt-1.5 text-xs sm:text-base">Create stunning visuals with AI — choose a template and describe your vision</p>
      </div>

      {/* Template Grid */}
      <div>
        <h2 className="text-base sm:text-lg font-semibold mb-3">Choose a Template</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {imageTemplates.map((tpl) => {
            const Icon = tpl.icon;
            const isSelected = selectedTemplate === tpl.id;
            return (
              <Card
                key={tpl.id}
                className={`group cursor-pointer transition-all duration-300 border backdrop-blur-sm ${
                  isSelected
                    ? 'ring-2 ring-primary shadow-lg border-primary/30 bg-primary/5'
                    : 'border-border/30 hover:border-primary/30 hover:shadow-md bg-background/60'
                }`}
                onClick={() => { setSelectedTemplate(tpl.id); setGeneratedImage(null); }}
              >
                <CardContent className="p-4 sm:p-5 text-center">
                  <div className={`mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${tpl.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${tpl.color}`} />
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm">{tpl.name}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground/70 mt-1 line-clamp-2 hidden xs:block">{tpl.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Generation Form */}
      {selectedTemplate && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="border-border/30 bg-background/60 backdrop-blur-sm">
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
                  <SelectTrigger><SelectValue /></SelectTrigger>
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

              {activeTemplate?.examples && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Quick ideas:</Label>
                  <div className="flex flex-wrap gap-2">
                    {activeTemplate.examples.map((ex, i) => (
                      <Badge key={i} variant="outline" className="cursor-pointer hover:bg-accent transition-colors text-xs" onClick={() => setPrompt(ex)}>
                        {ex.length > 45 ? ex.slice(0, 45) + '…' : ex}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={handleGenerate} disabled={isGenerating} className="w-full" size="lg">
                {isGenerating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating image...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" />Generate Image</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview / Result */}
          <Card className="border-border/30 bg-background/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Generated Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                    <Loader2 className="relative h-12 w-12 animate-spin text-primary" />
                  </div>
                  <p className="font-medium mt-6">Creating your image...</p>
                  <p className="text-sm mt-1 text-muted-foreground/60">This may take 10-30 seconds</p>
                </div>
              ) : generatedImage ? (
                <div className="space-y-4">
                  <div className="rounded-xl overflow-hidden border border-border/30 bg-muted/50">
                    <img src={generatedImage} alt={prompt} className="w-full h-auto object-contain max-h-[500px]" />
                  </div>
                  {imageDescription && <p className="text-sm text-muted-foreground/80">{imageDescription}</p>}
                  <div className="flex gap-2">
                    <Button onClick={() => downloadImage()} className="flex-1">
                      <Download className="mr-2 h-4 w-4" />Download
                    </Button>
                    <Button variant="outline" onClick={handleGenerate} disabled={isGenerating} className="border-border/40">
                      <RefreshCw className="mr-2 h-4 w-4" />Regenerate
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <div className="p-4 rounded-2xl bg-muted/30 mb-4">
                    <ImageIcon className="h-12 w-12 opacity-20" />
                  </div>
                  <p className="font-medium">Your image will appear here</p>
                  <p className="text-sm mt-1 text-muted-foreground/60">Select a template and describe your vision</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gallery Section */}
      <Card className="border-border/30 bg-background/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            Your Image Gallery
            {gallery.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-muted/50">{gallery.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>Click any image to preview, edit, or download</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingGallery ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : gallery.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="p-4 rounded-2xl bg-muted/30 mx-auto w-fit mb-3">
                <ImageIcon className="h-12 w-12 opacity-20" />
              </div>
              <p className="font-medium">No images yet</p>
              <p className="text-sm mt-1 text-muted-foreground/60">Generate your first image above to see it here</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {gallery.map((img, index) => (
                <div
                  key={img.id}
                  className="group relative rounded-xl border border-border/30 overflow-hidden bg-background/40 backdrop-blur-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer"
                  onClick={() => openPreview(img, index)}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={img.image_url}
                      alt={img.prompt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3 space-y-1.5">
                    <Badge variant="outline" className="text-[10px] border-border/40">{templateLabel(img.template_type)}</Badge>
                    <p className="text-xs text-muted-foreground/80 line-clamp-2">{img.prompt}</p>
                    <p className="text-[10px] text-muted-foreground/50">
                      {format(new Date(img.created_at), 'MMM d, yyyy · h:mm a')}
                    </p>
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-background/70 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2.5">
                    <Button size="icon" variant="secondary" className="h-10 w-10 rounded-xl bg-background/80 backdrop-blur-sm border border-border/30" onClick={(e) => { e.stopPropagation(); openPreview(img, index); }}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary" className="h-10 w-10 rounded-xl bg-background/80 backdrop-blur-sm border border-border/30" onClick={(e) => { e.stopPropagation(); openPreview(img, index); setIsEditing(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary" className="h-10 w-10 rounded-xl bg-background/80 backdrop-blur-sm border border-border/30" onClick={(e) => { e.stopPropagation(); downloadImage(img.image_url); }}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive" className="h-10 w-10 rounded-xl" onClick={(e) => { e.stopPropagation(); handleDeleteImage(img); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview & Edit Modal */}
      <Dialog open={!!previewImage} onOpenChange={(open) => { if (!open) { setPreviewImage(null); setIsEditing(false); setEditInstruction(''); } }}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 overflow-hidden">
          <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
            {/* Image Preview */}
            <div className="relative flex-1 bg-muted flex items-center justify-center min-h-[200px] sm:min-h-[300px]">
              {previewImage && (
                <img
                  src={previewImage.image_url}
                  alt={previewImage.prompt}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              )}

              {/* Navigation arrows */}
              {previewIndex > 0 && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full backdrop-blur-sm bg-background/70"
                  onClick={() => navigatePreview('prev')}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              {previewIndex < gallery.length - 1 && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full backdrop-blur-sm bg-background/70"
                  onClick={() => navigatePreview('next')}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Sidebar Info & Edit */}
            <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l flex flex-col">
              <DialogHeader className="p-4 pb-2">
                <DialogTitle className="text-base">Image Details</DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-4">
                {previewImage && (
                  <>
                    <div>
                      <Badge variant="outline" className="text-xs mb-2">{templateLabel(previewImage.template_type)}</Badge>
                      <p className="text-sm text-muted-foreground">{previewImage.prompt}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {format(new Date(previewImage.created_at), 'MMM d, yyyy · h:mm a')}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => downloadImage(previewImage.image_url)} className="flex-1">
                        <Download className="mr-1.5 h-3.5 w-3.5" />Download
                      </Button>
                      <Button size="sm" variant={isEditing ? 'secondary' : 'outline'} onClick={() => setIsEditing(!isEditing)}>
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />{isEditing ? 'Cancel' : 'Edit'}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => { handleDeleteImage(previewImage); setPreviewImage(null); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Edit Panel */}
                    {isEditing && (
                      <Card className="border-primary/20 bg-primary/5">
                        <CardContent className="p-3 space-y-3">
                          <div className="flex items-center gap-2 text-primary">
                            <Pencil className="h-4 w-4" />
                            <span className="font-medium text-sm">AI Image Editor</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Describe what changes you want — add elements, change colors, remove objects, adjust style, etc.
                          </p>
                          <Textarea
                            placeholder="e.g., Make the background darker, add a golden sun flare, remove the text..."
                            value={editInstruction}
                            onChange={(e) => setEditInstruction(e.target.value)}
                            rows={3}
                            className="resize-none text-sm"
                          />
                          <div className="flex flex-wrap gap-1.5">
                            {['Change background color', 'Add text overlay', 'Make it brighter', 'Add blur effect', 'Remove background'].map((suggestion) => (
                              <Badge
                                key={suggestion}
                                variant="outline"
                                className="cursor-pointer hover:bg-accent transition-colors text-[10px]"
                                onClick={() => setEditInstruction(suggestion)}
                              >
                                {suggestion}
                              </Badge>
                            ))}
                          </div>
                          <Button
                            size="sm"
                            onClick={handleEditImage}
                            disabled={isEditProcessing || !editInstruction.trim()}
                            className="w-full"
                          >
                            {isEditProcessing ? (
                              <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Editing...</>
                            ) : (
                              <><Sparkles className="mr-2 h-3.5 w-3.5" />Apply Edit</>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
