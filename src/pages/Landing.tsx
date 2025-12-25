import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Shield, TrendingUp, Users, Star, ArrowRight, CheckCircle, PenTool, Check, X, Mail, Phone, MapPin, LayoutGrid, Calendar, BarChart3, FileText, Hash, Video, Image, MessageSquare, Briefcase, RefreshCw, Columns2, Sliders } from 'lucide-react';
import featuresShowcase from '@/assets/features-showcase-new.jpg';
import workflowIllustration from '@/assets/workflow-illustration-new.jpg';
import abstractBg from '@/assets/abstract-bg.jpg';
import dashboardPreview from '@/assets/dashboard-preview.png';
import { useAuth } from '@/contexts/AuthContext';
import { useInView } from '@/hooks/useInView';
import { useParallax } from '@/hooks/useParallax';
import { PublicNavbar } from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
const comparisonFeatures = [
  { category: 'Content Generation', features: [
    { name: 'Words per month', basic: '10,000', pro: '50,000', enterprise: '200,000' },
    { name: 'All content templates', basic: true, pro: true, enterprise: true },
    { name: 'Export formats', basic: 'Basic', pro: 'Advanced', enterprise: 'All formats' },
  ]},
  { category: 'Support & Collaboration', features: [
    { name: 'Support level', basic: 'Basic', pro: 'Priority', enterprise: '24/7 Dedicated' },
    { name: 'Response time', basic: '48 hours', pro: '24 hours', enterprise: '1 hour' },
    { name: 'Team collaboration', basic: false, pro: true, enterprise: true },
    { name: 'User seats', basic: '1', pro: '5', enterprise: 'Unlimited' },
  ]},
  { category: 'Security & Compliance', features: [
    { name: 'Data encryption', basic: true, pro: true, enterprise: true },
    { name: 'SSO/SAML', basic: false, pro: false, enterprise: true },
    { name: 'Advanced security', basic: false, pro: false, enterprise: true },
    { name: 'Custom SLA', basic: false, pro: false, enterprise: true },
  ]},
];

const pricingPlans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    description: 'Perfect for individuals',
    features: [
      '50,000 words per month',
      'All content templates',
      'Basic support',
      'Export to multiple formats'
    ],
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    description: 'Ideal for professionals',
    features: [
      '100,000 words per month',
      'All content templates',
      'Priority support',
      'API access',
      'Team collaboration'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49.99,
    description: 'For large teams',
    features: [
      '200,000 words per month',
      'All content templates',
      '24/7 dedicated support',
      'Full API access',
      'White-label options'
    ],
    popular: false
  }
];

