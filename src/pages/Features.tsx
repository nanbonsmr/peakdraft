import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PenTool, Sparkles, Zap, Mail, Briefcase, Hash, Video, Image, 
  MessageSquare, TrendingUp, FileText, Star, LayoutGrid, Calendar, 
  BarChart3, CheckCircle, ArrowRight, Users, Shield, Clock, 
  Target, Layers, Repeat, Bell, Search, Download, Globe, 
  Eye, Tag, Timer, Share2, ListChecks, ImagePlus, Wand2, Edit3, Gift
} from 'lucide-react';
import { PublicNavbar } from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

const siteUrl = 'https://peakdraft.netlify.app';

const jsonLdFeatures = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "PeakDraft Features",
  "description": "Complete list of AI content generation, image creation, free tools, and task management features",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "AI Content Templates",
      "description": "25+ professional AI writing templates for blogs, social media, emails, and more"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "AI Image Generation & Editing",
      "description": "Generate and edit images with AI using natural language instructions and 8 style presets"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "15 Free AI Tools",
      "description": "Access 15 free AI content generators daily with no credit card required"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "Task Management",
      "description": "Built-in Kanban boards, calendar views, and productivity analytics"
    },
    {
      "@type": "ListItem",
      "position": 5,
      "name": "Multi-Format Export",
      "description": "Export content as PDF, DOCX, TXT or copy to clipboard"
    }
  ]
};

const aiTemplates = [
  {
    icon: FileText,
    title: 'Blog Post Generator',
    description: 'Create SEO-optimized, engaging blog posts in minutes. Perfect for content marketers, bloggers, and businesses looking to drive organic traffic.',
    features: ['SEO keyword optimization', 'Multiple tone options', 'Customizable length', 'Meta description generation'],
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: MessageSquare,
    title: 'Social Media Content',
    description: 'Generate viral-worthy posts for Instagram, Twitter, LinkedIn, Facebook, and TikTok. Tailored for each platform\'s unique requirements.',
    features: ['Platform-specific formatting', 'Hashtag suggestions', 'Engagement optimization', 'Caption variations'],
    color: 'from-pink-500 to-rose-600'
  },
  {
    icon: Mail,
    title: 'Email Marketing',
    description: 'Write persuasive email sequences, newsletters, and campaigns that convert subscribers into customers.',
    features: ['Subject line optimization', 'Call-to-action templates', 'A/B test variations', 'Personalization tokens'],
    color: 'from-violet-500 to-purple-600'
  },
  {
    icon: Zap,
    title: 'Ad Copy Generator',
    description: 'Create high-converting advertisements for Facebook, Google, Instagram, and display networks.',
    features: ['Headline variations', 'Character limit compliance', 'CTA optimization', 'Audience targeting tips'],
    color: 'from-orange-500 to-amber-600'
  },
  {
    icon: Briefcase,
    title: 'CV & Resume Builder',
    description: 'Generate professional resumes and cover letters tailored to specific job descriptions and industries.',
    features: ['ATS-friendly formatting', 'Industry keywords', 'Achievement highlighting', 'Multiple formats'],
    color: 'from-teal-500 to-cyan-600'
  },
  {
    icon: Star,
    title: 'Product Descriptions',
    description: 'Compelling eCommerce copy that highlights benefits, features, and drives purchase decisions.',
    features: ['Benefit-focused writing', 'SEO optimization', 'Bullet point formatting', 'Brand voice matching'],
    color: 'from-yellow-500 to-orange-600'
  },
  {
    icon: PenTool,
    title: 'Letter Generator',
    description: 'Professional business letters, formal correspondence, and official communications made easy.',
    features: ['Multiple letter types', 'Formal tone options', 'Template library', 'Custom formatting'],
    color: 'from-emerald-500 to-green-600'
  },
  {
    icon: Video,
    title: 'Script Generator',
    description: 'YouTube scripts, video narrations, podcast outlines, and presentation scripts.',
    features: ['Hook optimization', 'Scene breakdowns', 'Timing estimates', 'Engagement triggers'],
    color: 'from-red-500 to-rose-600'
  },
  {
    icon: Hash,
    title: 'Hashtag Generator',
    description: 'Discover trending and relevant hashtags to maximize your social media reach and discoverability.',
    features: ['Trending analysis', 'Niche suggestions', 'Competition metrics', 'Platform optimization'],
    color: 'from-indigo-500 to-blue-600'
  },
  {
    icon: TrendingUp,
    title: 'Post Ideas Generator',
    description: 'Never run out of content ideas. Get fresh, engaging post concepts for any niche or industry.',
    features: ['Trend integration', 'Content calendar ideas', 'Series suggestions', 'Seasonal themes'],
    color: 'from-purple-500 to-violet-600'
  },
  {
    icon: Sparkles,
    title: 'AI Humanizer',
    description: 'Transform AI-generated text into natural, human-sounding content that bypasses detection.',
    features: ['Natural language flow', 'Tone adjustment', 'Readability optimization', 'Plagiarism-free output'],
    color: 'from-fuchsia-500 to-pink-600'
  },
  {
    icon: Image,
    title: 'Image Prompt Generator',
    description: 'Create detailed prompts for AI image generators like Midjourney, DALL-E, and Stable Diffusion.',
    features: ['Style specifications', 'Composition guidance', 'Keyword optimization', 'Negative prompts'],
    color: 'from-cyan-500 to-blue-600'
  },
  {
    icon: MessageSquare,
    title: 'ChatGPT Prompt Generator',
    description: 'Craft effective prompts to get better results from ChatGPT and other AI assistants.',
    features: ['Context structuring', 'Role definitions', 'Output formatting', 'Chain prompting'],
    color: 'from-green-500 to-emerald-600'
  },
  {
    icon: Video,
    title: 'Video Prompt Generator',
    description: 'Generate prompts for AI video tools like Sora, Runway, and Pika Labs.',
    features: ['Scene descriptions', 'Motion guidance', 'Style references', 'Duration optimization'],
    color: 'from-rose-500 to-red-600'
  }
];

