import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, Search, FileText } from "lucide-react";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  featured_image: string | null;
  category: string;
  status: string;
  featured: boolean | null;
  reading_time: number | null;
  created_at: string;
}

export default function AdminBlog() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, featured_image, category, status, featured, reading_time, created_at')
      .order('created_at', { ascending: false });

    if (data && !error) setPosts(data);
    else toast.error('Failed to load blog posts');
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else { toast.success('Deleted'); fetchPosts(); }
  };

  const filteredPosts = posts.filter(p => {
    const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: posts.length,
    draft: posts.filter(p => p.status === 'draft').length,
    published: posts.filter(p => p.status === 'published').length,
    scheduled: posts.filter(p => p.status === 'scheduled').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" />
            Blog Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Create, edit, and manage blog posts</p>
        </div>
        <Button onClick={() => navigate('/admin/blog/new')} className="gap-2">
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['all', 'published', 'draft', 'scheduled'] as const).map(s => (
          <Card key={s} className={`p-4 cursor-pointer transition-all ${filterStatus === s ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
            onClick={() => setFilterStatus(s)}>
            <p className="text-xs text-muted-foreground capitalize">{s === 'all' ? 'Total' : s}</p>
            <p className="text-2xl font-bold">{statusCounts[s]}</p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search posts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Posts List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : filteredPosts.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No blog posts found</p>
            <Button className="mt-4" onClick={() => navigate('/admin/blog/new')}>Create your first post</Button>
          </Card>
        ) : (
          filteredPosts.map(post => (
            <Card key={post.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-muted/30 transition-all">
              {post.featured_image && (
                <img src={post.featured_image} alt={post.title} className="w-full sm:w-20 h-32 sm:h-14 object-cover rounded-lg shrink-0" loading="lazy" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold truncate">{post.title}</h3>
                  {post.featured && <Badge variant="secondary" className="text-[10px]">Featured</Badge>}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <Badge variant={post.status === 'published' ? 'default' : post.status === 'scheduled' ? 'secondary' : 'outline'} className="text-[10px]">
                    {post.status}
                  </Badge>
                  <span>{post.category}</span>
                  <span>{format(new Date(post.created_at), 'MMM dd, yyyy')}</span>
                  <span>{post.reading_time} min read</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {post.status === 'published' && (
                  <Button size="sm" variant="ghost" onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/blog/edit/${post.id}`)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(post.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
