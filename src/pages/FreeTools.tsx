import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { PublicNavbar } from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Bot, 
  Hash, 
  FileText, 
  MessageSquare, 
  Mail, 
  ShoppingBag, 
  Search, 
  MousePointerClick, 
  Type, 
  Megaphone, 
  Star, 
  Lightbulb, 
  Film, 
  User, 
  HelpCircle,
  Lock,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const tools = [
  {
    id: 'chatgpt',
    title: 'ChatGPT Prompt Generator',
    description: 'Create effective prompts for ChatGPT and AI assistants',
    icon: Bot,
    color: 'text-primary',
  },
  {
    id: 'hashtag',
    title: 'Hashtag Generator',
    description: 'Generate trending hashtags for social media posts',
    icon: Hash,
    color: 'text-pink-500',
  },
  {
    id: 'blogintro',
    title: 'Blog Intro Generator',
    description: 'Create engaging blog introductions that hook readers',
    icon: FileText,
    color: 'text-blue-500',
  },
  {
    id: 'caption',
    title: 'Social Media Caption Generator',
    description: 'Create engaging captions for your social media posts',
    icon: MessageSquare,
    color: 'text-green-500',
  },
  {
    id: 'email',
    title: 'Email Subject Line Generator',
    description: 'Write compelling email subject lines that get opened',
    icon: Mail,
    color: 'text-orange-500',
  },
  {
    id: 'product',
    title: 'Product Description Generator',
    description: 'Create persuasive product descriptions that sell',
    icon: ShoppingBag,
    color: 'text-purple-500',
  },
  {
    id: 'seo',
    title: 'SEO Meta Description Generator',
    description: 'Write optimized meta descriptions for better search rankings',
    icon: Search,
    color: 'text-cyan-500',
  },
  {
    id: 'cta',
    title: 'Call-to-Action Generator',
    description: 'Create compelling CTAs that drive conversions',
    icon: MousePointerClick,
    color: 'text-rose-500',
  },
  {
    id: 'headline',
    title: 'Headline Generator',
    description: 'Create attention-grabbing headlines that convert',
    icon: Type,
    color: 'text-amber-500',
  },
  {
    id: 'slogan',
    title: 'Slogan Generator',
    description: 'Generate memorable slogans and taglines for your brand',
    icon: Megaphone,
    color: 'text-indigo-500',
  },
  {
    id: 'testimonial',
    title: 'Testimonial Generator',
    description: 'Create authentic customer review templates',
    icon: Star,
    color: 'text-yellow-500',
  },
  {
    id: 'postideas',
    title: 'Post Ideas Generator',
    description: 'Generate creative content ideas for your social media',
    icon: Lightbulb,
    color: 'text-lime-500',
  },
  {
    id: 'videoprompt',
    title: 'Video Prompt Generator',
    description: 'Create detailed prompts for AI video generation',
    icon: Film,
    color: 'text-red-500',
  },
  {
    id: 'bio',
    title: 'Bio Generator',
    description: 'Write professional bios for social media profiles',
    icon: User,
    color: 'text-teal-500',
  },
  {
    id: 'faq',
    title: 'FAQ Generator',
    description: 'Generate frequently asked questions for your business',
    icon: HelpCircle,
    color: 'text-sky-500',
  },
];

// JSON-LD structured data for free tools
const freeToolsStructuredData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Free AI Content Generation Tools",
  "description": "Collection of 15 free AI-powered content generation tools including hashtag generator, headline generator, slogan generator, post ideas, video prompts, and more.",
  "numberOfItems": 15,
  "itemListElement": tools.map((tool, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "item": {
      "@type": "SoftwareApplication",
      "name": tool.title,
      "description": tool.description,
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  }))
};

export default function FreeTools() {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const handleToolClick = (toolId: string) => {
    if (isSignedIn) {
      // User is logged in, navigate directly to the tool
      navigate(`/app/free-ai-tools?tool=${toolId}`);
    } else {
      // User is not logged in, show login dialog
      setSelectedTool(toolId);
      setShowLoginDialog(true);
    }
  };

  const handleLogin = () => {
    // Store the intended tool in sessionStorage so we can redirect after login
    if (selectedTool) {
      sessionStorage.setItem('redirectAfterLogin', `/app/free-ai-tools?tool=${selectedTool}`);
    }
    navigate('/auth');
  };

  return (
    <>
      <Helmet>
        <title>Free AI Tools - Hashtag, Headline, Slogan, Video & Content Generators | PeakDraft</title>
        <meta name="description" content="Use 15 free AI tools: Hashtag Generator, Headline Generator, Slogan Generator, Post Ideas, Video Prompt, Bio Generator, FAQ Generator & more. Sign up for free!" />
        <meta name="keywords" content="free AI tools, free hashtag generator, free headline generator, free slogan generator, free post ideas generator, free video prompt generator, free bio generator, free FAQ generator, AI content tools" />
        <link rel="canonical" href="https://peakdraft.netlify.app/free-tools" />
        <meta name="robots" content="index, follow" />
        
        <meta property="og:title" content="15 Free AI Content Tools | PeakDraft" />
        <meta property="og:description" content="Generate hashtags, headlines, slogans, post ideas, video prompts, bios, FAQs & more with our free AI tools. 20 free generations daily." />
        <meta property="og:url" content="https://peakdraft.netlify.app/free-tools" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://peakdraft.netlify.app/og-image.png" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="15 Free AI Content Tools | PeakDraft" />
        <meta name="twitter:description" content="Free AI generators: Hashtags, Headlines, Slogans, Post Ideas, Video Prompts, Bios, FAQs & more. 20 free generations daily!" />
        <meta name="twitter:image" content="https://peakdraft.netlify.app/og-image.png" />
        
        <script type="application/ld+json">
          {JSON.stringify(freeToolsStructuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <PublicNavbar />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <div className="container mx-auto px-4 text-center">
              <Badge variant="secondary" className="mb-4">Free for All Users</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Free AI Content Tools
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                15 powerful AI generators for hashtags, headlines, slogans, and more. Sign in to access all tools in your dashboard.
              </p>
            </div>
          </section>

          {/* Tools Grid */}
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2 hover:border-primary/50 group h-full"
                      onClick={() => handleToolClick(tool.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-2">
                            <tool.icon className={`h-6 w-6 ${tool.color}`} />
                          </div>
                          {!isSignedIn && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <CardTitle className="flex items-center gap-2">
                          {tool.title}
                          <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </CardTitle>
                        <CardDescription>{tool.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          {!isSignedIn && (
            <section className="py-12 md:py-16 bg-muted/50">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Get Access to All AI Tools</h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  Sign up for free to access all 15 AI content generators plus 25+ premium AI templates and utility tools.
                </p>
                <Button size="lg" onClick={() => navigate('/auth')}>
                  Sign Up Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </section>
          )}
        </main>

        <PublicFooter />
      </div>

      {/* Login Required Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Sign In Required
            </DialogTitle>
            <DialogDescription>
              Please sign in or create an account to use this free AI tool. It's free and only takes a moment.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              By signing up, you'll get access to:
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>✓ All 15 free AI content generators</li>
              <li>✓ 25+ premium AI templates</li>
              <li>✓ Utility tools (Image Compressor, QR Generator, etc.)</li>
              <li>✓ Task management features</li>
              <li>✓ 5,000 free words per month</li>
            </ul>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowLoginDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogin}>
              Sign In / Sign Up
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
