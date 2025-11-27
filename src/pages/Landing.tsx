import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sparkles, Zap, Shield, TrendingUp, Users, Star, ArrowRight, CheckCircle, PenTool, Check, Mail, Phone, MapPin, Menu, X, LayoutGrid, Calendar, BarChart3, FileText, Hash, Video, Image, MessageSquare, Briefcase } from 'lucide-react';
import featuresShowcase from '@/assets/features-showcase-new.jpg';
import workflowIllustration from '@/assets/workflow-illustration-new.jpg';
import abstractBg from '@/assets/abstract-bg.jpg';
import { useAuth } from '@/contexts/AuthContext';
import Hero3DScene from '@/components/Hero3DScene';
import { useInView } from '@/hooks/useInView';
import { useParallax } from '@/hooks/useParallax';

const pricingPlans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    description: 'Perfect for individuals',
    features: [
      '10,000 words per month',
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
      '50,000 words per month',
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const parallaxOffset = useParallax(0.3);
  const { ref: aboutRef, isInView: aboutInView } = useInView();
  const { ref: featuresRef, isInView: featuresInView } = useInView();
  const { ref: workflowRef, isInView: workflowInView } = useInView();
  const { ref: statsRef, isInView: statsInView } = useInView();
  const { ref: testimonialRef, isInView: testimonialInView } = useInView();
  const { ref: ctaRef, isInView: ctaInView } = useInView();
  const { ref: newFeaturesRef, isInView: newFeaturesInView } = useInView();
  const { ref: templatesRef, isInView: templatesInView } = useInView();
  const { user } = useAuth();

  const handleSelectPlan = () => {
    if (user) {
      navigate('/app/pricing');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <PenTool className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold">QuickWrite AI</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-6">
              <Button variant="ghost" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                Features
              </Button>
              <Button variant="ghost" onClick={() => navigate('/pricing')}>
                Pricing
              </Button>
              <Button variant="ghost" onClick={() => navigate('/contact')}>
                Contact
              </Button>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex gap-4">
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-6 mt-8">
                  {/* Mobile Navigation Links */}
                  <div className="flex flex-col gap-4">
                    <Button 
                      variant="ghost" 
                      className="justify-start text-lg"
                      onClick={() => {
                        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                        setMobileMenuOpen(false);
                      }}
                    >
                      Features
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start text-lg"
                      onClick={() => {
                        navigate('/pricing');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Pricing
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start text-lg"
                      onClick={() => {
                        navigate('/contact');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Contact
                    </Button>
                  </div>

                  {/* Mobile Auth Buttons */}
                  <div className="flex flex-col gap-3 pt-6 border-t">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        navigate('/auth');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign In
                    </Button>
                    <Button 
                      className="w-full"
                      onClick={() => {
                        navigate('/auth');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Get Started
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

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

            {/* Right Column - 3D Scene */}
            <div className="relative animate-fade-in h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]">
              <Hero3DScene />
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
              { icon: Sparkles, title: 'Humanize', color: 'from-fuchsia-500 to-pink-600' },
              { icon: Image, title: 'Image Prompts', color: 'from-cyan-500 to-blue-600' },
              { icon: MessageSquare, title: 'ChatGPT', color: 'from-green-500 to-emerald-600' },
              { icon: TrendingUp, title: 'Post Ideas', color: 'from-purple-500 to-violet-600' },
              { icon: Video, title: 'Video Prompts', color: 'from-rose-500 to-red-600' },
            ].map((template, idx) => (
              <Card 
                key={idx} 
                className={`p-4 text-center hover:shadow-elegant transition-all duration-300 hover:scale-105 bg-card/50 backdrop-blur scroll-animate ${
                  templatesInView ? 'animate-fade-in-scale' : ''
                } animation-delay-${(idx + 1) * 50 + 350}`}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center mx-auto mb-2`}>
                  <template.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold">{template.title}</h3>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} id="about" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8" aria-label="About QuickWrite AI">
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
                  alt="QuickWrite AI content generation features and templates showcase" 
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Right Column - Text */}
            <div className={`order-1 lg:order-2 text-center lg:text-left scroll-animate ${aboutInView ? 'animate-slide-in-right' : ''}`}>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Content Creators Choose QuickWrite AI</h2>
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
              alt="QuickWrite AI workflow process" 
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

          <div className="text-center mt-6 sm:mt-8">
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              All plans include a 7-day free trial. No credit card required.
            </p>
            <Button variant="link" onClick={() => navigate('/pricing')}>
              View detailed comparison →
            </Button>
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
              See what our users have to say about QuickWrite AI
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {[
              { name: 'Sarah Johnson', role: 'Content Marketing Manager', text: 'QuickWrite AI has transformed how I create content. Blog posts that took hours now take minutes. The task management feature keeps my team organized!' },
              { name: 'Michael Chen', role: 'Professional Blogger', text: 'The AI-generated blog posts are SEO-optimized and engaging. I\'ve doubled my organic traffic since using QuickWrite AI.' },
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
            <Card className="p-4 sm:p-6 text-center hover:shadow-elegant transition-all cursor-pointer" onClick={() => window.location.href = 'mailto:support@quickwriteai.com'}>
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Mail className="h-5 sm:h-6 w-5 sm:w-6 text-primary" />
              </div>
              <h3 className="text-sm sm:text-base font-bold mb-1 sm:mb-2">Email Us</h3>
              <p className="text-xs sm:text-sm text-muted-foreground break-all">support@quickwriteai.com</p>
            </Card>

            <Card className="p-4 sm:p-6 text-center hover:shadow-elegant transition-all cursor-pointer" onClick={() => window.location.href = 'tel:+15551234567'}>
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Phone className="h-5 sm:h-6 w-5 sm:w-6 text-primary" />
              </div>
              <h3 className="text-sm sm:text-base font-bold mb-1 sm:mb-2">Call Us</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">+1 (555) 123-4567</p>
            </Card>

            <Card className="p-4 sm:p-6 text-center hover:shadow-elegant transition-all">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <MapPin className="h-5 sm:h-6 w-5 sm:w-6 text-primary" />
              </div>
              <h3 className="text-sm sm:text-base font-bold mb-1 sm:mb-2">Visit Us</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">123 AI Street, Tech City</p>
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
      <section ref={ctaRef} className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8" aria-label="Get Started with QuickWrite AI">
        <div className="container mx-auto">
          <Card className={`max-w-4xl mx-auto p-6 sm:p-8 lg:p-12 text-center bg-gradient-to-br from-primary/10 via-primary-glow/5 to-accent/10 border-primary/20 scroll-animate ${
            ctaInView ? 'animate-fade-in-scale' : ''
          }`}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Start Creating Professional Content Today</h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8">
              Join 50,000+ marketers, bloggers, and content creators using QuickWrite AI to generate blog posts, social media content, emails, and more.
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

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-muted/30" role="contentinfo">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="p-2 bg-gradient-primary rounded-lg">
                  <PenTool className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm sm:text-base font-bold">QuickWrite AI</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                AI content generator with 14+ templates and built-in task management. Create blog posts, social media content, emails & more.
              </p>
            </div>

            <nav aria-label="Product navigation">
              <h3 className="text-sm sm:text-base font-bold mb-3 sm:mb-4">Product</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">AI Content Features</a></li>
                <li><a href="#task-management" className="hover:text-primary transition-colors">Task Management</a></li>
                <li><a href="#templates" className="hover:text-primary transition-colors">14+ Templates</a></li>
                <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing Plans</Link></li>
                <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              </ul>
            </nav>

            <div>
              <h3 className="text-sm sm:text-base font-bold mb-3 sm:mb-4">Company</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li><a href="#about" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm sm:text-base font-bold mb-3 sm:mb-4">Legal</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 sm:pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              © 2024 QuickWrite AI. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="h-4 sm:h-5 w-4 sm:w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="h-4 sm:h-5 w-4 sm:w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="h-4 sm:h-5 w-4 sm:w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
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
