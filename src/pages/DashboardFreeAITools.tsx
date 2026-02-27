import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Copy, Bot, Hash, Sparkles, Lightbulb, FileText, MessageSquare, Mail, ChevronDown, ShoppingBag, Search, MousePointerClick, Type, Megaphone, Star, Film, User, HelpCircle, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFreeToolUsage } from '@/hooks/useFreeToolUsage';
import { motion, AnimatePresence } from 'framer-motion';

// Context to share usage cap across all generators
const FreeToolCapContext = createContext<{
  checkAndRecord: (toolId: string) => Promise<boolean>;
  hasReachedLimit: boolean;
}>({ checkAndRecord: async () => true, hasReachedLimit: false });

const tools = [
  { id: 'chatgpt', title: 'ChatGPT Prompt Generator', description: 'Create effective prompts for ChatGPT and AI assistants', icon: Bot, color: 'text-primary', bgColor: 'bg-primary/10' },
  { id: 'hashtag', title: 'Hashtag Generator', description: 'Generate trending hashtags for social media posts', icon: Hash, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
  { id: 'blogintro', title: 'Blog Intro Generator', description: 'Create engaging blog introductions that hook readers', icon: FileText, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { id: 'caption', title: 'Social Media Caption Generator', description: 'Create engaging captions for your social media posts', icon: MessageSquare, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  { id: 'email', title: 'Email Subject Line Generator', description: 'Write compelling email subject lines that get opened', icon: Mail, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  { id: 'product', title: 'Product Description Generator', description: 'Create persuasive product descriptions that sell', icon: ShoppingBag, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  { id: 'seo', title: 'SEO Meta Description Generator', description: 'Write optimized meta descriptions for better search rankings', icon: Search, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
  { id: 'cta', title: 'Call-to-Action Generator', description: 'Create compelling CTAs that drive conversions', icon: MousePointerClick, color: 'text-rose-500', bgColor: 'bg-rose-500/10' },
  { id: 'headline', title: 'Headline Generator', description: 'Create attention-grabbing headlines that convert', icon: Type, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  { id: 'slogan', title: 'Slogan Generator', description: 'Generate memorable slogans and taglines for your brand', icon: Megaphone, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
  { id: 'testimonial', title: 'Testimonial Generator', description: 'Create authentic customer review templates', icon: Star, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  { id: 'postideas', title: 'Post Ideas Generator', description: 'Generate creative content ideas for your social media', icon: Lightbulb, color: 'text-lime-500', bgColor: 'bg-lime-500/10' },
  { id: 'videoprompt', title: 'Video Prompt Generator', description: 'Create detailed prompts for AI video generation', icon: Film, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  { id: 'bio', title: 'Bio Generator', description: 'Write professional bios for social media profiles', icon: User, color: 'text-teal-500', bgColor: 'bg-teal-500/10' },
  { id: 'faq', title: 'FAQ Generator', description: 'Generate frequently asked questions for your business', icon: HelpCircle, color: 'text-sky-500', bgColor: 'bg-sky-500/10' },
];

export default function DashboardFreeAITools() {
  const [searchParams] = useSearchParams();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const { usageCount, remaining, hasReachedLimit, dailyLimit, recordUsage } = useFreeToolUsage();

  useEffect(() => {
    const toolParam = searchParams.get('tool');
    if (toolParam && tools.find(t => t.id === toolParam)) {
      setActiveTool(toolParam);
    }
  }, [searchParams]);

  const checkAndRecord = useCallback(async (toolId: string): Promise<boolean> => {
    return await recordUsage(toolId);
  }, [recordUsage]);

  const usagePercent = Math.min(100, (usageCount / dailyLimit) * 100);

  return (
    <FreeToolCapContext.Provider value={{ checkAndRecord, hasReachedLimit }}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold">Free AI Tools</h1>
            <Badge variant="secondary">Free</Badge>
          </div>
          <p className="text-muted-foreground">
            15 AI-powered content generators included with your account
          </p>
        </div>

        {/* Daily Usage Banner */}
        <Card className={hasReachedLimit ? 'border-destructive/50 bg-destructive/5' : ''}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Zap className="h-4 w-4 text-amber-500" />
                Daily Free Generations
              </div>
              <span className="text-sm text-muted-foreground">
                {usageCount} / {dailyLimit} used
              </span>
            </div>
            <Progress value={usagePercent} className="h-2" />
            {hasReachedLimit ? (
              <p className="text-xs text-destructive mt-2">
                You've reached your daily limit. Come back tomorrow or upgrade for unlimited access!
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-2">
                {remaining} generation{remaining !== 1 ? 's' : ''} remaining today
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tools Grid */}
        <div className="grid gap-4">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className={`transition-all duration-300 overflow-hidden ${isActive ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}`}>
                  <CardHeader 
                    className="cursor-pointer select-none"
                    onClick={() => setActiveTool(isActive ? null : tool.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`p-2.5 sm:p-3 rounded-xl ${tool.bgColor}`}>
                          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${tool.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-xl">{tool.title}</CardTitle>
                          <CardDescription className="mt-0.5 sm:mt-1 text-xs sm:text-sm">{tool.description}</CardDescription>
                        </div>
                      </div>
                      <motion.div animate={{ rotate: isActive ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        <Button variant="ghost" size="icon" className="pointer-events-none">
                          <ChevronDown className="w-5 h-5" />
                        </Button>
                      </motion.div>
                    </div>
                  </CardHeader>
                  
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardContent className="pt-0 border-t">
                          <div className="pt-6">
                            {tool.id === 'chatgpt' && <ChatGPTPromptGenerator />}
                            {tool.id === 'hashtag' && <HashtagGenerator />}
                            {tool.id === 'blogintro' && <BlogIntroGenerator />}
                            {tool.id === 'caption' && <CaptionGenerator />}
                            {tool.id === 'email' && <EmailSubjectGenerator />}
                            {tool.id === 'product' && <ProductDescriptionGenerator />}
                            {tool.id === 'seo' && <SeoMetaGenerator />}
                            {tool.id === 'cta' && <CTAGenerator />}
                            {tool.id === 'headline' && <HeadlineGenerator />}
                            {tool.id === 'slogan' && <SloganGenerator />}
                            {tool.id === 'testimonial' && <TestimonialGenerator />}
                            {tool.id === 'postideas' && <PostIdeasGenerator />}
                            {tool.id === 'videoprompt' && <VideoPromptGenerator />}
                            {tool.id === 'bio' && <BioGenerator />}
                            {tool.id === 'faq' && <FAQGenerator />}
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </FreeToolCapContext.Provider>
  );
}

// Helper hook for generators to use the cap
function useCapCheck() {
  return useContext(FreeToolCapContext);
}

// Generator Components
function ChatGPTPromptGenerator() {
  const [prompt, setPrompt] = useState('');
  const [purpose, setPurpose] = useState('');
  const [context, setContext] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { checkAndRecord, hasReachedLimit } = useCapCheck();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Error", description: "Please describe what kind of ChatGPT prompt you need", variant: "destructive" });
      return;
    }
    const allowed = await checkAndRecord('chatgpt');
    if (!allowed) return;
    setIsGenerating(true);
    try {
      const enhancedPrompt = `Generate an effective and detailed ChatGPT prompt for: ${prompt}. Purpose: ${purpose || 'general use'}. Context: ${context || 'none'}. Include clear instructions, role definition, constraints, and desired output format.`;
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { prompt: enhancedPrompt, template_type: 'chatgpt-prompt', language: 'en' }
      });
      if (error) throw error;
      setGeneratedContent(data.generated_content);
      toast({ title: "Success!", description: "ChatGPT prompt generated successfully" });
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message || "Failed to generate prompt", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({ title: "Copied!", description: "Prompt copied to clipboard" });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Purpose/Use Case</Label>
          <Input placeholder="e.g., Content creation, Code review, Tutoring" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Additional Context</Label>
          <Input placeholder="e.g., Target audience, specific requirements" value={context} onChange={(e) => setContext(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>What kind of prompt do you need? *</Label>
          <Textarea placeholder="Describe the AI assistant you want to create..." value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} />
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating || hasReachedLimit} className="w-full">
          {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate Prompt</>}
        </Button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Generated Prompt</Label>
          {generatedContent && <Button variant="ghost" size="sm" onClick={copyToClipboard}><Copy className="h-4 w-4 mr-1" /> Copy</Button>}
        </div>
        <div className="min-h-[200px] p-4 rounded-lg border bg-muted/50">
          {generatedContent ? <p className="whitespace-pre-wrap text-sm">{generatedContent}</p> : <p className="text-muted-foreground text-sm">Your generated prompt will appear here...</p>}
        </div>
      </div>
    </div>
  );
}

function HashtagGenerator() {
  const [topic, setTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { checkAndRecord, hasReachedLimit } = useCapCheck();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: "Error", description: "Please enter a topic", variant: "destructive" });
      return;
    }
    const allowed = await checkAndRecord('hashtag');
    if (!allowed) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { prompt: `Generate 20-30 relevant and trending hashtags for: ${topic}. Include a mix of popular, niche, and specific hashtags.`, template_type: 'hashtag', language: 'en' }
      });
      if (error) throw error;
      setGeneratedContent(data.generated_content);
      toast({ title: "Success!", description: "Hashtags generated successfully" });
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({ title: "Copied!", description: "Hashtags copied to clipboard" });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Topic or Post Description *</Label>
          <Textarea placeholder="Describe your post or enter keywords..." value={topic} onChange={(e) => setTopic(e.target.value)} rows={4} />
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating || hasReachedLimit} className="w-full">
          {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Hash className="mr-2 h-4 w-4" /> Generate Hashtags</>}
        </Button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Generated Hashtags</Label>
          {generatedContent && <Button variant="ghost" size="sm" onClick={copyToClipboard}><Copy className="h-4 w-4 mr-1" /> Copy</Button>}
        </div>
        <div className="min-h-[200px] p-4 rounded-lg border bg-muted/50">
          {generatedContent ? <p className="whitespace-pre-wrap text-sm">{generatedContent}</p> : <p className="text-muted-foreground text-sm">Your generated hashtags will appear here...</p>}
        </div>
      </div>
    </div>
  );
}

function BlogIntroGenerator() {
  const [topic, setTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { checkAndRecord, hasReachedLimit } = useCapCheck();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: "Error", description: "Please enter a blog topic", variant: "destructive" });
      return;
    }
    const allowed = await checkAndRecord('blogintro');
    if (!allowed) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { prompt: `Write an engaging blog introduction for: ${topic}. Hook the reader with a compelling opening, establish relevance, and preview what they'll learn.`, template_type: 'blog-intro', language: 'en' }
      });
      if (error) throw error;
      setGeneratedContent(data.generated_content);
      toast({ title: "Success!", description: "Blog intro generated successfully" });
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({ title: "Copied!", description: "Blog intro copied to clipboard" });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Blog Topic *</Label>
          <Textarea placeholder="Enter your blog post topic or title..." value={topic} onChange={(e) => setTopic(e.target.value)} rows={4} />
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating || hasReachedLimit} className="w-full">
          {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><FileText className="mr-2 h-4 w-4" /> Generate Intro</>}
        </Button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Generated Introduction</Label>
          {generatedContent && <Button variant="ghost" size="sm" onClick={copyToClipboard}><Copy className="h-4 w-4 mr-1" /> Copy</Button>}
        </div>
        <div className="min-h-[200px] p-4 rounded-lg border bg-muted/50">
          {generatedContent ? <p className="whitespace-pre-wrap text-sm">{generatedContent}</p> : <p className="text-muted-foreground text-sm">Your generated intro will appear here...</p>}
        </div>
      </div>
    </div>
  );
}

