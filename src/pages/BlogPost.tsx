import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PublicNavbar } from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Clock, User, Share2, Twitter, Facebook, Linkedin, Link as LinkIcon, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  category: string;
  tags: string[];
  author: string;
  published_at: string | null;
  reading_time: number | null;
  featured: boolean | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  og_image: string | null;
  created_at: string;
}

const siteUrl = 'https://peakdraft.netlify.app';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      setLoading(true);
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (data) {
        setPost(data);
        // Fetch related posts by category
        const { data: related } = await supabase
          .from('blog_posts')
          .select('id, title, slug, excerpt, featured_image, category, author, published_at, reading_time, tags, featured, created_at')
          .eq('status', 'published')
          .eq('category', data.category)
          .neq('id', data.id)
          .limit(3);
        if (related) setRelatedPosts(related);
      }
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const shareUrl = `${siteUrl}/blog/${slug}`;

  const handleShare = (platform: string) => {
    const title = encodeURIComponent(post?.title || '');
    const url = encodeURIComponent(shareUrl);
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };
    if (urls[platform]) window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied!');
  };

  if (loading) {
    return (
      <>
        <PublicNavbar />
        <main className="min-h-screen bg-background pt-20">
          <div className="container mx-auto max-w-4xl px-4 py-12">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-6 w-64 mb-8" />
            <Skeleton className="h-80 w-full mb-8 rounded-xl" />
            <div className="space-y-4">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <PublicNavbar />
        <main className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-6">This blog post doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/blog')}>Back to Blog</Button>
          </div>
        </main>
        <PublicFooter />
      </>
    );
  }

  const metaTitle = post.meta_title || post.title;
  const metaDescription = post.meta_description || post.excerpt;
  const ogImage = post.og_image || post.featured_image || `${siteUrl}/og-image.png`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "datePublished": post.published_at || post.created_at,
    "dateModified": post.published_at || post.created_at,
    "author": { "@type": "Person", "name": post.author },
    "publisher": {
      "@type": "Organization",
      "name": "PeakDraft",
      "logo": { "@type": "ImageObject", "url": `${siteUrl}/favicon.png` }
    },
    "image": ogImage,
    "url": shareUrl,
    "mainEntityOfPage": { "@type": "WebPage", "@id": shareUrl },
    "keywords": (post.meta_keywords || post.tags || []).join(', '),
    "wordCount": post.content.split(/\s+/).length,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${siteUrl}/blog` },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": shareUrl }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{metaTitle} | PeakDraft Blog</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={(post.meta_keywords || post.tags || []).join(', ')} />
        <link rel="canonical" href={shareUrl} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImage} />
        <meta property="article:published_time" content={post.published_at || post.created_at} />
        <meta property="article:author" content={post.author} />
        <meta property="article:section" content={post.category} />
        {(post.tags || []).map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      </Helmet>

      <PublicNavbar />
      <main className="min-h-screen bg-background pt-20">
        <article className="container mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
          </nav>

          {/* Back */}
          <Button variant="ghost" size="sm" onClick={() => navigate('/blog')} className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Button>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge variant="secondary">{post.category}</Badge>
              {post.featured && <Badge variant="outline">Featured</Badge>}
              {(post.tags || []).slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight">{post.title}</h1>
            <p className="text-lg text-muted-foreground mb-6">{post.excerpt}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><User className="h-4 w-4" />{post.author}</span>
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(post.published_at)}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{post.reading_time} min read</span>
            </div>
          </header>

          {/* Featured Image */}
          {post.featured_image && (
            <img src={post.featured_image} alt={post.title} loading="lazy"
              className="w-full h-64 sm:h-96 object-cover rounded-xl mb-8" />
          )}

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none mb-12">
            <ReactMarkdown
              components={{
                h2: ({ children }) => <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-semibold mt-8 mb-3 text-foreground">{children}</h3>,
                p: ({ children }) => <p className="text-muted-foreground leading-relaxed mb-4">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 space-y-2 text-muted-foreground mb-4">{children}</ol>,
                a: ({ href, children }) => <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-6">{children}</blockquote>
                ),
                img: ({ src, alt }) => (
                  <img src={src} alt={alt || ''} loading="lazy" className="w-full rounded-lg my-6" />
                ),
                code: ({ children }) => <code className="bg-muted px-1.5 py-0.5 rounded text-sm">{children}</code>,
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          <Separator className="my-8" />

          {/* Share */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-semibold flex items-center gap-2"><Share2 className="h-4 w-4" /> Share:</span>
            <Button size="sm" variant="outline" onClick={() => handleShare('twitter')} className="gap-2">
              <Twitter className="h-4 w-4" /> Twitter
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleShare('facebook')} className="gap-2">
              <Facebook className="h-4 w-4" /> Facebook
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleShare('linkedin')} className="gap-2">
              <Linkedin className="h-4 w-4" /> LinkedIn
            </Button>
            <Button size="sm" variant="outline" onClick={copyLink} className="gap-2">
              <LinkIcon className="h-4 w-4" /> Copy Link
            </Button>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map(rp => (
                  <Link key={rp.id} to={`/blog/${rp.slug}`}>
                    <Card className="group overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 h-full flex flex-col">
                      {rp.featured_image && (
                        <img src={rp.featured_image} alt={rp.title} loading="lazy"
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                      <div className="p-4 flex-1 flex flex-col">
                        <Badge variant="secondary" className="w-fit text-xs mb-2">{rp.category}</Badge>
                        <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">{rp.title}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-auto">
                          <Clock className="h-3 w-3" />{rp.reading_time} min read
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <Card className="mt-16 p-8 text-center bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-primary/20">
            <h2 className="text-2xl font-bold mb-3">Create Professional Content with AI</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Join thousands of creators using PeakDraft to generate blog posts, social media content, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')} className="gap-2">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/features')}>
                Explore Features
              </Button>
            </div>
          </Card>
        </article>
      </main>
      <PublicFooter />
    </>
  );
}
