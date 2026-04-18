import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PublicNavbar } from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { SectionReveal } from '@/components/landing/SectionReveal';
import { ArrowRight, Hash, MessageSquare, PenTool, TrendingUp, Zap, CheckCircle, Instagram, Linkedin, Twitter, Facebook, BarChart3, Sparkles, Globe, Star, Shield, Clock, Users } from 'lucide-react';
import socialMediaHero from '@/assets/social-media-hero.jpg';
import socialMediaFeatures from '@/assets/social-media-features.jpg';

const siteUrl = 'https://peakdraft.vercel.app';

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "AI Social Media Content Generator - PeakDraft",
  "description": "Generate engaging social media posts, captions, hashtags, and more with AI. Create content for Instagram, LinkedIn, Twitter, Facebook and all platforms.",
  "url": `${siteUrl}/social-media`,
  "publisher": {
    "@type": "Organization",
    "name": "PeakDraft",
    "url": siteUrl
  }
};

const tools = [
  { icon: MessageSquare, title: 'Social Media Post Generator', description: 'Create engaging posts for any platform with AI. Tailor your tone, style, and message to captivate your audience.' },
  { icon: Hash, title: 'Hashtag Generator', description: 'Discover trending and relevant hashtags to boost your content visibility and reach the right audience.' },
  { icon: Linkedin, title: 'LinkedIn Post Generator', description: 'Craft professional LinkedIn content that builds thought leadership and drives meaningful engagement.' },
  { icon: PenTool, title: 'Ad Copy Generator', description: 'Write high-converting ad copy for Facebook Ads, Instagram Ads, Google Ads, and more.' },
  { icon: Sparkles, title: 'Post Ideas Generator', description: 'Never run out of content ideas. Get AI-powered suggestions tailored to your niche and audience.' },
  { icon: BarChart3, title: 'Content Strategy Planner', description: 'Plan your content calendar with AI suggestions for optimal posting times and content types.' },
];

const benefits = [
  'Generate posts for Instagram, LinkedIn, Twitter, Facebook & more',
  'AI-powered hashtag research and suggestions',
  'Write compelling ad copy that converts',
  'Create viral-worthy content ideas on demand',
  'Professional LinkedIn thought leadership posts',
  'SEO-optimized captions and descriptions',
  'Multi-language content generation',
  'Save hours of content creation time',
];

const platforms = [
  { icon: Instagram, name: 'Instagram', color: 'from-pink-500 to-purple-500' },
  { icon: Linkedin, name: 'LinkedIn', color: 'from-blue-600 to-blue-400' },
  { icon: Twitter, name: 'Twitter / X', color: 'from-sky-400 to-sky-300' },
  { icon: Facebook, name: 'Facebook', color: 'from-blue-700 to-blue-500' },
];

const stats = [
  { value: '10x', label: 'Faster Content Creation', icon: Zap },
  { value: '500+', label: 'Post Templates', icon: Star },
  { value: '50+', label: 'Languages Supported', icon: Globe },
  { value: '99%', label: 'User Satisfaction', icon: Users },
];

const howItWorks = [
  { step: '01', title: 'Choose Your Template', description: 'Pick from social posts, hashtags, ad copy, LinkedIn posts, and more.' },
  { step: '02', title: 'Describe Your Content', description: 'Tell the AI what you need — topic, tone, audience, and platform.' },
  { step: '03', title: 'Generate & Customize', description: 'Get AI-generated content instantly. Edit, refine, and make it yours.' },
  { step: '04', title: 'Publish & Grow', description: 'Copy your content and post it across all your social media channels.' },
];