function CaptionGenerator() {
  const [topic, setTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { checkAndRecord, hasReachedLimit } = useCapCheck();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: "Error", description: "Please describe your post", variant: "destructive" });
      return;
    }
    const allowed = await checkAndRecord('caption');
    if (!allowed) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { prompt: `Create 3 engaging social media captions for: ${topic}. Include emojis, call-to-actions, and make them shareable.`, template_type: 'caption', language: 'en' }
      });
      if (error) throw error;
      setGeneratedContent(data.generated_content);
      toast({ title: "Success!", description: "Captions generated successfully" });
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({ title: "Copied!", description: "Captions copied to clipboard" });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Post Description *</Label>
          <Textarea placeholder="Describe your post content..." value={topic} onChange={(e) => setTopic(e.target.value)} rows={4} />
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating || hasReachedLimit} className="w-full">
          {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><MessageSquare className="mr-2 h-4 w-4" /> Generate Captions</>}
        </Button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Generated Captions</Label>
          {generatedContent && <Button variant="ghost" size="sm" onClick={copyToClipboard}><Copy className="h-4 w-4 mr-1" /> Copy</Button>}
        </div>
        <div className="min-h-[200px] p-4 rounded-lg border bg-muted/50">
          {generatedContent ? <p className="whitespace-pre-wrap text-sm">{generatedContent}</p> : <p className="text-muted-foreground text-sm">Your generated captions will appear here...</p>}
        </div>
      </div>
    </div>
  );
}

