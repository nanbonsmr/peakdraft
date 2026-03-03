import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
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
import ProposalGenerator from '@/components/templates/ProposalGenerator';
import CourtReportGenerator from '@/components/templates/CourtReportGenerator';
import AdsImagePromptGenerator from '@/components/templates/AdsImagePromptGenerator';
import BackgroundImagePromptGenerator from '@/components/templates/BackgroundImagePromptGenerator';
import FriendlyLetterGenerator from '@/components/templates/FriendlyLetterGenerator';
import CoverLetterGenerator from '@/components/templates/CoverLetterGenerator';
import PressReleaseGenerator from '@/components/templates/PressReleaseGenerator';
import BusinessPlanGenerator from '@/components/templates/BusinessPlanGenerator';
import ExcelGenerator from '@/components/templates/ExcelGenerator';
import { LinkedInPostGenerator } from '@/components/templates/LinkedInPostGenerator';
import { NewsletterGenerator } from '@/components/templates/NewsletterGenerator';
import { ProductReviewGenerator } from '@/components/templates/ProductReviewGenerator';
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
  Hash,
  Pin,
  FileCheck,
  Scale,
  ImagePlus,
  Layers,
  Heart,
  FileUser,
  Newspaper,
  Briefcase,
  Linkedin,
  Star,
  Search,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const categories = [
  { id: 'all', label: 'All Templates', icon: Sparkles },
  { id: 'writing', label: 'Writing', icon: PenTool },
  { id: 'social', label: 'Social Media', icon: MessageSquare },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'ai-prompts', label: 'AI Prompts', icon: Bot },
  { id: 'productivity', label: 'Productivity', icon: FileSpreadsheet },
  { id: 'legal', label: 'Legal', icon: Scale },
  { id: 'personal', label: 'Personal', icon: Heart },
];

