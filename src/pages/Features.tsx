import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PenTool, Sparkles, Zap, Mail, Briefcase, Hash, Video, Image, 
  MessageSquare, TrendingUp, FileText, Star, LayoutGrid, Calendar, 
  BarChart3, CheckCircle, ArrowRight, Users, Shield, Clock, 
  Target, Layers, Repeat, Bell, Search, Download, Globe
} from 'lucide-react';

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
    description: 'Visual task management with drag-and-drop functionality. Organize tasks into customizable columns for different workflow stages.',
    benefits: ['Drag-and-drop interface', 'Custom column creation', 'Task prioritization', 'Progress visualization', 'Team-friendly layout']
  },
  {
    icon: Calendar,
    title: 'Calendar View',
    description: 'Schedule content creation and track deadlines with an intuitive calendar interface. Never miss a publishing date again.',
    benefits: ['Deadline tracking', 'Content scheduling', 'Month/week/day views', 'Due date reminders', 'Visual timeline']
  },
  {
    icon: BarChart3,
    title: 'Task Analytics',
    description: 'Track your productivity with detailed charts and metrics. Understand your work patterns and optimize your workflow.',
    benefits: ['Completion rate tracking', 'Productivity trends', 'Time analysis', 'Performance insights', 'Custom reports']
  },
  {
    icon: CheckCircle,
    title: 'Subtasks & Checklists',
    description: 'Break down complex projects into manageable subtasks. Track progress with detailed checklists.',
    benefits: ['Nested task structure', 'Progress tracking', 'Checklist templates', 'Bulk actions', 'Dependency management']
  },
  {
    icon: Target,
    title: 'Priority Management',
    description: 'Set priority levels to focus on what matters most. Filter and sort tasks by urgency and importance.',
    benefits: ['Priority levels', 'Smart filtering', 'Focus mode', 'Deadline alerts', 'Critical path view']
  },
  {
    icon: Repeat,
    title: 'Recurring Tasks',
    description: 'Automate repetitive content tasks with recurring schedules. Set it once and never forget again.',
    benefits: ['Custom recurrence', 'Flexible scheduling', 'Auto-generation', 'Pattern templates', 'Skip options']
  }
];

export default function Features() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/favicon.png" alt="PeakDraft Logo" className="w-9 h-9 rounded-lg" />
              <span className="text-lg sm:text-xl font-bold">PeakDraft</span>
            </div>

            <div className="hidden md:flex gap-6">
              <Button variant="ghost" onClick={() => navigate('/')}>Home</Button>
              <Button variant="ghost" onClick={() => navigate('/pricing')}>Pricing</Button>
              <Button variant="ghost" onClick={() => navigate('/contact')}>Contact</Button>
            </div>

            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => navigate('/auth')}>Sign In</Button>
              <Button onClick={() => navigate('/auth')}>Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="h-3 w-3 mr-1" />
            Complete Feature Overview
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            Everything You Need to Create & Organize Content
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            14+ AI-powered content templates combined with powerful task management tools. 
            From blog posts to video scripts, from Kanban boards to analytics - all in one platform.
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">14+ Professional AI Writing Templates</h2>
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {taskFeatures.map((feature, idx) => (
              <Card key={idx} className="p-6 hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] bg-card/50 backdrop-blur">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, bIdx) => (
                    <li key={bIdx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
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

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/favicon.png" alt="PeakDraft Logo" className="w-9 h-9 rounded-lg" />
              <span className="font-bold">PeakDraft</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 PeakDraft. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <button onClick={() => navigate('/privacy')} className="hover:text-primary transition-colors">Privacy</button>
              <button onClick={() => navigate('/terms')} className="hover:text-primary transition-colors">Terms</button>
              <button onClick={() => navigate('/contact')} className="hover:text-primary transition-colors">Contact</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
