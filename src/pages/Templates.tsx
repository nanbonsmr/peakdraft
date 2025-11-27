import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import BlogGenerator from '@/components/templates/BlogGenerator';
import SocialMediaGenerator from '@/components/templates/SocialMediaGenerator';
import EmailGenerator from '@/components/templates/EmailGenerator';
import AdCopyGenerator from '@/components/templates/AdCopyGenerator';
import HumanizeGenerator from '@/components/templates/HumanizeGenerator';
import CVGenerator from '@/components/templates/CVGenerator';
import ProductDescriptionGenerator from '@/components/templates/ProductDescriptionGenerator';
import LetterGenerator from '@/components/templates/LetterGenerator';
import ScriptGenerator from '@/components/templates/ScriptGenerator';
import HashtagGenerator from '@/components/templates/HashtagGenerator';
import PostIdeasGenerator from '@/components/templates/PostIdeasGenerator';
import ChatGPTPromptGenerator from '@/components/templates/ChatGPTPromptGenerator';
import ImagePromptGenerator from '@/components/templates/ImagePromptGenerator';
import VideoPromptGenerator from '@/components/templates/VideoPromptGenerator';
import { 
  PenTool, 
  MessageSquare, 
  Mail, 
  Megaphone,
  ArrowRight,
  Sparkles,
  Clock,
  Users,
  TrendingUp,
  Zap,
  Crown,
  Copy,
  Calendar,
  Hash,
  Bot,
  FileText,
  Package,
  FileEdit,
  Video,
  Lightbulb,
  Image,
  Film,
  Trash2
} from 'lucide-react';
import { ExportDropdown } from '@/components/ExportDropdown';

const templates = [
  {
    id: 'blog',
    title: 'Blog Posts',
    description: 'Create engaging blog content, articles, and web copy',
    icon: PenTool,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    features: ['SEO Optimized', 'Multiple Tones', 'Custom Length'],
    usageCount: '2.1k uses'
  },
  {
    id: 'social',
    title: 'Social Media',
    description: 'Generate captivating social media posts and captions',
    icon: MessageSquare,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    features: ['Platform Specific', 'Hashtag Ready', 'Engaging CTAs'],
    usageCount: '1.8k uses'
  },
  {
    id: 'email',
    title: 'Email Writer',
    description: 'Craft professional emails, newsletters, and campaigns',
    icon: Mail,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    features: ['Subject Lines', 'Personalized', 'Call-to-Actions'],
    usageCount: '1.5k uses'
  },
  {
    id: 'ads',
    title: 'Ad Copy',
    description: 'Create compelling advertisements and marketing copy',
    icon: Megaphone,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    features: ['High Converting', 'A/B Test Ready', 'Platform Optimized'],
    usageCount: '950 uses'
  },
  {
    id: 'humanize',
    title: 'AI Text Humanizer',
    description: 'Transform AI-generated text into natural, human-like writing',
    icon: Bot,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    features: ['Natural Flow', 'Authentic Voice', 'Detection Resistant'],
    usageCount: '1.2k uses'
  },
  {
    id: 'cv',
    title: 'CV Writer',
    description: 'Create professional, ATS-friendly CV and resume content',
    icon: FileText,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    features: ['ATS Optimized', 'Achievement Focus', 'Multiple Formats'],
    usageCount: '890 uses'
  },
  {
    id: 'product',
    title: 'Product Description',
    description: 'Generate compelling product descriptions that convert',
    icon: Package,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    features: ['SEO-Friendly', 'Benefit-Driven', 'Multiple Tones'],
    usageCount: '1.4k uses'
  },
  {
    id: 'letter',
    title: 'Letter Writer',
    description: 'Write professional letters for any business or personal need',
    icon: FileEdit,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
    features: ['Proper Format', 'Multiple Types', 'Professional Tone'],
    usageCount: '720 uses'
  },
  {
    id: 'script',
    title: 'Script Writer',
    description: 'Create engaging video and audio scripts with timing cues',
    icon: Video,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    features: ['Scene Breakdown', 'Timing Cues', 'Multiple Formats'],
    usageCount: '1.1k uses'
  },
  {
    id: 'hashtag',
    title: 'Hashtag Generator',
    description: 'Generate trending and relevant hashtags for social media posts',
    icon: Hash,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    features: ['Trending Tags', 'Platform Specific', 'Niche Focused'],
    usageCount: '980 uses'
  },
  {
    id: 'post-ideas',
    title: 'Post Ideas Generator',
    description: 'Get creative content ideas for your social media strategy',
    icon: Lightbulb,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    features: ['Creative Ideas', 'Multiple Platforms', 'Trend-Based'],
    usageCount: '1.3k uses'
  },
  {
    id: 'chatgpt-prompt',
    title: 'ChatGPT Prompt Generator',
    description: 'Create effective prompts for ChatGPT and AI assistants',
    icon: Bot,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    features: ['Optimized Structure', 'Clear Instructions', 'Professional'],
    usageCount: '1.6k uses'
  },
  {
    id: 'image-prompt',
    title: 'Image Prompt Generator',
    description: 'Generate detailed prompts for AI image generation tools',
    icon: Image,
    color: 'text-violet-600',
    bgColor: 'bg-violet-100',
    features: ['Detailed Descriptions', 'Style Guides', 'AI-Optimized'],
    usageCount: '1.4k uses'
  },
  {
    id: 'video-prompt',
    title: 'Video Prompt Generator',
    description: 'Create comprehensive prompts for video generation and planning',
    icon: Film,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    features: ['Scene Details', 'Camera Movements', 'Production Ready'],
    usageCount: '890 uses'
  }
];