const taskFeatures = [
  {
    icon: LayoutGrid,
    title: 'Kanban Board',
    description: 'Visual task management with drag-and-drop functionality. Click any task card to instantly view details, subtasks, and progress in a quick-view popup.',
    benefits: ['Drag-and-drop interface', 'Quick task view popup', 'Real-time status updates', 'Progress visualization', 'Mobile-friendly swipe navigation'],
    useCase: 'Perfect for managing content pipelines - move blog posts from "Draft" to "Review" to "Published" with a simple drag.'
  },
  {
    icon: Eye,
    title: 'Quick Task View',
    description: 'Click any task to instantly view all details in a popup. See description, subtasks, labels, time tracked, and due dates without leaving your board.',
    benefits: ['One-click task preview', 'Subtask toggle directly in view', 'Edit button for quick access', 'Labels & time display', 'Due date visibility'],
    useCase: 'Quickly review task details during standup meetings or when prioritizing your day without switching contexts.'
  },
  {
    icon: ListChecks,
    title: 'Subtasks & Progress',
    description: 'Break down complex content projects into manageable subtasks. Track completion with visual progress bars and toggle subtasks directly from the view popup.',
    benefits: ['Nested task structure', 'Visual progress tracking', 'Quick-add during creation', 'Toggle from quick view', 'Completion percentages'],
    useCase: 'Turn "Write Q4 Blog Series" into actionable steps: research, outline, draft, edit, publish - each trackable individually.'
  },
  {
    icon: Calendar,
    title: 'Calendar View',
    description: 'Schedule content creation and track deadlines with an intuitive calendar interface. Never miss a publishing date again.',
    benefits: ['Deadline tracking', 'Content scheduling', 'Month/week/day views', 'Due date reminders', 'Visual timeline'],
    useCase: 'Plan your content calendar for the month - see all blog posts, social media campaigns, and newsletter sends at a glance.'
  },
  {
    icon: BarChart3,
    title: 'Task Analytics',
    description: 'Track your productivity with detailed charts and metrics. Understand your work patterns and optimize your workflow.',
    benefits: ['Completion rate tracking', 'Productivity trends', 'Time analysis', 'Performance insights', 'Custom date ranges'],
    useCase: 'Identify your most productive days, spot bottlenecks in your workflow, and set data-driven goals for improvement.'
  },
  {
    icon: Tag,
    title: 'Custom Labels',
    description: 'Organize tasks with color-coded labels. Create custom tags for content types, clients, campaigns, or any categorization you need.',
    benefits: ['Color-coded organization', 'Custom label creation', 'Multi-label support', 'Filter by labels', 'Visual task grouping'],
    useCase: 'Tag tasks by client (Acme Corp, Beta Inc), content type (Blog, Social, Email), or campaign (Q4 Launch, Holiday Promo).'
  },
  {
    icon: Timer,
    title: 'Time Tracking',
    description: 'Track time spent on each task with start/stop timer. Review time logs and understand where your hours go.',
    benefits: ['One-click time tracking', 'Time entry history', 'Duration display on cards', 'Session descriptions', 'Productivity insights'],
    useCase: 'Know exactly how long blog posts take vs social media content - use data to price services or improve efficiency.'
  },
  {
    icon: Target,
    title: 'Priority Management',
    description: 'Set priority levels (low, medium, high, urgent) to focus on what matters most. Filter and sort tasks by urgency.',
    benefits: ['Four priority levels', 'Color-coded badges', 'Smart filtering', 'Priority sorting', 'Visual urgency indicators'],
    useCase: 'Mark client deadline content as "Urgent" while keeping internal projects at "Medium" - always know what to tackle first.'
  },
  {
    icon: Share2,
    title: 'Task Sharing',
    description: 'Share tasks with clients or team members via public links or email. Set view-only or edit permissions.',
    benefits: ['Public share links', 'Email sharing', 'Permission controls', 'Expiring links', 'Preview before sharing'],
    useCase: 'Share a task checklist with a client for approval, or collaborate with a freelancer on specific deliverables.'
  },
  {
    icon: Repeat,
    title: 'Recurring Tasks',
    description: 'Automate repetitive content tasks with recurring schedules. Set it once and never forget again.',
    benefits: ['Daily/weekly/monthly', 'Custom recurrence', 'Auto-generation', 'End date options', 'Flexible scheduling'],
    useCase: 'Set up weekly "Social Media Planning" tasks or monthly "Newsletter Review" tasks that auto-create on schedule.'
  }
];