const templates = [
  {
    id: 'blog',
    title: 'Blog Posts',
    description: 'Create engaging blog content, articles, and web copy',
    icon: PenTool,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    category: 'writing',
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
    category: 'social',
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
    category: 'marketing',
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
    category: 'marketing',
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
    category: 'writing',
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
    category: 'business',
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
    category: 'marketing',
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
    category: 'business',
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
    category: 'writing',
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
    category: 'social',
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
    category: 'social',
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
    category: 'ai-prompts',
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
    category: 'ai-prompts',
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
    category: 'ai-prompts',
    features: ['Scene Details', 'Camera Movements', 'Production Ready'],
    usageCount: '890 uses',
    exampleOutput: 'Opening shot: Slow dolly-in on a modern office space, natural lighting from large windows. Medium shot of professional working at desk, focused expression. Camera pans right to reveal collaborative team meeting. Cut to close-up of hands sketching on whiteboard. Transition: Quick montage of successful project completion. Mood: Inspirational, corporate, dynamic.'
  },
  {
    id: 'proposal',
    title: 'Proposal Writer',
    description: 'Create professional business and project proposals',
    icon: FileCheck,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    category: 'business',
    features: ['Business Proposals', 'Project Plans', 'Persuasive'],
    usageCount: '650 uses',
    exampleOutput: 'EXECUTIVE SUMMARY\n\nWe propose a comprehensive digital transformation initiative designed to modernize your operations and increase efficiency by 40%. Our phased approach ensures minimal disruption while maximizing ROI...'
  },
  {
    id: 'court-report',
    title: 'Court Report Writer',
    description: 'Generate professional legal documents and court reports',
    icon: Scale,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    category: 'legal',
    features: ['Legal Format', 'Formal Language', 'Case Summaries'],
    usageCount: '420 uses',
    exampleOutput: 'IN THE MATTER OF: Case No. 2024-CV-1234\n\nLEGAL BRIEF\n\n1. STATEMENT OF FACTS\nThe plaintiff, hereinafter referred to as "Claimant," initiated proceedings on...'
  },
  {
    id: 'ads-image-prompt',
    title: 'AI Ads Image Prompt',
    description: 'Generate prompts for AI advertisement images',
    icon: ImagePlus,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    category: 'ai-prompts',
    features: ['Platform Specific', 'Brand Colors', 'Commercial Quality'],
    usageCount: '780 uses',
    exampleOutput: 'Professional product photography of wireless earbuds on a minimalist white surface, soft gradient lighting from above, subtle reflection, brand colors (navy blue accents), clean modern aesthetic, 8K commercial quality...'
  },
  {
    id: 'background-image-prompt',
    title: 'AI Background Image',
    description: 'Create prompts for stunning background images',
    icon: Layers,
    color: 'text-sky-600',
    bgColor: 'bg-sky-100',
    category: 'ai-prompts',
    features: ['Multiple Styles', 'Seamless', 'High Resolution'],
    usageCount: '920 uses',
    exampleOutput: 'Abstract gradient background, flowing waves of deep purple transitioning to soft coral pink, subtle geometric shapes floating in space, soft bokeh effect, 8K seamless wallpaper, perfect for text overlay...'
  },
  {
    id: 'friendly-letter',
    title: 'AI Friendly Letter',
    description: 'Write warm, heartfelt letters for friends and family',
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    category: 'personal',
    features: ['Personal Touch', 'Multiple Tones', 'Heartfelt'],
    usageCount: '560 uses',
    exampleOutput: 'Dear Sarah,\n\nI hope this letter finds you well. I\'ve been thinking about you lately and wanted to reach out to say how much your friendship means to me...'
  },
  {
    id: 'cover-letter',
    title: 'Cover Letter Writer',
    description: 'Create compelling cover letters that get you hired',
    icon: FileUser,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    category: 'business',
    features: ['ATS-Friendly', 'Job-Specific', 'Professional'],
    usageCount: '1.1k uses',
    exampleOutput: 'Dear Hiring Manager,\n\nI am excited to apply for the Software Engineer position at your company. With 5 years of experience in full-stack development and a passion for building scalable solutions...'
  },
  {
    id: 'press-release',
    title: 'Press Release Generator',
    description: 'Generate professional press releases for media coverage',
    icon: Newspaper,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    category: 'marketing',
    features: ['Media-Ready', 'AP Style', 'Newsworthy'],
    usageCount: '680 uses',
    exampleOutput: 'FOR IMMEDIATE RELEASE\n\nTechCorp Announces Revolutionary AI Platform\n\nSAN FRANCISCO, CA - TechCorp, a leader in artificial intelligence solutions, today announced the launch of...'
  },
  {
    id: 'business-plan',
    title: 'Business Plan Writer',
    description: 'Create comprehensive business plans for investors',
    icon: Briefcase,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    category: 'business',
    features: ['Investor-Ready', 'Financial Projections', 'Market Analysis'],
    usageCount: '540 uses',
    exampleOutput: 'EXECUTIVE SUMMARY\n\nCompany Overview: TechStart Inc. is an innovative SaaS platform designed to revolutionize project management for remote teams...'
  },
  {
    id: 'linkedin-post',
    title: 'LinkedIn Post Generator',
    description: 'Create engaging LinkedIn posts that boost your professional presence',
    icon: Linkedin,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    category: 'social',
    features: ['Thought Leadership', 'Career Updates', 'Engagement Focused'],
    usageCount: '1.2k uses',
    exampleOutput: '🚀 3 lessons I learned after failing my first startup...\n\n1. Speed matters more than perfection\n2. Your network is your net worth\n3. Embrace failure as feedback\n\nWhat would you add? 👇'
  },
  {
    id: 'newsletter',
    title: 'Newsletter Generator',
    description: 'Create engaging newsletters that keep your audience coming back',
    icon: Newspaper,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    category: 'marketing',
    features: ['Curated Content', 'Educational', 'Engaging CTAs'],
    usageCount: '890 uses',
    exampleOutput: 'Subject: 🎯 This week\'s top insights\n\nHey friend,\n\nHope you\'re having a great week! Here are the 3 things you need to know this week...'
  },
  {
    id: 'product-review',
    title: 'Product Review Generator',
    description: 'Create authentic and helpful product reviews that readers trust',
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    category: 'writing',
    features: ['Detailed Analysis', 'Pros & Cons', 'Rating System'],
    usageCount: '760 uses',
    exampleOutput: '⭐⭐⭐⭐⭐ EXCELLENT\n\nAfter 3 months of daily use, I can confidently say this is the best investment I\'ve made this year. Here\'s why...'
  },
  {
    id: 'excel',
    title: 'Excel Generator',
    description: 'Create professional Excel spreadsheets with charts, formatting, and formulas',
    icon: FileSpreadsheet,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    category: 'productivity',
    features: ['Charts & Graphs', 'Auto-Formatting', 'Todo Lists', 'Reports'],
    usageCount: '1.5k uses',
    exampleOutput: 'Professional Excel with bar charts, pie charts, conditional formatting, auto-calculated totals, and styled headers...'
  }
];

