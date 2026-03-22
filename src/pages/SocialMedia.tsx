import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PublicNavbar } from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { SectionReveal } from '@/components/landing/SectionReveal';
import { ArrowRight, Hash, MessageSquare, PenTool, TrendingUp, Zap, CheckCircle, Instagram, Linkedin, Twitter, Facebook, BarChart3, Sparkles, Globe } from 'lucide-react';
import socialMediaHero from '@/assets/social-media-hero.jpg';
import socialMediaFeatures from '@/assets/social-media-features.jpg';

const siteUrl = 'https://peakdraft.netlify.app';

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
  {
    icon: MessageSquare,
    title: 'Social Media Post Generator',
    description: 'Create engaging posts for any platform with AI. Tailor your tone, style, and message to captivate your audience.',
  },
  {
    icon: Hash,
    title: 'Hashtag Generator',
    description: 'Discover trending and relevant hashtags to boost your content visibility and reach the right audience.',
  },
  {
    icon: Linkedin,
    title: 'LinkedIn Post Generator',
    description: 'Craft professional LinkedIn content that builds thought leadership and drives meaningful engagement.',
  },
  {
    icon: PenTool,
    title: 'Ad Copy Generator',
    description: 'Write high-converting ad copy for Facebook Ads, Instagram Ads, Google Ads, and more.',
  },
  {
    icon: Sparkles,
    title: 'Post Ideas Generator',
    description: 'Never run out of content ideas. Get AI-powered suggestions tailored to your niche and audience.',
  },
  {
    icon: BarChart3,
    title: 'Content Strategy Planner',
    description: 'Plan your content calendar with AI suggestions for optimal posting times and content types.',
  },
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
  { value: '10x', label: 'Faster Content Creation' },
  { value: '500+', label: 'Post Templates' },
  { value: '50+', label: 'Languages Supported' },
  { value: '99%', label: 'User Satisfaction' },
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
        <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-purple-900/20" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                  <Zap className="w-3.5 h-3.5 mr-1.5" />
                  AI-Powered Social Media Tools
                </Badge>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  Create{' '}
                  <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Viral Social Media
                  </span>{' '}
                  Content with AI
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl">
                  Generate engaging posts, captions, hashtags, and ad copy for every platform. 
                  Save hours and grow your audience with AI-powered content creation.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" onClick={() => navigate('/auth')} className="gap-2 text-base">
                    Start Creating Free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/free-tools')} className="text-base">
                    Try Free Tools
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
                  <img
                    src={socialMediaHero}
                    alt="PeakDraft AI Social Media Content Generator Dashboard"
                    className="w-full h-auto"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <SectionReveal>
          <section className="py-16 border-y border-border/40 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* Platforms Section */}
        <SectionReveal>
          <section className="py-20 sm:py-28">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Globe className="w-3.5 h-3.5 mr-1.5" />
                Multi-Platform Support
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Create Content for Every Platform
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
                One tool to rule them all. Generate optimized content tailored to each social media platform's unique requirements.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                {platforms.map((platform, i) => (
                  <motion.div
                    key={platform.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="group hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                          <platform.icon className="w-7 h-7 text-white" />
                        </div>
                        <p className="font-semibold text-sm">{platform.name}</p>
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
          <section className="py-20 sm:py-28 bg-muted/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  AI-Powered Tools
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Everything You Need for Social Media Success
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Powerful AI tools designed to supercharge your social media presence and engagement.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool, i) => (
                  <motion.div
                    key={tool.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card className="h-full group hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                          <tool.icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{tool.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{tool.description}</p>
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
          <section className="py-20 sm:py-28">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-xl">
                  <img
                    src={socialMediaFeatures}
                    alt="AI-powered social media content creation"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
                <div>
                  <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                    <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                    Why PeakDraft
                  </Badge>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                    What You Get with PeakDraft
                  </h2>
                  <div className="space-y-3">
                    {benefits.map((benefit, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>
                  <Button size="lg" className="mt-8 gap-2" onClick={() => navigate('/auth')}>
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* CTA Section */}
        <SectionReveal>
          <section className="py-20 sm:py-28 bg-gradient-to-br from-primary/10 via-background to-purple-900/10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Transform Your Social Media?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Join thousands of creators and marketers using PeakDraft to create engaging social media content in seconds.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" onClick={() => navigate('/auth')} className="gap-2 text-base">
                  Start Creating for Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/pricing')} className="text-base">
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