function EmailSubjectGenerator() {
  const [topic, setTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { checkAndRecord, hasReachedLimit } = useCapCheck();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: "Error", description: "Please describe your email", variant: "destructive" });
      return;
    }
    const allowed = await checkAndRecord('email');
    if (!allowed) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { prompt: `Generate 10 compelling email subject lines for: ${topic}. Make them attention-grabbing, create urgency, and improve open rates.`, template_type: 'email-subject', language: 'en' }
      });
      if (error) throw error;
      setGeneratedContent(data.generated_content);
      toast({ title: "Success!", description: "Subject lines generated successfully" });
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({ title: "Copied!", description: "Subject lines copied to clipboard" });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Email Description *</Label>
          <Textarea placeholder="Describe the email purpose and content..." value={topic} onChange={(e) => setTopic(e.target.value)} rows={4} />
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating || hasReachedLimit} className="w-full">
          {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Mail className="mr-2 h-4 w-4" /> Generate Subject Lines</>}
        </Button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Generated Subject Lines</Label>
          {generatedContent && <Button variant="ghost" size="sm" onClick={copyToClipboard}><Copy className="h-4 w-4 mr-1" /> Copy</Button>}
        </div>
        <div className="min-h-[200px] p-4 rounded-lg border bg-muted/50">
          {generatedContent ? <p className="whitespace-pre-wrap text-sm">{generatedContent}</p> : <p className="text-muted-foreground text-sm">Your generated subject lines will appear here...</p>}
        </div>
      </div>
    </div>
  );
}

