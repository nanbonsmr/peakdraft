import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { PublicNavbar } from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Calendar, Clock, User, Sparkles, Zap, Target, TrendingUp, FileText, Lightbulb, Search, X, Mail, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const blogPosts = [
  {
    id: 'ai-image-generation-guide',
    title: 'AI Image Generation & Editing: The Complete Guide for Content Creators in 2026',
    excerpt: 'Learn how to create stunning visuals with AI image generation. From social media graphics to product mockups, discover how PeakDraft\'s 2-step pipeline and natural language editing revolutionize visual content creation.',
    content: `AI image generation has transformed visual content creation. With PeakDraft's intelligent 2-step pipeline, you can create professional-quality images in seconds — no design skills required.

Our AI Image Generation features include:
- **2-Step Intelligent Pipeline**: A text model first crafts an expert-level prompt, then the image model generates stunning visuals
- **Natural Language Editing**: Edit any generated image by describing changes in plain English
- **8 Template Types**: Social media posts, posters, advertisements, YouTube thumbnails, logos, banners, product mockups, and infographics
- **6 Style Presets**: Minimal, vibrant, professional, artistic, dark & moody, and retro
- **Lightbox Preview**: View your creations in full-screen with instant download

Whether you're creating YouTube thumbnails, Instagram posts, or product mockups, AI image generation saves hours of design work while producing results that rival professional designers.`,
    category: 'AI Image Generation',
    author: 'PeakDraft Team',
    date: '2026-02-27',
    readTime: '11 min read',
    image: '/favicon.png',
    featured: true
  },
  {
    id: 'free-ai-tools-guide',
    title: '15 Free AI Tools Every Content Creator Needs in 2026',
    excerpt: 'Discover PeakDraft\'s suite of 15 free AI-powered content generators — from hashtag and headline generators to SEO meta descriptions and FAQ creators. No credit card required.',
    content: `PeakDraft offers 15 free AI-powered content generators that cover every aspect of digital content creation. From social media captions to SEO meta descriptions, these tools help you produce professional content in seconds.

The complete free tool suite includes:
- **ChatGPT Prompt Generator**: Craft effective prompts for AI assistants
- **Hashtag Generator**: Generate trending hashtags for maximum reach
- **Blog Intro Generator**: Create engaging introductions that hook readers
- **Social Media Caption Generator**: Write scroll-stopping captions
- **Email Subject Line Generator**: Boost open rates with compelling subject lines
- **Product Description Generator**: Create persuasive product copy that sells
- **SEO Meta Description Generator**: Optimize your search engine presence
- **Call-to-Action Generator**: Drive conversions with powerful CTAs
- **Headline Generator**: Grab attention with magnetic headlines
- **Slogan Generator**: Create memorable brand taglines
- **Testimonial Generator**: Build authentic review templates
- **Post Ideas Generator**: Never run out of content ideas
- **Video Prompt Generator**: Create prompts for AI video generation
- **Bio Generator**: Write professional social media bios
- **FAQ Generator**: Build comprehensive FAQ sections

Free users get 20 generations per day. Premium users enjoy unlimited access.`,
    category: 'Free Tools',
    author: 'PeakDraft Team',
    date: '2026-02-27',
    readTime: '9 min read',
    image: '/favicon.png',
    featured: true
  },
  {
    id: 'ai-content-generation-templates-guide',
    title: 'Complete Guide to AI Content Generation Templates in 2026',
    excerpt: 'Discover how AI-powered templates can revolutionize your content creation workflow. Learn about blog generators, social media tools, and more.',
    content: `AI content generation has transformed how businesses and creators produce content. With PeakDraft's comprehensive template library, you can create professional content in minutes rather than hours.

Our templates cover every aspect of content creation:
- **Blog Post Generator**: Create SEO-optimized articles with proper structure and engaging headlines
- **Social Media Generator**: Craft platform-specific posts for Instagram, Twitter, LinkedIn, and Facebook
- **Email Generator**: Write compelling email campaigns that convert
- **Ad Copy Generator**: Create high-converting advertisement copy
- **Product Descriptions**: Generate unique, persuasive product descriptions

Each template is designed with best practices in mind, ensuring your content is not only well-written but also optimized for search engines and user engagement.`,
    category: 'Templates',
    author: 'PeakDraft Team',
    date: '2026-01-05',
    readTime: '8 min read',
    image: '/favicon.png',
    featured: true
  },
  {
    id: 'peakdraft-vs-competitors-comparison',
    title: 'PeakDraft vs Jasper vs Copy.ai vs Writesonic: Ultimate 2026 Comparison',
    excerpt: 'An honest comparison of the top AI writing tools. See how PeakDraft stacks up against Jasper, Copy.ai, Writesonic, and other popular alternatives.',
    content: `When choosing an AI writing assistant, it's important to understand what each platform offers. Here's how PeakDraft compares to the competition:

**PeakDraft Advantages:**
- More affordable pricing with generous word limits
- 14+ specialized templates for different content types
- Built-in task management and productivity features
- Free tools available without signup
- Humanize AI feature to make content more natural
- Multi-language support

**Jasper:**
- Higher price point ($49/month starting)
- Focus on marketing content
- Team collaboration features

**Copy.ai:**
- Free tier available but limited
- Good for short-form content
- Less customization options

**Writesonic:**
- Similar pricing to PeakDraft
- Good SEO features
- Limited template variety

PeakDraft offers the best value for content creators who need variety, affordability, and quality.`,
    category: 'Comparison',
    author: 'PeakDraft Team',
    date: '2026-01-03',
    readTime: '10 min read',
    image: '/favicon.png',
    featured: true
  },
  {
    id: 'about-peakdraft-story',
    title: 'About PeakDraft: Our Mission to Democratize Content Creation',
    excerpt: 'Learn about the story behind PeakDraft, our mission, values, and how we are making professional content creation accessible to everyone.',
    content: `PeakDraft was founded with a simple mission: make professional content creation accessible to everyone, regardless of their writing skills or budget.

**Our Story:**
We noticed that many small businesses, freelancers, and content creators struggled to produce consistent, high-quality content. Traditional copywriting services were expensive, and existing AI tools were often complicated or overpriced.

**Our Solution:**
We built PeakDraft to be different:
- **Affordable**: Fair pricing that works for individuals and businesses of all sizes
- **Easy to Use**: Intuitive interface that anyone can master in minutes
- **Comprehensive**: 14+ templates covering all content needs
- **Quality-Focused**: AI trained on best practices for each content type

**Our Values:**
- Accessibility: Everyone deserves great content
- Quality: Never compromise on output quality
- Innovation: Continuously improving our AI
- Support: Real humans available to help

Join thousands of creators who trust PeakDraft for their content needs.`,
    category: 'About',
    author: 'PeakDraft Team',
    date: '2026-01-01',
    readTime: '5 min read',
    image: '/favicon.png',
    featured: false
  },
  {
    id: 'how-to-write-seo-blog-posts',
    title: 'How to Write SEO-Optimized Blog Posts with AI in 2026',
    excerpt: 'Master the art of SEO content creation using AI tools. Learn proven strategies for ranking higher on Google with AI-generated content.',
    content: `Creating SEO-optimized content doesn't have to be complicated. With the right approach and AI tools like PeakDraft, you can create content that ranks.

**Key SEO Elements:**
1. **Keyword Research**: Identify target keywords before writing
2. **Title Optimization**: Include primary keywords in your title
3. **Header Structure**: Use H2, H3 tags with secondary keywords
4. **Meta Descriptions**: Write compelling descriptions under 160 characters
5. **Internal Linking**: Connect related content on your site
6. **Content Length**: Aim for 1,500+ words for comprehensive topics

**Using PeakDraft for SEO:**
Our Blog Generator automatically incorporates SEO best practices:
- Keyword integration throughout the content
- Proper header hierarchy
- Engaging introductions and conclusions
- Call-to-action suggestions

**Pro Tips:**
- Use our Humanize feature to make AI content more natural
- Add personal experiences and examples
- Update content regularly for freshness signals
- Include relevant images and alt text`,
    category: 'SEO',
    author: 'PeakDraft Team',
    date: '2025-12-28',
    readTime: '7 min read',
    image: '/favicon.png',
    featured: false
  },
  {
    id: 'social-media-content-strategy-2026',
    title: 'Ultimate Social Media Content Strategy Guide for 2026',
    excerpt: 'Build a winning social media presence with AI-powered content. Learn platform-specific strategies for Instagram, LinkedIn, Twitter, and more.',
    content: `Social media success in 2026 requires consistent, engaging content across multiple platforms. Here's how to create a winning strategy with AI assistance.

**Platform-Specific Strategies:**

**Instagram:**
- Focus on visual storytelling
- Use carousel posts for higher engagement
- Optimal posting: 1-2 times daily
- Use 20-30 relevant hashtags

**LinkedIn:**
- Professional, value-driven content
- Long-form posts perform well
- Engage with industry discussions
- Post during business hours

**Twitter/X:**
- Short, punchy content
- Threads for detailed topics
- Real-time engagement important
- Use relevant trending topics

**Facebook:**
- Community-building focus
- Video content preferred
- Groups drive engagement
- Share behind-the-scenes content

**How PeakDraft Helps:**
Our Social Media Generator creates platform-optimized content:
- Tone adjustments for each platform
- Hashtag suggestions
- Emoji integration
- Call-to-action variations`,
    category: 'Social Media',
    author: 'PeakDraft Team',
    date: '2025-12-25',
    readTime: '9 min read',
    image: '/favicon.png',
    featured: false
  },
  {
    id: 'email-marketing-ai-tips',
    title: '10 Email Marketing Tips: Boost Open Rates with AI-Written Emails',
    excerpt: 'Increase your email open rates and conversions with these proven tips. Learn how AI can help you write better email campaigns.',
    content: `Email marketing remains one of the highest ROI channels in digital marketing. Here's how to maximize your email performance with AI assistance.

**10 Tips for Better Emails:**

1. **Subject Lines Matter**: Use curiosity, urgency, or personalization
2. **Personalize Beyond Names**: Reference past purchases or behavior
3. **Keep It Scannable**: Use short paragraphs and bullet points
4. **Strong CTAs**: One clear call-to-action per email
5. **Mobile Optimization**: 60%+ of emails are read on mobile
6. **A/B Test Everything**: Subject lines, send times, content
7. **Segment Your List**: Different content for different audiences
8. **Timing Is Key**: Test to find your best send times
9. **Clean Your List**: Remove inactive subscribers regularly
10. **Add Value First**: Don't just sell, educate and entertain

**PeakDraft Email Generator Features:**
- Multiple email types (welcome, promotional, newsletter)
- Subject line suggestions
- Personalization placeholders
- Tone customization
- CTA optimization`,
    category: 'Email Marketing',
    author: 'PeakDraft Team',
    date: '2025-12-20',
    readTime: '6 min read',
    image: '/favicon.png',
    featured: false
  },
  {
    id: 'ai-writing-best-practices',
    title: 'AI Writing Best Practices: How to Get the Best Results from AI Tools',
    excerpt: 'Learn the secrets to getting high-quality output from AI writing tools. Master prompting techniques and editing strategies.',
    content: `Getting the best results from AI writing tools requires understanding how to work with them effectively. Here are proven strategies for success.

**Effective Prompting:**
1. **Be Specific**: Include details about tone, length, and audience
2. **Provide Context**: Background information improves output
3. **Use Examples**: Show the AI what you're looking for
4. **Iterate**: Refine your prompts based on results

**Editing AI Content:**
- Always review and fact-check
- Add personal voice and experiences
- Remove repetitive phrases
- Ensure brand consistency
- Use the Humanize feature for natural flow

**Common Mistakes to Avoid:**
- Publishing without editing
- Using generic prompts
- Ignoring factual accuracy
- Over-relying on AI for expertise topics

**PeakDraft Features That Help:**
- Tone selection for consistent voice
- Keyword integration for SEO
- Multiple output variations
- Export in various formats`,
    category: 'Tips & Tricks',
    author: 'PeakDraft Team',
    date: '2025-12-15',
    readTime: '5 min read',
    image: '/favicon.png',
    featured: false
  },
  {
    id: 'product-description-writing-guide',
    title: 'How to Write Product Descriptions That Sell: Complete Guide',
    excerpt: 'Create compelling product descriptions that convert browsers into buyers. Learn the psychology of persuasive product copy.',
    content: `Great product descriptions can dramatically increase your conversion rates. Here's how to write descriptions that sell.

**Key Elements of High-Converting Descriptions:**

1. **Lead with Benefits**: What problem does it solve?
2. **Use Sensory Language**: Help customers imagine using it
3. **Address Objections**: Anticipate and answer concerns
4. **Include Social Proof**: Reviews, ratings, testimonials
5. **Create Urgency**: Limited stock, special offers
6. **Optimize for SEO**: Include relevant keywords naturally

**Formula for Success:**
- Hook: Grab attention immediately
- Benefits: What's in it for them
- Features: Technical details that matter
- Proof: Why they should trust you
- CTA: Clear next step

**PeakDraft Product Description Generator:**
Our tool creates compelling descriptions by:
- Highlighting key benefits
- Using persuasive language
- Incorporating SEO keywords
- Matching your brand voice
- Creating multiple variations to test`,
    category: 'E-commerce',
    author: 'PeakDraft Team',
    date: '2025-12-10',
    readTime: '7 min read',
    image: '/favicon.png',
    featured: false
  }
];

