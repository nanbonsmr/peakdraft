import { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { PublicNavbar } from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Calendar, Clock, User, Search, X, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string | null;
  category: string;
  tags: string[];
  author: string;
  published_at: string | null;
  reading_time: number | null;
  featured: boolean | null;
  created_at: string;
}

const siteUrl = 'https://peakdraft.netlify.app';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, featured_image, category, tags, author, published_at, reading_time, featured, created_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (data) setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(posts.map(p => p.category));
    return ['All', ...Array.from(cats)];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [posts, searchQuery, selectedCategory]);

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "PeakDraft Blog",
    "description": "Expert insights on AI content generation, SEO tips, template guides, and digital marketing strategies.",
    "url": `${siteUrl}/blog`,
    "publisher": {
      "@type": "Organization",
      "name": "PeakDraft",
      "logo": { "@type": "ImageObject", "url": `${siteUrl}/favicon.png` }
    },
    "blogPost": posts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "datePublished": post.published_at || post.created_at,
      "author": { "@type": "Person", "name": post.author },
      "url": `${siteUrl}/blog/${post.slug}`
    }))
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <Helmet>
        <title>PeakDraft Blog - AI Content Generation Tips, Templates & Guides</title>
        <meta name="description" content="Expert insights on AI content generation, SEO strategies, social media tips, and digital marketing guides. Learn to create better content faster." />
        <meta name="keywords" content="AI content generation, AI writing, SEO tips, content marketing, social media strategy, blog writing" />
        <link rel="canonical" href={`${siteUrl}/blog`} />
        <meta property="og:title" content="PeakDraft Blog - AI Content Tips & Guides" />
        <meta property="og:description" content="Expert insights on AI content generation and digital marketing." />
        <meta property="og:url" content={`${siteUrl}/blog`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <PublicNavbar />
      <main className="min-h-screen bg-background pt-20">
        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-10 sm:mb-14">
              <Badge variant="secondary" className="mb-4">Blog</Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">PeakDraft Blog</h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Expert insights on AI content generation, SEO strategies, and digital marketing tips.
              </p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-3xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search articles..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              {categories.map(cat => (
                <Button key={cat} variant={selectedCategory === cat ? 'default' : 'outline'} size="sm"
                  onClick={() => setSelectedCategory(cat)} className="text-xs">{cat}</Button>
              ))}
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-5 space-y-3">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                <p className="text-muted-foreground">Try a different search or category.</p>
              </div>
            ) : (
              <>
                {/* Featured Posts */}
                {featuredPosts.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-primary rounded-full" /> Featured Articles
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                      {featuredPosts.slice(0, 2).map(post => (
                        <Link key={post.id} to={`/blog/${post.slug}`}>
                          <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                            {post.featured_image && (
                              <img src={post.featured_image} alt={post.title} loading="lazy"
                                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" />
                            )}
                            <div className="p-6">
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                                <Badge variant="outline" className="text-xs">Featured</Badge>
                              </div>
                              <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(post.published_at)}</span>
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.reading_time} min read</span>
                                <span className="flex items-center gap-1"><User className="h-3 w-3" />{post.author}</span>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Posts Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(featuredPosts.length > 0 ? regularPosts : filteredPosts).map(post => (
                    <Link key={post.id} to={`/blog/${post.slug}`}>
                      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                        {post.featured_image && (
                          <img src={post.featured_image} alt={post.title} loading="lazy"
                            className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
                        )}
                        <div className="p-5 flex-1 flex flex-col">
                          <Badge variant="secondary" className="w-fit text-xs mb-3">{post.category}</Badge>
                          <h3 className="font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{post.excerpt}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(post.published_at)}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.reading_time} min</span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