export default function Templates() {
  const location = useLocation();
  const currentTemplate = location.pathname.split('/')[3];
  const [pinnedTemplateIds, setPinnedTemplateIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadPinnedTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from('pinned_templates')
          .select('template_id')
          .order('pinned_at', { ascending: false });

        if (!error && data) {
          setPinnedTemplateIds(data.map(pt => pt.template_id));
        }
      } catch (error) {
        console.error('Error loading pinned templates:', error);
      }
    };

    loadPinnedTemplates();
  }, []);

  // Filter by search query and category
  const filteredTemplates = templates.filter(t => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    const aIsPinned = pinnedTemplateIds.includes(a.id);
    const bIsPinned = pinnedTemplateIds.includes(b.id);
    if (aIsPinned && !bIsPinned) return -1;
    if (!aIsPinned && bIsPinned) return 1;
    return templates.indexOf(a) - templates.indexOf(b);
  });

  // Get count per category
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return templates.length;
    return templates.filter(t => t.category === categoryId).length;
  };

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
        {currentTemplate === 'proposal' && <ProposalGenerator />}
        {currentTemplate === 'court-report' && <CourtReportGenerator />}
        {currentTemplate === 'ads-image-prompt' && <AdsImagePromptGenerator />}
        {currentTemplate === 'background-image-prompt' && <BackgroundImagePromptGenerator />}
        {currentTemplate === 'friendly-letter' && <FriendlyLetterGenerator />}
        {currentTemplate === 'cover-letter' && <CoverLetterGenerator />}
        {currentTemplate === 'press-release' && <PressReleaseGenerator />}
        {currentTemplate === 'business-plan' && <BusinessPlanGenerator />}
        {currentTemplate === 'linkedin-post' && <LinkedInPostGenerator />}
        {currentTemplate === 'newsletter' && <NewsletterGenerator />}
        {currentTemplate === 'product-review' && <ProductReviewGenerator />}
        {currentTemplate === 'excel' && <ExcelGenerator />}
      </div>
    );
  }

  return (
    <>
    <Helmet>
      <title>AI Writing Templates - Blog, Email, Ad Copy, Social Media Generators | PeakDraft</title>
      <meta name="description" content="25+ AI writing templates: blog post generator, email writer, ad copy creator, social media content, product descriptions, cover letters, proposals & more. Create professional content in seconds." />
      <meta name="keywords" content="AI writing templates, blog generator, email generator, ad copy generator, social media generator, product description generator, cover letter generator, AI content creator, PeakDraft" />
      <link rel="canonical" href="https://peakdraft.netlify.app/app/templates" />
      <meta name="robots" content="index, follow" />
      <meta property="og:title" content="25+ AI Writing Templates | PeakDraft" />
      <meta property="og:description" content="Generate blog posts, emails, ad copy, social media content, and more with AI-powered templates." />
      <meta property="og:url" content="https://peakdraft.netlify.app/app/templates" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="AI Writing Templates | PeakDraft" />
      <meta name="twitter:description" content="25+ AI-powered writing templates for blogs, emails, ads, social media & more." />
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "AI Writing Templates",
        "description": "Collection of 25+ AI-powered content generation templates",
        "numberOfItems": templates.length,
        "itemListElement": templates.map((t, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "item": { "@type": "SoftwareApplication", "name": t.title, "description": t.description, "applicationCategory": "UtilitiesApplication", "operatingSystem": "Web" }
        }))
      })}</script>
    </Helmet>
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Content Templates</h2>
          <p className="text-muted-foreground">
            Choose from our collection of AI-powered content generation templates.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isActive = selectedCategory === category.id;
          const count = getCategoryCount(category.id);
          return (
            <Button
              key={category.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 transition-all ${
                isActive ? 'shadow-md' : 'hover:bg-muted'
              }`}
            >
              <category.icon className="w-4 h-4" />
              <span>{category.label}</span>
              <Badge 
                variant={isActive ? "secondary" : "outline"} 
                className="ml-1 text-xs px-1.5 py-0"
              >
                {count}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {sortedTemplates.map((template) => {
          const isPinned = pinnedTemplateIds.includes(template.id);
          return (
            <Card 
              key={template.id} 
              className={`group relative overflow-hidden hover:shadow-glow hover:scale-[1.02] transition-all duration-300 cursor-pointer border-2 hover:border-primary/20 ${
                isPinned ? 'ring-2 ring-primary/20 border-primary/30' : ''
              }`}
            >
              {/* Pinned badge */}
              {isPinned && (
                <div className="absolute top-2 right-2 z-20">
                  <Badge variant="default" className="flex items-center gap-1 text-xs">
                    <Pin className="w-3 h-3" />
                    Featured
                  </Badge>
                </div>
              )}
              
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
          );
        })}
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
    </>
  );
}