const categories = [
  { name: 'All', icon: FileText },
  { name: 'AI Image Generation', icon: Sparkles },
  { name: 'Free Tools', icon: Zap },
  { name: 'Templates', icon: Sparkles },
  { name: 'Comparison', icon: Target },
  { name: 'SEO', icon: TrendingUp },
  { name: 'Social Media', icon: Zap },
  { name: 'Email Marketing', icon: Mail },
  { name: 'E-commerce', icon: ShoppingBag },
  { name: 'Tips & Tricks', icon: Lightbulb },
  { name: 'About', icon: FileText }
];

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const matchesSearch = searchQuery === '' || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "PeakDraft Blog",
    "description": "Expert insights on AI content generation, SEO tips, template guides, and digital marketing strategies.",
    "url": "https://peakdraft.netlify.app/blog",
    "publisher": {
      "@type": "Organization",
      "name": "PeakDraft",
      "logo": {
        "@type": "ImageObject",
        "url": "https://peakdraft.netlify.app/favicon.png"
      }
    },
    "blogPost": blogPosts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "datePublished": post.date,
      "author": {
        "@type": "Person",
        "name": post.author
      },
      "url": `https://peakdraft.netlify.app/blog/${post.id}`
    }))
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://peakdraft.netlify.app"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://peakdraft.netlify.app/blog"
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>PeakDraft Blog - AI Content Generation Tips, Templates & Guides</title>
        <meta name="description" content="Expert insights on AI content generation, SEO strategies, template guides, competitor comparisons, and digital marketing tips. Learn how to create better content with AI." />
        <meta name="keywords" content="AI writing blog, content generation tips, SEO guide, AI templates, PeakDraft vs Jasper, content marketing, social media strategy, email marketing, product descriptions, AI writing tools" />
        <link rel="canonical" href="https://peakdraft.netlify.app/blog" />
        
        {/* Open Graph */}
        <meta property="og:title" content="PeakDraft Blog - AI Content Generation Tips & Guides" />
        <meta property="og:description" content="Expert insights on AI content generation, SEO strategies, and digital marketing tips." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://peakdraft.netlify.app/blog" />
        <meta property="og:image" content="https://peakdraft.netlify.app/favicon.png" />
        <meta property="og:site_name" content="PeakDraft" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PeakDraft Blog - AI Content Generation Tips & Guides" />
        <meta name="twitter:description" content="Expert insights on AI content generation, SEO strategies, and digital marketing tips." />
        <meta name="twitter:image" content="https://peakdraft.netlify.app/favicon.png" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <PublicNavbar />
        
        <main className="pt-20">
          {/* Hero Section */}
          <section className="py-16 sm:py-24 bg-gradient-to-b from-primary/5 to-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-4xl mx-auto">
                <Badge variant="outline" className="mb-4 px-4 py-1">
                  <FileText className="w-3 h-3 mr-2" />
                  PeakDraft Blog
                </Badge>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  AI Content Creation Insights & Guides
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Expert tips, template guides, competitor comparisons, and strategies to help you create better content with AI.
                </p>
              </div>
            </div>
          </section>

          {/* Search and Categories */}
          <section className="py-8 border-b border-border/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              {/* Search Bar */}
              <div className="max-w-xl mx-auto mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 h-12 text-base rounded-full bg-muted/50 border-border/50 focus:border-primary"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Category Filters */}
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.name}
                    variant={selectedCategory === category.name ? "default" : "ghost"}
                    size="sm"
                    className="rounded-full text-xs sm:text-sm px-2.5 sm:px-3 h-8 sm:h-9"
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <category.icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline sm:inline">{category.name}</span>
                    <span className="xs:hidden sm:hidden">{category.name.split(' ')[0]}</span>
                  </Button>
                ))}
              </div>
              
              {/* Results count */}
              {(searchQuery || selectedCategory !== 'All') && (
                <div className="text-center mt-4 text-sm text-muted-foreground">
                  Found {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
                  {searchQuery && ` for "${searchQuery}"`}
                  {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                </div>
              )}
            </div>
          </section>

          {/* No Results */}
          {filteredPosts.length === 0 && (
            <section className="py-16">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="max-w-md mx-auto">
                  <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search or filter to find what you're looking for.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <section className="py-16">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-8">Featured Articles</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {featuredPosts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.id}`} className="block">
                    <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 overflow-hidden h-full cursor-pointer">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary" className="text-xs">
                            {post.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                            Featured
                          </Badge>
                        </div>
                        <CardTitle className="text-xl sm:text-2xl group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </CardTitle>
                        <CardDescription className="text-sm line-clamp-3 mt-2">
                          {post.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {post.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {post.readTime}
                          </span>
                        </div>
                        <span className="group/btn p-0 h-auto text-primary inline-flex items-center">
                          Read More
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
          )}

          {/* All Posts */}
          {regularPosts.length > 0 && (
            <section className="py-16 bg-muted/30">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-8">Latest Articles</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularPosts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.id}`} className="block">
                    <Card className="h-full group hover:shadow-lg transition-all duration-300 border-border/50 cursor-pointer">
                      <CardHeader className="pb-3">
                        <Badge variant="secondary" className="w-fit text-xs mb-2">
                          {post.category}
                        </Badge>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
          )}

          {/* CTA Section */}
          <section className="py-16 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="py-12 text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                    Ready to Create Amazing Content?
                  </h2>
                  <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Join thousands of creators using PeakDraft to generate high-quality content in minutes. Try our free tools or sign up for full access.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg">
                      <Link to="/auth">
                        Get Started Free
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link to="/free-tools">
                        Try Free Tools
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* FAQ Section for SEO */}
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
              <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What is AI content generation?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      AI content generation uses artificial intelligence to create written content such as blog posts, social media updates, emails, and marketing copy. Tools like PeakDraft use advanced language models to produce human-like text based on your inputs and requirements.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">How does PeakDraft compare to other AI writing tools?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      PeakDraft offers competitive pricing, 14+ specialized templates, built-in task management, and unique features like content humanization. Unlike competitors such as Jasper or Copy.ai, PeakDraft provides free tools and focuses on accessibility for creators of all levels.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Can AI-generated content rank on Google?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Yes, AI-generated content can rank on Google when it provides genuine value to users. Google focuses on content quality, not how it was created. PeakDraft's templates are designed with SEO best practices, and our Humanize feature helps make content more natural and engaging.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>

        <PublicFooter />
      </div>
    </>
  );
}
