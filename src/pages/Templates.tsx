import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Users,
  Bot,
  FileText,
  Package,
  FileEdit,
  Video,
  Lightbulb,
  Image,
  Film,
  Hash
} from 'lucide-react';

const templates = [
  {
    id: 'blog',
    title: 'Blog Posts',
    description: 'Create engaging blog content, articles, and web copy',
    icon: PenTool,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    features: ['SEO Optimized', 'Multiple Tones', 'Custom Length'],
    usageCount: '2.1k uses',
    exampleOutput: 'In today\'s digital landscape, content is king. Whether you\'re building a personal brand or scaling your business, having a consistent blog strategy is crucial. Here are five proven strategies to boost your content engagement...'
  },
  {
    id: 'social',
    title: 'Social Media',
    description: 'Generate captivating social media posts and captions',
    icon: MessageSquare,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    features: ['Platform Specific', 'Hashtag Ready', 'Engaging CTAs'],
    usageCount: '1.8k uses',
    exampleOutput: '🚀 Ready to level up your content game? Here\'s what we learned from creating 1000+ posts:\n\n✨ Consistency beats perfection\n💡 Authenticity attracts your tribe\n🎯 Value first, promotion second\n\nWhat\'s your content strategy? Drop it below! 👇\n\n#ContentMarketing #SocialMediaTips #GrowthHacking'
  },
  {
    id: 'email',
    title: 'Email Writer',
    description: 'Craft professional emails, newsletters, and campaigns',
    icon: Mail,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    features: ['Subject Lines', 'Personalized', 'Call-to-Actions'],
    usageCount: '1.5k uses',
    exampleOutput: 'Subject: Your exclusive invitation inside 🎁\n\nHi Sarah,\n\nI hope this email finds you well. I wanted to personally reach out because we\'re launching something special, and I think you\'d be a perfect fit.\n\nWe\'re opening up early access to our new platform, and as one of our valued community members, you\'re getting first dibs...'
  },
  {
    id: 'ads',
    title: 'Ad Copy',
    description: 'Create compelling advertisements and marketing copy',
    icon: Megaphone,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    features: ['High Converting', 'A/B Test Ready', 'Platform Optimized'],
    usageCount: '950 uses',
    exampleOutput: '🎯 Stop Losing Customers to Slow Loading Times!\n\nDid you know 53% of users abandon sites that take over 3 seconds to load?\n\n✅ Cut load times by 70%\n✅ Boost conversions by 35%\n✅ Free 14-day trial\n\nJoin 10,000+ businesses already winning. Start your free trial today! 👉'
  },
  {
    id: 'humanize',
    title: 'AI Text Humanizer',
    description: 'Transform AI-generated text into natural, human-like writing',
    icon: Bot,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    features: ['Natural Flow', 'Authentic Voice', 'Detection Resistant'],
    usageCount: '1.2k uses',
    exampleOutput: 'You know what? I\'ve been thinking about this whole AI thing lately. It\'s pretty wild how technology has changed the way we write. I mean, sure, AI can pump out content faster than any of us could dream of, but there\'s something special about that human touch...'
  },
  {
    id: 'cv',
    title: 'CV Writer',
    description: 'Create professional, ATS-friendly CV and resume content',
    icon: FileText,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    features: ['ATS Optimized', 'Achievement Focus', 'Multiple Formats'],
    usageCount: '890 uses',
    exampleOutput: 'PROFESSIONAL SUMMARY\n\nResults-driven Marketing Manager with 7+ years of experience driving digital transformation and revenue growth. Proven track record of increasing brand awareness by 150% and generating $2M+ in qualified leads through data-driven campaigns...'
  },
  {
    id: 'product',
    title: 'Product Description',
    description: 'Generate compelling product descriptions that convert',
    icon: Package,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    features: ['SEO-Friendly', 'Benefit-Driven', 'Multiple Tones'],
    usageCount: '1.4k uses',
    exampleOutput: 'Experience ultimate comfort with our Premium Memory Foam Pillow. Engineered with NASA-developed technology, this pillow contours perfectly to your head and neck, providing optimal support throughout the night. Wake up refreshed and pain-free. 100-night trial included.'
  },
  {
    id: 'letter',
    title: 'Letter Writer',
    description: 'Write professional letters for any business or personal need',
    icon: FileEdit,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
    features: ['Proper Format', 'Multiple Types', 'Professional Tone'],
    usageCount: '720 uses',
    exampleOutput: 'Dear Mr. Johnson,\n\nI am writing to express my sincere interest in the Senior Marketing Manager position at TechCorp. With over 8 years of experience in digital marketing and a proven track record of driving revenue growth, I am confident I would be a valuable addition to your team...'
  },
  {
    id: 'script',
    title: 'Script Writer',
    description: 'Create engaging video and audio scripts with timing cues',
    icon: Video,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    features: ['Scene Breakdown', 'Timing Cues', 'Multiple Formats'],
    usageCount: '1.1k uses',
    exampleOutput: '[0:00-0:05] INTRO\n[Upbeat music fades in]\nHost: "Hey everyone! Welcome back to the channel. Today, we\'re diving into something game-changing..."\n\n[0:06-0:15] HOOK\n[B-roll of product]\nHost: "What if I told you there\'s a way to cut your work time in half?"'
  },
  {
    id: 'hashtag',
    title: 'Hashtag Generator',
    description: 'Generate trending and relevant hashtags for social media posts',
    icon: Hash,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    features: ['Trending Tags', 'Platform Specific', 'Niche Focused'],
    usageCount: '980 uses',
    exampleOutput: '#DigitalMarketing #MarketingTips #SocialMediaStrategy #ContentCreator #SmallBusiness #Entrepreneur #MarketingAgency #GrowthHacking #BrandBuilding #OnlineMarketing #MarketingGoals #BusinessGrowth #SocialMediaMarketing #ContentStrategy #MarketingExpert'
  },
  {
    id: 'post-ideas',
    title: 'Post Ideas Generator',
    description: 'Get creative content ideas for your social media strategy',
    icon: Lightbulb,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    features: ['Creative Ideas', 'Multiple Platforms', 'Trend-Based'],
    usageCount: '1.3k uses',
    exampleOutput: '1. Behind-the-scenes: Show your workspace setup\n2. Quick tip Tuesday: Share one actionable tip\n3. Transformation story: Before & after results\n4. Ask me anything: Host a Q&A session\n5. Tool showcase: Review your favorite software\n6. Myth-busting: Debunk common industry myths\n7. Challenge post: Create an engaging challenge'
  },
  {
    id: 'chatgpt-prompt',
    title: 'ChatGPT Prompt Generator',
    description: 'Create effective prompts for ChatGPT and AI assistants',
    icon: Bot,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    features: ['Optimized Structure', 'Clear Instructions', 'Professional'],
    usageCount: '1.6k uses',
    exampleOutput: 'You are an expert content strategist with 10+ years of experience. Analyze the following blog post and provide specific recommendations to improve SEO, readability, and engagement. Focus on:\n1. Keyword optimization\n2. Structure and headings\n3. Call-to-action effectiveness\n4. Content gaps\n\nProvide actionable advice in bullet points.'
  },
  {
    id: 'image-prompt',
    title: 'Image Prompt Generator',
    description: 'Generate detailed prompts for AI image generation tools',
    icon: Image,
    color: 'text-violet-600',
    bgColor: 'bg-violet-100',
    features: ['Detailed Descriptions', 'Style Guides', 'AI-Optimized'],
    usageCount: '1.4k uses',
    exampleOutput: 'A serene mountain landscape at golden hour, featuring snow-capped peaks reflecting in a crystal-clear alpine lake. Photorealistic style, shot with a wide-angle lens, dramatic clouds catching the sunset light, wildflowers in the foreground, ultra-detailed, 8K resolution, professional nature photography'
  },
  {
    id: 'video-prompt',
    title: 'Video Prompt Generator',
    description: 'Create comprehensive prompts for video generation and planning',
    icon: Film,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    features: ['Scene Details', 'Camera Movements', 'Production Ready'],
    usageCount: '890 uses',
    exampleOutput: 'Opening shot: Slow dolly-in on a modern office space, natural lighting from large windows. Medium shot of professional working at desk, focused expression. Camera pans right to reveal collaborative team meeting. Cut to close-up of hands sketching on whiteboard. Transition: Quick montage of successful project completion. Mood: Inspirational, corporate, dynamic.'
  }
];

export default function Templates() {
  const location = useLocation();
  const currentTemplate = location.pathname.split('/')[3];

  if (currentTemplate && currentTemplate !== 'templates') {
    const template = templates.find(t => t.id === currentTemplate);
    
    return (
      <div className="max-w-6xl mx-auto space-y-6">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {templates.map((template) => (
          <Card 
            key={template.id} 
            className="group relative overflow-hidden hover:shadow-glow hover:scale-[1.02] transition-all duration-300 cursor-pointer border-2 hover:border-primary/20"
          >
            {/* Hover gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <CardHeader className="pb-3 relative z-10">
              <div className={`w-12 h-12 ${template.bgColor} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <template.icon className={`w-6 h-6 ${template.color}`} />
              </div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">{template.title}</CardTitle>
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
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
                  <ArrowRight className="w-4 h-4 ml-2" />
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