function ProductDescriptionGenerator() {
  const [product, setProduct] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { checkAndRecord, hasReachedLimit } = useCapCheck();

  const handleGenerate = async () => {
    if (!product.trim()) {
      toast({ title: "Error", description: "Please describe your product", variant: "destructive" });
      return;
    }
    const allowed = await checkAndRecord('product');
    if (!allowed) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { prompt: `Write a compelling product description for: ${product}. Highlight benefits, features, and create desire. Make it persuasive and SEO-friendly.`, template_type: 'product-description', language: 'en' }
      });
      if (error) throw error;
      setGeneratedContent(data.generated_content);
      toast({ title: "Success!", description: "Product description generated successfully" });
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({ title: "Copied!", description: "Description copied to clipboard" });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Product Details *</Label>
          <Textarea placeholder="Describe your product, features, target audience..." value={product} onChange={(e) => setProduct(e.target.value)} rows={4} />
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating || hasReachedLimit} className="w-full">
          {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><ShoppingBag className="mr-2 h-4 w-4" /> Generate Description</>}
        </Button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Generated Description</Label>
          {generatedContent && <Button variant="ghost" size="sm" onClick={copyToClipboard}><Copy className="h-4 w-4 mr-1" /> Copy</Button>}
        </div>
        <div className="min-h-[200px] p-4 rounded-lg border bg-muted/50">
          {generatedContent ? <p className="whitespace-pre-wrap text-sm">{generatedContent}</p> : <p className="text-muted-foreground text-sm">Your generated description will appear here...</p>}
        </div>
      </div>
    </div>
  );
}