export default function SocialMedia() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>AI Social Media Content Generator | Create Posts, Hashtags & Ads - PeakDraft</title>
        <meta name="description" content="Generate engaging social media posts, captions, hashtags, and ad copy with AI. Create content for Instagram, LinkedIn, Twitter, Facebook and all major platforms. Try PeakDraft free." />
        <meta name="keywords" content="social media generator, AI social media, hashtag generator, LinkedIn post generator, Instagram captions, ad copy generator, social media content, AI content creator" />
        <link rel="canonical" href={`${siteUrl}/social-media`} />
        <meta property="og:title" content="AI Social Media Content Generator - PeakDraft" />
        <meta property="og:description" content="Generate engaging social media posts, captions, hashtags, and ad copy with AI. Create content for all major platforms." />
        <meta property="og:url" content={`${siteUrl}/social-media`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${siteUrl}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Social Media Content Generator - PeakDraft" />
        <meta name="twitter:description" content="Generate engaging social media posts, captions, hashtags, and ad copy with AI." />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <PublicNavbar />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-20 lg:py-28">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-purple-900/15" />
            <div className="absolute top-1/3 left-1/4 w-64 h-64 sm:w-80 sm:h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-56 h-56 sm:w-72 sm:h-72 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="order-2 lg:order-1"
              >
                <Badge className="mb-4 sm:mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                  <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5" />
                  AI-Powered Social Media Tools
                </Badge>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 sm:mb-6">
                  Create{' '}
                  <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Viral Social Media
                  </span>{' '}
                  Content with AI
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-xl">
                  Generate engaging posts, captions, hashtags, and ad copy for every platform. 
                  Save hours and grow your audience with AI-powered content creation.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button size="lg" onClick={() => navigate('/auth')} className="gap-2 text-sm sm:text-base w-full sm:w-auto">
                    Start Creating Free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/free-tools')} className="text-sm sm:text-base w-full sm:w-auto">
                    Try Free Tools
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative order-1 lg:order-2"
              >
                <div className="relative max-w-sm sm:max-w-md lg:max-w-lg mx-auto rounded-2xl overflow-hidden border border-border/50 shadow-2xl shadow-primary/5">
                  <img
                    src={socialMediaHero}
                    alt="PeakDraft AI Social Media Content Generator Dashboard"
                    className="w-full h-auto"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <SectionReveal>
          <section className="py-12 sm:py-16 border-y border-border/40 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center p-3 sm:p-4"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* Platforms Section */}
        <SectionReveal>
          <section className="py-16 sm:py-20 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20">
                <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5" />
                Multi-Platform Support
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                Create Content for Every Platform
              </h2>
              <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto mb-8 sm:mb-12">
                One tool to rule them all. Generate optimized content tailored to each platform's unique requirements.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 max-w-3xl mx-auto">
                {platforms.map((platform, i) => (
                  <motion.div
                    key={platform.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="group hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                      <CardContent className="p-4 sm:p-6 text-center">
                        <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform`}>
                          <platform.icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <p className="font-semibold text-xs sm:text-sm">{platform.name}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* Tools/Features Section */}
        <SectionReveal>
          <section className="py-16 sm:py-20 lg:py-24 bg-muted/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10 sm:mb-16">
                <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5" />
                  AI-Powered Tools
                </Badge>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                  Everything You Need for Social Media Success
                </h2>
                <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
                  Powerful AI tools designed to supercharge your social media presence and engagement.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {tools.map((tool, i) => (
                  <motion.div
                    key={tool.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card className="h-full group hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                      <CardContent className="p-4 sm:p-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                          <tool.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">{tool.title}</h3>
                        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{tool.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* How It Works Section */}
        <SectionReveal>
          <section className="py-16 sm:py-20 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10 sm:mb-16">
                <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5" />
                  Simple & Fast
                </Badge>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                  How It Works
                </h2>
                <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
                  Create professional social media content in four simple steps.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {howItWorks.map((item, i) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative"
                  >
                    <Card className="h-full border-border/50 hover:border-primary/30 transition-colors">
                      <CardContent className="p-4 sm:p-6">
                        <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary/30 to-purple-400/30 bg-clip-text text-transparent">
                          {item.step}
                        </span>
                        <h3 className="text-base sm:text-lg font-semibold mt-2 sm:mt-3 mb-1.5 sm:mb-2">{item.title}</h3>
                        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{item.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* Benefits Section with Image */}
        <SectionReveal>
          <section className="py-16 sm:py-20 lg:py-24 bg-muted/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="relative max-w-xs sm:max-w-sm mx-auto lg:mx-0 rounded-2xl overflow-hidden border border-border/50 shadow-xl">
                  <img
                    src={socialMediaFeatures}
                    alt="AI-powered social media content creation"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
                <div>
                  <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20">
                    <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5" />
                    Why PeakDraft
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                    What You Get with PeakDraft
                  </h2>
                  <div className="space-y-2.5 sm:space-y-3">
                    {benefits.map((benefit, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-start gap-2.5 sm:gap-3"
                      >
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground text-sm sm:text-base">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>
                  <Button size="lg" className="mt-6 sm:mt-8 gap-2 w-full sm:w-auto" onClick={() => navigate('/auth')}>
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* Trusted Section */}
        <SectionReveal>
          <section className="py-16 sm:py-20 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20">
                <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5" />
                Trusted by Creators
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                Built for Marketers & Content Creators
              </h2>
              <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto mb-8 sm:mb-12">
                Whether you're a solo creator, agency, or enterprise team — PeakDraft adapts to your content workflow.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
                {[
                  { title: 'Solo Creators', description: 'Save time crafting posts. Focus on growing your brand while AI handles the writing.', icon: Star },
                  { title: 'Marketing Teams', description: 'Collaborate on content campaigns with consistent brand voice across all channels.', icon: Users },
                  { title: 'Agencies', description: 'Scale content production for multiple clients without sacrificing quality.', icon: TrendingUp },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="h-full hover:border-primary/30 transition-colors">
                      <CardContent className="p-4 sm:p-6 text-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-base sm:text-lg mb-1.5 sm:mb-2">{item.title}</h3>
                        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{item.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* CTA Section */}
        <SectionReveal>
          <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-primary/10 via-background to-purple-900/10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                Ready to Transform Your Social Media?
              </h2>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8">
                Join thousands of creators and marketers using PeakDraft to create engaging social media content in seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button size="lg" onClick={() => navigate('/auth')} className="gap-2 text-sm sm:text-base w-full sm:w-auto">
                  Start Creating for Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/pricing')} className="text-sm sm:text-base w-full sm:w-auto">
                  View Pricing
                </Button>
              </div>
            </div>
          </section>
        </SectionReveal>
      </main>

      <PublicFooter />
    </>
  );
}