export default function Landing() {
  const navigate = useNavigate();
  const parallaxOffset = useParallax(0.3);
  const { ref: aboutRef, isInView: aboutInView } = useInView();
  const { ref: featuresRef, isInView: featuresInView } = useInView();
  const { ref: workflowRef, isInView: workflowInView } = useInView();
  const { ref: statsRef, isInView: statsInView } = useInView();
  const { ref: testimonialRef, isInView: testimonialInView } = useInView();
  const { ref: ctaRef, isInView: ctaInView } = useInView();
  const { ref: newFeaturesRef, isInView: newFeaturesInView } = useInView();
  const { ref: templatesRef, isInView: templatesInView } = useInView();
  const { user, loading, isSignedIn } = useAuth();

  // Handle OAuth callback and redirect authenticated users to dashboard
  useEffect(() => {
    // Check if this is an OAuth callback (has access_token in hash)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hasAccessToken = hashParams.has('access_token');
    
    if (hasAccessToken) {
      // Clear the hash to clean up the URL
      window.history.replaceState(null, '', window.location.pathname);
      // Force a small delay to let Supabase process the tokens
      setTimeout(() => {
        navigate('/app', { replace: true });
      }, 100);
      return;
    }
    
    if (!loading && isSignedIn) {
      navigate('/app', { replace: true });
    }
  }, [user, loading, isSignedIn, navigate]);

  const handleSelectPlan = () => {
    if (user) {
      navigate('/app/pricing');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Hero Section with 3D Animation */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Gradient Overlays with Parallax */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary-glow/10 to-accent/20 animate-gradient-shift"
          style={{ transform: `translateY(${parallaxOffset * 0.5}px)` }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/10 to-transparent animate-gradient-rotate"
          style={{ transform: `translateY(${parallaxOffset * 0.3}px)` }}
        />
        <div 
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.15),transparent_60%)] animate-gradient-pulse"
          style={{ transform: `translateY(${parallaxOffset * 0.2}px)` }}
        />
        
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-medium">AI-Powered Content Generation</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 animate-fade-in bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent leading-tight">
                AI Content Generator
                <br />
                & Task Manager
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 animate-fade-in">
                Create professional blog posts, social media content, emails & ad copy with 14+ AI templates. 
                Organize your workflow with built-in task management, Kanban boards & analytics.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start animate-fade-in">
                <Button size="lg" onClick={() => navigate('/auth')} className="group w-full sm:w-auto">
                  Start Writing Now
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto">
                  Learn More
                </Button>
              </div>
            </div>

            {/* Right Column - Dashboard Preview with Browser Chrome */}
            <div className="relative animate-fade-in animate-float drop-shadow-[0_10px_30px_rgba(139,92,246,0.2)] sm:drop-shadow-[0_20px_50px_rgba(139,92,246,0.3)]">
              {/* Browser Chrome Frame */}
              <div className="bg-muted/80 backdrop-blur-sm rounded-t-lg sm:rounded-t-xl border border-border/50 px-2 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3">
                {/* Traffic Lights */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500/80"></div>
                </div>
                {/* URL Bar */}
                <div className="flex-1 bg-background/50 rounded-md px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-muted-foreground font-mono truncate">
                  peakdraft.app/dashboard
                </div>
              </div>
              {/* Browser Content */}
              <div className="bg-background/30 backdrop-blur-sm rounded-b-lg sm:rounded-b-xl border border-t-0 border-border/50 overflow-hidden">
                <img 
                  src={dashboardPreview} 
                  alt="PeakDraft Dashboard - Create blog posts, social media content, emails and ad copy with AI"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-12 sm:py-16 bg-muted/30" aria-label="Platform Statistics">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { value: '50K+', label: 'Active Content Creators' },
              { value: '14+', label: 'AI Writing Templates' },
              { value: '10M+', label: 'Words Generated' },
              { value: '4.9/5', label: 'User Satisfaction' },
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className={`text-center scroll-animate ${
                  statsInView ? 'animate-fade-up' : ''
                } animation-delay-${(idx + 1) * 100}`}
              >
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: Task Management Feature Section */}
      <section ref={newFeaturesRef} id="task-management" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8" aria-label="Task Management Features">
        <div className="container mx-auto">
          <div className={`max-w-3xl mx-auto text-center mb-12 sm:mb-16 scroll-animate ${newFeaturesInView ? 'animate-fade-up' : ''}`}>
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">New Feature</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built-in Task Management</h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Organize your content workflow with powerful task management tools. Kanban boards, calendar views, and detailed analytics to boost your productivity.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {[
              { icon: LayoutGrid, title: 'Kanban Board', desc: 'Drag-and-drop task organization with customizable columns for your workflow' },
              { icon: Calendar, title: 'Calendar View', desc: 'Schedule content and deadlines with an intuitive calendar interface' },
              { icon: BarChart3, title: 'Task Analytics', desc: 'Track productivity metrics and completion rates with detailed charts' },
              { icon: CheckCircle, title: 'Subtasks & Priorities', desc: 'Break down tasks into subtasks and set priority levels for better focus' },
            ].map((feature, idx) => (
              <Card 
                key={idx} 
                className={`p-6 text-center hover:shadow-elegant transition-all duration-300 hover:scale-105 bg-card/50 backdrop-blur scroll-animate ${
                  newFeaturesInView ? 'animate-fade-in-scale' : ''
                } animation-delay-${(idx + 1) * 100}`}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: Templates Showcase Section */}
      <section ref={templatesRef} id="templates" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30" aria-label="AI Content Templates">
        <div className="container mx-auto">
          <div className={`max-w-3xl mx-auto text-center mb-12 sm:mb-16 scroll-animate ${templatesInView ? 'animate-fade-up' : ''}`}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">14+ AI Content Templates</h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Professional templates for every content need. From blog posts to video scripts, generate high-quality content for any platform.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4 max-w-6xl mx-auto mb-8">
            {[
              { icon: FileText, title: 'Blog Posts', color: 'from-blue-500 to-blue-600' },
              { icon: MessageSquare, title: 'Social Media', color: 'from-pink-500 to-rose-600' },
              { icon: Mail, title: 'Emails', color: 'from-violet-500 to-purple-600' },
              { icon: Zap, title: 'Ad Copy', color: 'from-orange-500 to-amber-600' },
              { icon: Briefcase, title: 'CV/Resume', color: 'from-teal-500 to-cyan-600' },
              { icon: Hash, title: 'Hashtags', color: 'from-indigo-500 to-blue-600' },
              { icon: Video, title: 'Video Scripts', color: 'from-red-500 to-rose-600' },
            ].map((template, idx) => (
              <Card 
                key={idx} 
                className={`p-4 text-center hover:shadow-elegant transition-all duration-300 hover:scale-105 bg-card/50 backdrop-blur scroll-animate ${
                  templatesInView ? 'animate-fade-in-scale' : ''
                } animation-delay-${(idx + 1) * 50}`}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center mx-auto mb-2`}>
                  <template.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold">{template.title}</h3>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4 max-w-6xl mx-auto">
            {[
              { icon: PenTool, title: 'Letters', color: 'from-emerald-500 to-green-600' },
              { icon: Star, title: 'Product Desc', color: 'from-yellow-500 to-orange-600' },
              { icon: Sparkles, title: 'AI Humanizer', color: 'from-fuchsia-500 to-pink-600', badge: 'Advanced' },
              { icon: Image, title: 'Image Prompts', color: 'from-cyan-500 to-blue-600' },
              { icon: MessageSquare, title: 'ChatGPT', color: 'from-green-500 to-emerald-600' },
              { icon: TrendingUp, title: 'Post Ideas', color: 'from-purple-500 to-violet-600' },
              { icon: Video, title: 'Video Prompts', color: 'from-rose-500 to-red-600' },
            ].map((template, idx) => (
              <Card 
                key={idx} 
                className={`p-4 text-center hover:shadow-elegant transition-all duration-300 hover:scale-105 bg-card/50 backdrop-blur scroll-animate relative ${
                  templatesInView ? 'animate-fade-in-scale' : ''
                } animation-delay-${(idx + 1) * 50 + 350}`}
              >
                {'badge' in template && (
                  <Badge className="absolute -top-2 -right-2 text-[10px] bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white border-0">
                    {template.badge}
                  </Badge>
                )}
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center mx-auto mb-2`}>
                  <template.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold">{template.title}</h3>
              </Card>
            ))}
          </div>

          {/* NEW: Advanced AI Humanizer Feature Highlight */}
          <div className={`mt-12 max-w-4xl mx-auto scroll-animate ${templatesInView ? 'animate-fade-up' : ''}`}>
            <Card className="p-6 sm:p-8 bg-gradient-to-br from-fuchsia-500/10 via-pink-500/5 to-purple-500/10 border-fuchsia-500/20">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                    <h3 className="text-xl sm:text-2xl font-bold">Advanced AI Text Humanizer</h3>
                    <Badge className="bg-fuchsia-500 text-white border-0">New</Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Transform AI-generated content into natural, human-like text with our most advanced humanization engine.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 flex items-center justify-center">
                        <Columns2 className="h-4 w-4 text-fuchsia-500" />
                      </div>
                      <span className="text-sm font-medium">Side-by-Side Comparison</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 flex items-center justify-center">
                        <Sliders className="h-4 w-4 text-fuchsia-500" />
                      </div>
                      <span className="text-sm font-medium">Adjustable Intensity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 flex items-center justify-center">
                        <RefreshCw className="h-4 w-4 text-fuchsia-500" />
                      </div>
                      <span className="text-sm font-medium">Quick Regenerate</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} id="about" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8" aria-label="About PeakDraft">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16">
            {/* Left Column - Image with Parallax */}
            <div 
              className={`order-2 lg:order-1 scroll-animate ${aboutInView ? 'animate-slide-in-left' : ''}`}
              style={{ transform: `translateY(${parallaxOffset * -0.1}px)` }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={featuresShowcase} 
                  alt="PeakDraft content generation features and templates showcase" 
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Right Column - Text */}
            <div className={`order-1 lg:order-2 text-center lg:text-left scroll-animate ${aboutInView ? 'animate-slide-in-right' : ''}`}>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Content Creators Choose PeakDraft</h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-8">
                The ultimate AI writing assistant combining cutting-edge language models with intuitive task management. 
                Create blog posts, marketing copy, social media content, and more - all organized in one powerful platform.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {[
              { icon: Sparkles, title: 'Advanced AI Writing', desc: 'Powered by state-of-the-art language models for human-like, SEO-optimized content generation.' },
              { icon: Zap, title: 'Lightning Fast Generation', desc: 'Create professional blog posts, emails, and ad copy in seconds. Save hours on content creation.' },
              { icon: Shield, title: 'Secure & Enterprise-Ready', desc: 'Bank-level encryption protects your data. GDPR compliant with no data sharing.' },
              { icon: TrendingUp, title: 'Built-in Productivity Tools', desc: 'Task management, analytics, and content history keep your workflow organized and efficient.' },
            ].map((feature, idx) => (
              <Card 
                key={idx} 
                className={`p-6 bg-card/50 backdrop-blur border-border/50 hover:shadow-elegant transition-all duration-300 hover:scale-105 scroll-animate ${
                  aboutInView ? 'animate-fade-in-scale' : ''
                } animation-delay-${(idx + 1) * 100}`}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={featuresRef}
        id="features" 
        className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 relative overflow-hidden"
        aria-label="AI Content Generation Features"
      >
        {/* Animated Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 via-transparent to-primary-glow/5 animate-gradient-shift" />
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 via-transparent to-primary/5 animate-gradient-rotate opacity-60" />
        {/* Background Pattern with Parallax */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{ transform: `translateY(${parallaxOffset * 0.4}px)` }}
        >
          <img src={abstractBg} alt="" className="w-full h-full object-cover" aria-hidden="true" />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className={`max-w-3xl mx-auto text-center mb-12 sm:mb-16 scroll-animate ${featuresInView ? 'animate-fade-up' : ''}`}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">AI Content Generation Features</h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Everything you need to create SEO-optimized, engaging content - powered by advanced AI technology.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {[
              { icon: PenTool, title: 'SEO Blog Posts', desc: 'Create search engine optimized blog content that ranks and drives traffic' },
              { icon: Sparkles, title: 'Social Media Content', desc: 'Generate viral-worthy posts for Instagram, Twitter, LinkedIn & more' },
              { icon: Zap, title: 'High-Converting Ad Copy', desc: 'Create Facebook, Google, and display ads that convert' },
              { icon: Users, title: 'Email Marketing', desc: 'Write persuasive newsletters and email sequences that engage' },
              { icon: TrendingUp, title: 'Product Descriptions', desc: 'eCommerce copy that sells products and boosts conversions' },
              { icon: Star, title: 'Video Scripts & More', desc: 'YouTube scripts, letters, CVs, and professional documents' },
            ].map((feature, idx) => (
              <Card 
                key={idx} 
                className={`p-6 text-center hover:shadow-elegant transition-all duration-300 hover:scale-105 bg-card/50 backdrop-blur scroll-animate ${
                  featuresInView ? 'animate-fade-in-scale' : ''
                } animation-delay-${(idx + 1) * 100}`}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section ref={workflowRef} className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className={`max-w-3xl mx-auto text-center mb-12 sm:mb-16 scroll-animate ${workflowInView ? 'animate-fade-up' : ''}`}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Get started in three simple steps
            </p>
          </div>

          {/* Workflow Illustration with Parallax */}
          <div 
            className={`max-w-4xl mx-auto mb-12 scroll-animate ${workflowInView ? 'animate-fade-in-scale' : ''}`}
            style={{ transform: `translateY(${parallaxOffset * -0.15}px)` }}
          >
            <img 
              src={workflowIllustration} 
              alt="PeakDraft workflow process" 
              className="w-full h-auto rounded-2xl shadow-xl"
            />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Choose Template', desc: 'Select from our library of content templates' },
              { step: '02', title: 'Enter Details', desc: 'Provide your topic and key information' },
              { step: '03', title: 'Generate & Edit', desc: 'Get AI-generated content and refine as needed' },
            ].map((item, idx) => (
              <div 
                key={idx} 
                className={`relative scroll-animate ${
                  workflowInView ? 'animate-fade-up' : ''
                } animation-delay-${(idx + 1) * 100}`}
              >
                <div className="text-center">
                  <div className="text-5xl sm:text-6xl font-bold text-primary/20 mb-4">{item.step}</div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{item.desc}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Choose the plan that fits your needs. All plans include a 7-day free trial.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative p-4 sm:p-6 hover:shadow-elegant transition-all duration-300 ${
                  plan.popular ? 'border-primary shadow-glow sm:scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-primary text-primary-foreground px-3 sm:px-4 py-1 text-xs sm:text-sm">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl sm:text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground ml-2 text-sm sm:text-base">/month</span>
                  </div>
                </div>

                <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 sm:w-5 h-4 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={handleSelectPlan}
                >
                  {user ? 'Choose Plan' : 'Start Free Trial'}
                </Button>
              </Card>
            ))}
          </div>

          <div className="text-center mt-6 sm:mt-8 mb-12">
            <p className="text-xs sm:text-sm text-muted-foreground">
              All plans include a 7-day free trial. No credit card required.
            </p>
          </div>

          {/* Plan Comparison Table */}
          <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
            <div className="text-center space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold">Detailed Plan Comparison</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Compare all features across our plans to find the perfect fit
              </p>
            </div>

            {/* Desktop Table - Hidden on mobile */}
            <Card className="overflow-hidden hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-semibold min-w-[200px]">Features</th>
                      <th className="text-center p-4 font-semibold min-w-[120px]">Basic</th>
                      <th className="text-center p-4 font-semibold min-w-[120px]">
                        <div className="flex items-center justify-center gap-2">
                          Pro
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Popular</span>
                        </div>
                      </th>
                      <th className="text-center p-4 font-semibold min-w-[120px]">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((section, sectionIdx) => (
                      <React.Fragment key={`section-${sectionIdx}`}>
                        <tr className="bg-muted/30">
                          <td colSpan={4} className="p-4 font-semibold text-sm">
                            {section.category}
                          </td>
                        </tr>
                        {section.features.map((feature, featureIdx) => (
                          <tr 
                            key={`feature-${sectionIdx}-${featureIdx}`}
                            className="border-t border-border/50 hover:bg-muted/20 transition-colors"
                          >
                            <td className="p-4 text-sm">{feature.name}</td>
                            <td className="p-4 text-center">
                              {typeof feature.basic === 'boolean' ? (
                                feature.basic ? <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mx-auto" /> : <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50 mx-auto" />
                              ) : <span className="text-xs sm:text-sm">{feature.basic}</span>}
                            </td>
                            <td className="p-4 text-center bg-primary/5">
                              {typeof feature.pro === 'boolean' ? (
                                feature.pro ? <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mx-auto" /> : <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50 mx-auto" />
                              ) : <span className="text-xs sm:text-sm">{feature.pro}</span>}
                            </td>
                            <td className="p-4 text-center">
                              {typeof feature.enterprise === 'boolean' ? (
                                feature.enterprise ? <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mx-auto" /> : <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50 mx-auto" />
                              ) : <span className="text-xs sm:text-sm">{feature.enterprise}</span>}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Mobile Cards - Shown only on mobile */}
            <div className="md:hidden space-y-4">
              {(['basic', 'pro', 'enterprise'] as const).map((planKey) => (
                <Card key={planKey} className={`p-4 ${planKey === 'pro' ? 'border-primary' : ''}`}>
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 capitalize">
                    {planKey}
                    {planKey === 'pro' && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Popular</span>
                    )}
                  </h4>
                  {comparisonFeatures.map((section, sectionIdx) => (
                    <div key={sectionIdx} className="mb-4">
                      <h5 className="text-sm font-medium text-muted-foreground mb-2">{section.category}</h5>
                      <ul className="space-y-2">
                        {section.features.map((feature, featureIdx) => (
                          <li key={featureIdx} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{feature.name}</span>
                            <span className="font-medium">
                              {typeof feature[planKey] === 'boolean' ? (
                                feature[planKey] ? <Check className="h-4 w-4 text-primary" /> : <X className="h-4 w-4 text-muted-foreground/50" />
                              ) : <span className="text-xs sm:text-sm">{feature[planKey]}</span>}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </Card>
              ))}
            </div>

            {/* Additional Info */}
            <Card className="p-4 sm:p-6 bg-muted/30">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
                <div>
                  <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">30-Day Money Back</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Not satisfied? Get a full refund within 30 days, no questions asked.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Cancel Anytime</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    No long-term contracts. Cancel your subscription at any time.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Need Help Choosing?</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    <a href="/contact" className="text-primary hover:underline">Contact us</a> and we'll help you find the right plan.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section 
        ref={testimonialRef}
        id="testimonials" 
        className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30"
      >
        <div className="container mx-auto">
          <div className={`max-w-3xl mx-auto text-center mb-12 sm:mb-16 scroll-animate ${testimonialInView ? 'animate-fade-up' : ''}`}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Loved by Content Creators</h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              See what our users have to say about PeakDraft
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {[
              { name: 'Sarah Johnson', role: 'Content Marketing Manager', text: 'PeakDraft has transformed how I create content. Blog posts that took hours now take minutes. The task management feature keeps my team organized!' },
              { name: 'Michael Chen', role: 'Professional Blogger', text: 'The AI-generated blog posts are SEO-optimized and engaging. I\'ve doubled my organic traffic since using PeakDraft.' },
              { name: 'Emily Rodriguez', role: 'Social Media Manager', text: 'Managing content for multiple clients is effortless now. The 14+ templates cover everything from Instagram captions to email newsletters.' },
            ].map((testimonial, idx) => (
              <Card 
                key={idx} 
                className={`p-6 bg-card/50 backdrop-blur hover:shadow-elegant transition-all duration-300 scroll-animate ${
                  testimonialInView ? 'animate-fade-in-scale' : ''
                } animation-delay-${(idx + 1) * 100}`}
              >
                <div className="flex gap-1 mb-4" aria-label="5 star rating">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">"{testimonial.text}"</p>
                <div>
                  <div className="text-base sm:text-lg font-bold">{testimonial.name}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Get in Touch</h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Have questions? We're here to help. Reach out to our team.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-6 sm:mb-8">
            <Card className="p-4 sm:p-6 text-center hover:shadow-elegant transition-all cursor-pointer" onClick={() => window.location.href = 'mailto:nanbondev@gmail.com'}>
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Mail className="h-5 sm:h-6 w-5 sm:w-6 text-primary" />
              </div>
              <h3 className="text-sm sm:text-base font-bold mb-1 sm:mb-2">Email Us</h3>
              <p className="text-xs sm:text-sm text-muted-foreground break-all">nanbondev@gmail.com</p>
            </Card>

            <Card className="p-4 sm:p-6 text-center hover:shadow-elegant transition-all cursor-pointer" onClick={() => window.location.href = 'tel:+2576892311'}>
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Phone className="h-5 sm:h-6 w-5 sm:w-6 text-primary" />
              </div>
              <h3 className="text-sm sm:text-base font-bold mb-1 sm:mb-2">Call Us</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">+2576892311</p>
            </Card>

            <Card className="p-4 sm:p-6 text-center hover:shadow-elegant transition-all">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <MapPin className="h-5 sm:h-6 w-5 sm:w-6 text-primary" />
              </div>
              <h3 className="text-sm sm:text-base font-bold mb-1 sm:mb-2">Visit Us</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Addis Ababa</p>
            </Card>
          </div>

          <div className="text-center">
            <Button size="lg" onClick={() => navigate('/contact')} className="w-full sm:w-auto">
              Send Us a Message
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8" aria-label="Get Started with PeakDraft">
        <div className="container mx-auto">
          <Card className={`max-w-4xl mx-auto p-6 sm:p-8 lg:p-12 text-center bg-gradient-to-br from-primary/10 via-primary-glow/5 to-accent/10 border-primary/20 scroll-animate ${
            ctaInView ? 'animate-fade-in-scale' : ''
          }`}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Start Creating Professional Content Today</h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8">
              Join 50,000+ marketers, bloggers, and content creators using PeakDraft to generate blog posts, social media content, emails, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')} className="group w-full sm:w-auto">
                Start Free Trial - No Credit Card
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto">
                View All Templates
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

// Add keyframe for float animation
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
`;
document.head.appendChild(style);