function SeoMetaGenerator() {
  const [page, setPage] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { checkAndRecord, hasReachedLimit } = useCapCheck();

  const handleGenerate = async () => {
    if (!page.trim()) {
      toast({ title: "Error", description: "Please describe your page", variant: "destructive" });
      return;
    }
    const allowed = await checkAndRecord('seo');
    if (!allowed) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { prompt: `Generate SEO-optimized meta description (155-160 characters) for: ${page}. Include relevant keywords and a compelling call-to-action.`, template_type: 'seo-meta', language: 'en' }
      });
      if (error) throw error;
      setGeneratedContent(data.generated_content);
      toast({ title: "Success!", description: "Meta description generated successfully" });
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({ title: "Copied!", description: "Meta description copied to clipboard" });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Page Content *</Label>
          <Textarea placeholder="Describe your page content and target keywords..." value={page} onChange={(e) => setPage(e.target.value)} rows={4} />
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating || hasReachedLimit} className="w-full">
          {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Search className="mr-2 h-4 w-4" /> Generate Meta Description</>}
        </Button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Generated Meta Description</Label>
          {generatedContent && <Button variant="ghost" size="sm" onClick={copyToClipboard}><Copy className="h-4 w-4 mr-1" /> Copy</Button>}
        </div>
        <div className="min-h-[200px] p-4 rounded-lg border bg-muted/50">
          {generatedContent ? <p className="whitespace-pre-wrap text-sm">{generatedContent}</p> : <p className="text-muted-foreground text-sm">Your generated meta description will appear here...</p>}
        </div>
      </div>
    </div>
  );
}

function CTAGenerator() {
  const [goal, setGoal] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { checkAndRecord, hasReachedLimit } = useCapCheck();

  const handleGenerate = async () => {
    if (!goal.trim()) {
      toast({ title: "Error", description: "Please describe your goal", variant: "destructive" });
      return;
    }
    const allowed = await checkAndRecord('cta');
    if (!allowed) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { prompt: `Generate 10 compelling call-to-action phrases for: ${goal}. Make them action-oriented, create urgency, and drive conversions.`, template_type: 'cta', language: 'en' }
      });
      if (error) throw error;
      setGeneratedContent(data.generated_content);
      toast({ title: "Success!", description: "CTAs generated successfully" });
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({ title: "Copied!", description: "CTAs copied to clipboard" });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Goal/Action *</Label>
          <Textarea placeholder="What action do you want users to take?" value={goal} onChange={(e) => setGoal(e.target.value)} rows={4} />
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating || hasReachedLimit} className="w-full">
          {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><MousePointerClick className="mr-2 h-4 w-4" /> Generate CTAs</>}
        </Button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Generated CTAs</Label>
          {generatedContent && <Button variant="ghost" size="sm" onClick={copyToClipboard}><Copy className="h-4 w-4 mr-1" /> Copy</Button>}
        </div>
        <div className="min-h-[200px] p-4 rounded-lg border bg-muted/50">
          {generatedContent ? <p className="whitespace-pre-wrap text-sm">{generatedContent}</p> : <p className="text-muted-foreground text-sm">Your generated CTAs will appear here...</p>}
        </div>
      </div>
    </div>
  );
}