export default function Features() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Features - AI Content, Image Generation & Task Management | PeakDraft</title>
        <meta name="description" content="Explore 25+ AI content templates, AI image generation & editing, 15 free daily tools, plus built-in task management with Kanban boards, calendar views & analytics." />
        <meta name="keywords" content="AI content templates, AI image generator, AI image editor, free AI tools, blog generator, social media content, email marketing, task management, Kanban board, content calendar, productivity tools" />
        <link rel="canonical" href={`${siteUrl}/features`} />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/features`} />
        <meta property="og:title" content="Features - AI Content, Image Generation & Task Management | PeakDraft" />
        <meta property="og:description" content="25+ AI templates, image generation & editing, 15 free tools, plus powerful task management. Everything you need." />
        <meta property="og:image" content={`${siteUrl}/og-features.png`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PeakDraft Features - AI Content, Images & Task Management" />
        <meta name="twitter:description" content="25+ AI templates, image generation & editing, 15 free tools, plus powerful task management." />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(jsonLdFeatures)}
        </script>
      </Helmet>
      
    <main className="min-h-screen bg-background" role="main">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="h-3 w-3 mr-1" />
            Complete Feature Overview
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            Everything You Need to Create, Generate & Organize
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            25+ AI content templates, AI image generation & editing, 15 free daily tools, 
            and powerful task management — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')} className="group">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/pricing')}>
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* AI Templates Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30" id="templates">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-4">AI Content Templates</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">25+ Professional AI Writing Templates</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Generate any type of content with our specialized AI templates. Each template is optimized for its specific use case.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {aiTemplates.map((template, idx) => (
              <Card key={idx} className="p-6 hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] bg-card/50 backdrop-blur">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center flex-shrink-0`}>
                    <template.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{template.title}</h3>
                    <p className="text-muted-foreground mb-4">{template.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {template.features.map((feature, fIdx) => (
                        <Badge key={fIdx} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Image Generation Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8" id="image-generation">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-4 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20">AI Image Generation</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Create & Edit Images with AI</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Generate stunning visuals with our intelligent 2-step pipeline, then refine them with natural language editing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: ImagePlus,
                title: 'Intelligent 2-Step Generation',
                description: 'Your prompt is first refined by an AI design director into a professional creative brief, then used to generate the final image.',
                features: ['AI prompt refinement', 'Professional creative briefs', 'Composition & lighting optimization', 'Technical spec injection'],
                color: 'from-cyan-500 to-blue-600'
              },
              {
                icon: Edit3,
                title: 'Natural Language Editing',
                description: 'Edit any generated image by describing the changes you want. "Make the sky a sunset orange" or "Add snow to the mountains."',
                features: ['Text-based image editing', 'Preserves original composition', 'Iterative refinements', 'Before/after comparison'],
                color: 'from-violet-500 to-purple-600'
              },
              {
                icon: Eye,
                title: 'Lightbox Preview & Gallery',
                description: 'Full-size image preview with gallery navigation, metadata display, and quick actions for download, edit, and delete.',
                features: ['Full-size lightbox', 'Gallery navigation', 'Image metadata', 'Quick action buttons'],
                color: 'from-emerald-500 to-green-600'
              },
              {
                icon: Wand2,
                title: '8 Style Presets & Templates',
                description: 'Choose from style presets like minimal, vibrant, cinematic, or vintage. Use templates for social media, ads, posters, and more.',
                features: ['8 style presets', '6 template types', 'Brand-consistent output', 'Professional quality'],
                color: 'from-amber-500 to-orange-600'
              },
            ].map((feature, idx) => (
              <Card key={idx} className="p-6 hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] bg-card/50 backdrop-blur">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {feature.features.map((f, fIdx) => (
                        <Badge key={fIdx} variant="secondary" className="text-xs">{f}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Free AI Tools Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30" id="free-tools">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">Free Forever</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">15 Free AI Tools — No Credit Card Required</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Access powerful content generators completely free. 20 generations per day on free accounts, unlimited with any paid plan.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
            {[
              { icon: MessageSquare, title: 'ChatGPT Prompt Generator', desc: 'Create effective prompts for AI assistants with role definitions and constraints', color: 'from-green-500 to-emerald-600' },
              { icon: Hash, title: 'Hashtag Generator', desc: 'Discover trending hashtags to maximize social media reach', color: 'from-pink-500 to-rose-600' },
              { icon: FileText, title: 'Blog Intro Generator', desc: 'Hook readers with compelling opening paragraphs', color: 'from-blue-500 to-blue-600' },
              { icon: MessageSquare, title: 'Caption Generator', desc: 'Engaging captions for Instagram, Twitter, and more', color: 'from-green-500 to-teal-600' },
              { icon: Mail, title: 'Email Subject Lines', desc: 'Write subject lines that boost open rates', color: 'from-orange-500 to-amber-600' },
              { icon: Star, title: 'Product Descriptions', desc: 'Persuasive copy that drives purchases', color: 'from-purple-500 to-violet-600' },
              { icon: Search, title: 'SEO Meta Descriptions', desc: 'Optimized meta descriptions for better rankings', color: 'from-cyan-500 to-blue-600' },
              { icon: Target, title: 'CTA Generator', desc: 'Action-oriented calls-to-action that convert', color: 'from-rose-500 to-red-600' },
              { icon: TrendingUp, title: 'Headline Generator', desc: 'Attention-grabbing headlines with power words', color: 'from-amber-500 to-orange-600' },
              { icon: Sparkles, title: 'Slogan Generator', desc: 'Memorable brand taglines and slogans', color: 'from-indigo-500 to-blue-600' },
              { icon: Star, title: 'Testimonial Generator', desc: 'Authentic customer review templates', color: 'from-yellow-500 to-orange-600' },
              { icon: TrendingUp, title: 'Post Ideas Generator', desc: 'Fresh content ideas for any niche', color: 'from-lime-500 to-green-600' },
              { icon: Video, title: 'Video Prompt Generator', desc: 'Detailed prompts for AI video tools', color: 'from-red-500 to-rose-600' },
              { icon: Users, title: 'Bio Generator', desc: 'Professional bios for social profiles', color: 'from-teal-500 to-cyan-600' },
              { icon: CheckCircle, title: 'FAQ Generator', desc: 'Comprehensive FAQs for your business', color: 'from-sky-500 to-blue-600' },
            ].map((tool, idx) => (
              <Card key={idx} className="p-4 hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] bg-card/50 backdrop-blur">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0`}>
                    <tool.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground">{tool.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="max-w-3xl mx-auto p-6 bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10 border-emerald-500/20">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
                <Gift className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">20 Free Generations Per Day</h3>
                <p className="text-sm text-muted-foreground">
                  Every account gets 20 free AI generations daily across all 15 tools. Premium users enjoy unlimited access with no daily cap.
                </p>
              </div>
              <Button onClick={() => navigate('/auth')} className="shrink-0">
                Get Started Free
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Task Management Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8" id="task-management">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-4 bg-green-500/10 text-green-500 border-green-500/20">Task Management</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built-in Productivity Tools</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Organize your content creation workflow with powerful task management features. 
              Plan, track, and analyze your productivity all in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {taskFeatures.map((feature, idx) => (
              <Card key={idx} className="p-6 hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] bg-card/50 backdrop-blur">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {feature.benefits.slice(0, 4).map((benefit, bIdx) => (
                        <Badge key={bIdx} variant="secondary" className="text-xs">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Use case:</span> {feature.useCase}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-4">Platform Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Content Creators Choose Us</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Beyond templates and tasks, PeakDraft offers powerful platform features to streamline your workflow.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Clock, title: 'Content History', desc: 'Access all your previously generated content. Search, filter, and reuse your best work.' },
              { icon: Download, title: 'Multi-Format Export', desc: 'Export content as PDF, DOCX, TXT, or copy directly to clipboard.' },
              { icon: Globe, title: 'Multi-Language', desc: 'Generate content in 20+ languages with native-quality output.' },
              { icon: Shield, title: 'Enterprise Security', desc: 'Bank-level encryption, GDPR compliance, and zero data sharing.' },
              { icon: Users, title: 'Team Collaboration', desc: 'Invite team members, share templates, and collaborate in real-time.' },
              { icon: Layers, title: 'Custom Templates', desc: 'Create and save custom templates for your unique content needs.' },
              { icon: Bell, title: 'Smart Notifications', desc: 'Get reminders for deadlines, task updates, and content schedules.' },
              { icon: Search, title: 'Advanced Search', desc: 'Find any content or task instantly with powerful search filters.' },
            ].map((feature, idx) => (
              <Card key={idx} className="p-6 text-center hover:shadow-elegant transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <Card className="max-w-4xl mx-auto p-8 sm:p-12 text-center bg-gradient-to-br from-primary/10 via-primary-glow/5 to-accent/10 border-primary/20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Ready to Supercharge Your Content Creation?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join 50,000+ content creators who save hours every week with PeakDraft. 
              Start your free trial today - no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')} className="group">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>
                Contact Sales
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <PublicFooter />
    </main>
    </>
  );
}