export default function Templates() {
  const location = useLocation();
  const currentTemplate = location.pathname.split('/')[3];
  const { profile } = useAuth();
  const { toast } = useToast();
  const [recentContent, setRecentContent] = useState<any[]>([]);

  const loadRecentContent = async (templateType: string) => {
    if (!profile) return;
    
    const { data } = await supabase
      .from('content_generations')
      .select('*')
      .eq('user_id', profile.user_id)
      .eq('template_type', templateType)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) {
      setRecentContent(data);
    }
  };

  const copyContentToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard."
    });
  };

  const handleDeleteContent = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('content_generations')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      setRecentContent(prev => prev.filter(item => item.id !== contentId));
      
      toast({
        title: "Deleted!",
        description: "Content deleted successfully."
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete content.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (currentTemplate && currentTemplate !== 'templates' && profile) {
      loadRecentContent(currentTemplate);
    }
  }, [currentTemplate, profile]);

  if (currentTemplate && currentTemplate !== 'templates') {
    const template = templates.find(t => t.id === currentTemplate);
    
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentTemplate === 'blog' && <BlogGenerator />}
            {currentTemplate === 'social' && <SocialMediaGenerator />}
            {currentTemplate === 'email' && <EmailGenerator />}
            {currentTemplate === 'ads' && <AdCopyGenerator />}
            {currentTemplate === 'humanize' && <HumanizeGenerator />}
            {currentTemplate === 'cv' && <CVGenerator />}
            {currentTemplate === 'product' && <ProductDescriptionGenerator />}
            {currentTemplate === 'letter' && <LetterGenerator />}
            {currentTemplate === 'script' && <ScriptGenerator />}
            {currentTemplate === 'hashtag' && <HashtagGenerator />}
            {currentTemplate === 'post-ideas' && <PostIdeasGenerator />}
            {currentTemplate === 'chatgpt-prompt' && <ChatGPTPromptGenerator />}
            {currentTemplate === 'image-prompt' && <ImagePromptGenerator />}
            {currentTemplate === 'video-prompt' && <VideoPromptGenerator />}
          </div>

          {/* Recent Creations Sidebar */}
          <div>
            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-violet-500/10 via-violet-500/5 to-transparent">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-violet-500/20 rounded-xl">
                    <TrendingUp className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  Recent {template?.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentContent.length > 0 ? (
                    recentContent.map((content, index) => (
                      <div key={index} className="group flex items-center justify-between p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-2xl hover:from-muted/50 hover:to-muted/20 transition-all duration-300 border border-muted-foreground/10">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`p-3 rounded-xl ${template?.bgColor} ${template?.color} flex-shrink-0`}>
                            {template && <template.icon className="h-5 w-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate" title={content.prompt}>
                              {content.prompt}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="font-medium">{content.word_count} words</span>
                              <span>•</span>
                              <span>{new Date(content.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <Clock className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                {template && <template.icon className="h-5 w-5" />}
                                {template?.title} Content
                              </DialogTitle>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              {/* Content Info */}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                                <div className="flex items-center gap-1">
                                  <Hash className="w-4 h-4" />
                                  <span>{content.word_count} words</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(content.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>

                              {/* Original Prompt */}
                              <div className="space-y-2">
                                <Label className="font-semibold">Original Prompt:</Label>
                                <div className="bg-muted/50 rounded-lg p-3">
                                  <p className="text-sm">{content.prompt}</p>
                                </div>
                              </div>

                              {/* Generated Content */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="font-semibold">Generated Content:</Label>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => copyContentToClipboard(content.generated_content)}
                                      className="flex items-center gap-2"
                                    >
                                      <Copy className="w-4 h-4" />
                                      Copy
                                    </Button>
                                    <ExportDropdown
                                      content={content.generated_content}
                                      filename={`${content.template_type}-${Date.now()}`}
                                    />
                                  </div>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                                    {content.generated_content}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteContent(content.id)}
                            className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete content"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="p-6 bg-muted/30 rounded-3xl mb-4 mx-auto w-fit">
                        {template && <template.icon className="h-12 w-12 text-muted-foreground mx-auto" />}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No {template?.title?.toLowerCase()} yet</h3>
                      <p className="text-muted-foreground text-sm">
                        Create your first {template?.title?.toLowerCase()} content to see it here!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Content Templates</h2>
        <p className="text-muted-foreground">
          Choose from our collection of AI-powered content generation templates.
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="group hover:shadow-elegant transition-all duration-200 cursor-pointer">
            <CardHeader className="pb-3">
              <div className={`w-12 h-12 ${template.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                <template.icon className={`w-6 h-6 ${template.color}`} />
              </div>
              <CardTitle className="text-lg">{template.title}</CardTitle>
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Usage</span>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span className="font-medium">{template.usageCount}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {template.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button className="w-full group-hover:shadow-sm" asChild>
                <a href={`/app/templates/${template.id}`}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Use Template
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Popular Templates Section */}
      <Card className="bg-gradient-subtle border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Most Popular This Week
          </CardTitle>
          <CardDescription>
            Templates that are trending among content creators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.slice(0, 2).map((template, index) => (
              <div key={template.id} className="flex items-center gap-4 p-4 bg-background rounded-lg">
                <div className={`w-10 h-10 ${template.bgColor} rounded-lg flex items-center justify-center`}>
                  <template.icon className={`w-5 h-5 ${template.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{template.title}</h4>
                  <p className="text-sm text-muted-foreground">{template.usageCount}</p>
                </div>
                <Badge variant={index === 0 ? 'default' : 'secondary'}>
                  #{index + 1}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}