function HeadlineGenerator() {
  const [topic, setTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { checkAndRecord, hasReachedLimit } = useCapCheck();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: "Error", description: "Please enter a topic", variant: "destructive" });
      return;
    }
    const allowed = await checkAndRecord('headline');
    if (!allowed) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { prompt: `Generate 10 attention-grabbing headlines for: ${topic}. Use power words, numbers, and emotional triggers to maximize click-through rates.`, template_type: 'headline', language: 'en' }
      });
      if (error) throw error;
      setGeneratedContent(data.generated_content);
      toast({ title: "Success!", description: "Headlines generated successfully" });
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({ title: "Copied!", description: "Headlines copied to clipboard" });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Topic *</Label>
          <Textarea placeholder="Enter your topic or content theme..." value={topic} onChange={(e) => setTopic(e.target.value)} rows={4} />
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating || hasReachedLimit} className="w-full">
          {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Type className="mr-2 h-4 w-4" /> Generate Headlines</>}
        </Button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Generated Headlines</Label>
          {generatedContent && <Button variant="ghost" size="sm" onClick={copyToClipboard}><Copy className="h-4 w-4 mr-1" /> Copy</Button>}
        </div>
        <div className="min-h-[200px] p-4 rounded-lg border bg-muted/50">
          {generatedContent ? <p className="whitespace-pre-wrap text-sm">{generatedContent}</p> : <p className="text-muted-foreground text-sm">Your generated headlines will appear here...</p>}
        </div>
      </div>
    </div>
  );
}

function SloganGenerator() {
  const [brand, setBrand] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { checkAndRecord, hasReachedLimit } = useCapCheck();

  const handleGenerate = async () => {
    if (!brand.trim()) {
      toast({ title: "Error", description: "Please describe your brand", variant: "destructive" });
      return;
    }
    const allowed = await checkAndRecord('slogan');
    if (!allowed) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { prompt: `Generate 10 memorable slogans and taglines for: ${brand}. Make them catchy, memorable, and aligned with brand values.`, template_type: 'slogan', language: 'en' }
      });
      if (error) throw error;
      setGeneratedContent(data.generated_content);
      toast({ title: "Success!", description: "Slogans generated successfully" });
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({ title: "Copied!", description: "Slogans copied to clipboard" });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Brand/Business Description *</Label>
          <Textarea placeholder="Describe your brand, values, and target audience..." value={brand} onChange={(e) => setBrand(e.target.value)} rows={4} />
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating || hasReachedLimit} className="w-full">
          {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Megaphone className="mr-2 h-4 w-4" /> Generate Slogans</>}
        </Button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Generated Slogans</Label>
          {generatedContent && <Button variant="ghost" size="sm" onClick={copyToClipboard}><Copy className="h-4 w-4 mr-1" /> Copy</Button>}
        </div>
        <div className="min-h-[200px] p-4 rounded-lg border bg-muted/50">
          {generatedContent ? <p className="whitespace-pre-wrap text-sm">{generatedContent}</p> : <p className="text-muted-foreground text-sm">Your generated slogans will appear here...</p>}
        </div>
      </div>
    </div>
  );
}

function TestimonialGenerator() {
  const [product, setProduct] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { checkAndRecord, hasReachedLimit } = useCapCheck();

  const handleGenerate = async () => {
    if (!product.trim()) {
      toast({ title: "Error", description: "Please describe your product/service", variant: "destructive" });
      return;
    }
    const allowed = await checkAndRecord('testimonial');
    if (!allowed) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { prompt: `Generate 5 authentic-sounding customer testimonial templates for: ${product}. Include specific benefits, emotions, and realistic details.`, template_type: 'testimonial', language: 'en' }
      });
      if (error) throw error;
      setGeneratedContent(data.generated_content);
      toast({ title: "Success!", description: "Testimonials generated successfully" });
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({ title: "Copied!", description: "Testimonials copied to clipboard" });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Product/Service Description *</Label>
          <Textarea placeholder="Describe your product or service..." value={product} onChange={(e) => setProduct(e.target.value)} rows={4} />
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating || hasReachedLimit} className="w-full">
          {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Star className="mr-2 h-4 w-4" /> Generate Testimonials</>}
        </Button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Generated Testimonials</Label>
          {generatedContent && <Button variant="ghost" size="sm" onClick={copyToClipboard}><Copy className="h-4 w-4 mr-1" /> Copy</Button>}
        </div>
        <div className="min-h-[200px] p-4 rounded-lg border bg-muted/50">
          {generatedContent ? <p className="whitespace-pre-wrap text-sm">{generatedContent}</p> : <p className="text-muted-foreground text-sm">Your generated testimonials will appear here...</p>}
        </div>
      </div>
    </div>
  );
}

function PostIdeasGenerator() {
  const [niche, setNiche] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { checkAndRecord, hasReachedLimit } = useCapCheck();

  const handleGenerate = async () => {
    if (!niche.trim()) {
      toast({ title: "Error", description: "Please enter your niche", variant: "destructive" });
      return;
    }
    const allowed = await checkAndRecord('postideas');
    if (!allowed) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { prompt: `Generate 15 creative social media post ideas for: ${niche}. Include a variety of content types: educational, entertaining, promotional, and engagement-focused.`, template_type: 'post-ideas', language: 'en' }
      });
      if (error) throw error;
      setGeneratedContent(data.generated_content);
      toast({ title: "Success!", description: "Post ideas generated successfully" });
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({ title: "Copied!", description: "Post ideas copied to clipboard" });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Niche/Industry *</Label>
          <Textarea placeholder="Describe your niche, target audience, and content goals..." value={niche} onChange={(e) => setNiche(e.target.value)} rows={4} />
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating || hasReachedLimit} className="w-full">
          {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Lightbulb className="mr-2 h-4 w-4" /> Generate Ideas</>}
        </Button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Generated Post Ideas</Label>
          {generatedContent && <Button variant="ghost" size="sm" onClick={copyToClipboard}><Copy className="h-4 w-4 mr-1" /> Copy</Button>}
        </div>
        <div className="min-h-[200px] p-4 rounded-lg border bg-muted/50">
          {generatedContent ? <p className="whitespace-pre-wrap text-sm">{generatedContent}</p> : <p className="text-muted-foreground text-sm">Your generated ideas will appear here...</p>}
        </div>
      </div>
    </div>
  );
}

function VideoPromptGenerator() {
  const [concept, setConcept] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { checkAndRecord, hasReachedLimit } = useCapCheck();

  const handleGenerate = async () => {
    if (!concept.trim()) {
      toast({ title: "Error", description: "Please describe your video concept", variant: "destructive" });
      return;
    }
    const allowed = await checkAndRecord('videoprompt');
    if (!allowed) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { prompt: `Create a detailed AI video generation prompt for: ${concept}. Include scene description, camera angles, lighting, mood, style, and motion details.`, template_type: 'video-prompt', language: 'en' }
      });
      if (error) throw error;
      setGeneratedContent(data.generated_content);
      toast({ title: "Success!", description: "Video prompt generated successfully" });
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({ title: "Copied!", description: "Video prompt copied to clipboard" });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Video Concept *</Label>
          <Textarea placeholder="Describe the video you want to create..." value={concept} onChange={(e) => setConcept(e.target.value)} rows={4} />
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating || hasReachedLimit} className="w-full">
          {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Film className="mr-2 h-4 w-4" /> Generate Video Prompt</>}
        </Button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Generated Video Prompt</Label>
          {generatedContent && <Button variant="ghost" size="sm" onClick={copyToClipboard}><Copy className="h-4 w-4 mr-1" /> Copy</Button>}
        </div>
        <div className="min-h-[200px] p-4 rounded-lg border bg-muted/50">
          {generatedContent ? <p className="whitespace-pre-wrap text-sm">{generatedContent}</p> : <p className="text-muted-foreground text-sm">Your generated video prompt will appear here...</p>}
        </div>
      </div>
    </div>
  );
}

function BioGenerator() {
  const [details, setDetails] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { checkAndRecord, hasReachedLimit } = useCapCheck();

  const handleGenerate = async () => {
    if (!details.trim()) {
      toast({ title: "Error", description: "Please provide your details", variant: "destructive" });
      return;
    }
    const allowed = await checkAndRecord('bio');
    if (!allowed) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { prompt: `Write 3 professional bio variations for: ${details}. Include short (50 words), medium (100 words), and detailed (150 words) versions suitable for social media profiles.`, template_type: 'bio', language: 'en' }
      });
      if (error) throw error;
      setGeneratedContent(data.generated_content);
      toast({ title: "Success!", description: "Bios generated successfully" });
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({ title: "Copied!", description: "Bios copied to clipboard" });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Your Details *</Label>
          <Textarea placeholder="Your name, profession, achievements, interests..." value={details} onChange={(e) => setDetails(e.target.value)} rows={4} />
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating || hasReachedLimit} className="w-full">
          {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><User className="mr-2 h-4 w-4" /> Generate Bios</>}
        </Button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Generated Bios</Label>
          {generatedContent && <Button variant="ghost" size="sm" onClick={copyToClipboard}><Copy className="h-4 w-4 mr-1" /> Copy</Button>}
        </div>
        <div className="min-h-[200px] p-4 rounded-lg border bg-muted/50">
          {generatedContent ? <p className="whitespace-pre-wrap text-sm">{generatedContent}</p> : <p className="text-muted-foreground text-sm">Your generated bios will appear here...</p>}
        </div>
      </div>
    </div>
  );
}

function FAQGenerator() {
  const [business, setBusiness] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { checkAndRecord, hasReachedLimit } = useCapCheck();

  const handleGenerate = async () => {
    if (!business.trim()) {
      toast({ title: "Error", description: "Please describe your business", variant: "destructive" });
      return;
    }
    const allowed = await checkAndRecord('faq');
    if (!allowed) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { prompt: `Generate 10 frequently asked questions with detailed answers for: ${business}. Cover common customer concerns, product/service details, and policies.`, template_type: 'faq', language: 'en' }
      });
      if (error) throw error;
      setGeneratedContent(data.generated_content);
      toast({ title: "Success!", description: "FAQs generated successfully" });
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({ title: "Copied!", description: "FAQs copied to clipboard" });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Business/Product Description *</Label>
          <Textarea placeholder="Describe your business, products, or services..." value={business} onChange={(e) => setBusiness(e.target.value)} rows={4} />
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating || hasReachedLimit} className="w-full">
          {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><HelpCircle className="mr-2 h-4 w-4" /> Generate FAQs</>}
        </Button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Generated FAQs</Label>
          {generatedContent && <Button variant="ghost" size="sm" onClick={copyToClipboard}><Copy className="h-4 w-4 mr-1" /> Copy</Button>}
        </div>
        <div className="min-h-[200px] p-4 rounded-lg border bg-muted/50">
          {generatedContent ? <p className="whitespace-pre-wrap text-sm">{generatedContent}</p> : <p className="text-muted-foreground text-sm">Your generated FAQs will appear here...</p>}
        </div>
      </div>
    </div>
  );
}
