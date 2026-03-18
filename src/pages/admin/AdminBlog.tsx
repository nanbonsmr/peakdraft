import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, Search, FileText, Calendar, Globe, Sparkles, Save, X, Image } from "lucide-react";
import { format } from "date-fns";

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
  status: string;
  published_at: string | null;
  scheduled_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  og_image: string | null;
  reading_time: number | null;
  featured: boolean | null;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  'General', 'AI Image Generation', 'Free Tools', 'Templates', 'Comparison',
  'SEO', 'Social Media', 'Email Marketing', 'E-commerce', 'Tips & Tricks', 'About', 'Tutorial'
];

const emptyPost: Partial<BlogPost> = {
  title: '', slug: '', excerpt: '', content: '', featured_image: '',
  category: 'General', tags: [], author: 'PeakDraft Team', status: 'draft',
  meta_title: '', meta_description: '', meta_keywords: [], og_image: '',
  reading_time: 5, featured: false, published_at: null, scheduled_at: null,
};

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && !error) setPosts(data);
    else toast.error('Failed to load blog posts');
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const calculateReadingTime = (content: string) =>
    Math.max(1, Math.ceil(content.split(/\s+/).length / 200));

  const openNewPost = () => {
    setEditingPost({ ...emptyPost });
    setTagsInput('');
    setKeywordsInput('');
    setIsDialogOpen(true);
  };

  const openEditPost = (post: BlogPost) => {
    setEditingPost({ ...post });
    setTagsInput((post.tags || []).join(', '));
    setKeywordsInput((post.meta_keywords || []).join(', '));
    setIsDialogOpen(true);
  };

  const handleSave = async (publishNow = false) => {
    if (!editingPost?.title || !editingPost?.slug) {
      toast.error('Title and slug are required');
      return;
    }
    setSaving(true);

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const meta_keywords = keywordsInput.split(',').map(k => k.trim()).filter(Boolean);
    const reading_time = calculateReadingTime(editingPost.content || '');

    const postData = {
      title: editingPost.title,
      slug: editingPost.slug,
      excerpt: editingPost.excerpt || '',
      content: editingPost.content || '',
      featured_image: editingPost.featured_image || null,
      category: editingPost.category || 'General',
      tags,
      author: editingPost.author || 'PeakDraft Team',
      status: publishNow ? 'published' : (editingPost.status || 'draft'),
      published_at: publishNow ? new Date().toISOString() : editingPost.published_at,
      scheduled_at: editingPost.scheduled_at || null,
      meta_title: editingPost.meta_title || editingPost.title,
      meta_description: editingPost.meta_description || editingPost.excerpt,
      meta_keywords,
      og_image: editingPost.og_image || editingPost.featured_image || null,
      reading_time,
      featured: editingPost.featured || false,
    };

    let error;
    if (editingPost.id) {
      ({ error } = await supabase.from('blog_posts').update(postData).eq('id', editingPost.id));
    } else {
      ({ error } = await supabase.from('blog_posts').insert(postData));
    }

    if (error) {
      toast.error('Failed to save: ' + error.message);
    } else {
      toast.success(publishNow ? 'Published!' : 'Saved!');
      setIsDialogOpen(false);
      setEditingPost(null);
      fetchPosts();
    }
    setSaving(false);
  };

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
        <Button onClick={openNewPost} className="gap-2">
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
        <Input placeholder="Search posts..." value={search} onChange={e => setSearch(e.target.value)}
          className="pl-10" />
      </div>

      {/* Posts List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : filteredPosts.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No blog posts found</p>
            <Button className="mt-4" onClick={openNewPost}>Create your first post</Button>
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
                <Button size="sm" variant="ghost" onClick={() => openEditPost(post)}>
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

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{editingPost?.id ? 'Edit Post' : 'Create New Post'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[75vh] p-6 pt-4">
            {editingPost && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label>Title *</Label>
                    <Input value={editingPost.title || ''} onChange={e => {
                      const title = e.target.value;
                      setEditingPost(p => ({
                        ...p,
                        title,
                        slug: p?.id ? p.slug : generateSlug(title),
                        meta_title: p?.meta_title || title,
                      }));
                    }} placeholder="Blog post title" />
                  </div>
                  <div>
                    <Label>Slug *</Label>
                    <Input value={editingPost.slug || ''} onChange={e => setEditingPost(p => ({ ...p, slug: e.target.value }))}
                      placeholder="url-friendly-slug" />
                  </div>
                  <div>
                    <Label>Excerpt</Label>
                    <Textarea value={editingPost.excerpt || ''} onChange={e => setEditingPost(p => ({ ...p, excerpt: e.target.value }))}
                      placeholder="Brief description..." rows={2} />
                  </div>
                </div>

                <Separator />

                {/* Content */}
                <div>
                  <Label>Content (Markdown supported)</Label>
                  <Textarea value={editingPost.content || ''} onChange={e => setEditingPost(p => ({ ...p, content: e.target.value }))}
                    placeholder="Write your blog post content here... Supports **bold**, *italic*, ## headings, - lists, [links](url), ![images](url)" 
                    rows={15} className="font-mono text-sm" />
                </div>

                <Separator />

                {/* Media & Categorization */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-1"><Image className="h-3 w-3" /> Featured Image URL</Label>
                    <Input value={editingPost.featured_image || ''} onChange={e => setEditingPost(p => ({ ...p, featured_image: e.target.value }))}
                      placeholder="https://example.com/image.jpg" />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select value={editingPost.category || 'General'} onValueChange={v => setEditingPost(p => ({ ...p, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tags (comma-separated)</Label>
                    <Input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="ai, content, seo" />
                  </div>
                  <div>
                    <Label>Author</Label>
                    <Input value={editingPost.author || ''} onChange={e => setEditingPost(p => ({ ...p, author: e.target.value }))} />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={editingPost.featured || false} onCheckedChange={v => setEditingPost(p => ({ ...p, featured: v }))} />
                    <Label>Featured Post</Label>
                  </div>
                </div>

                <Separator />

                {/* SEO */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> SEO Settings</h3>
                  <div>
                    <Label>Meta Title</Label>
                    <Input value={editingPost.meta_title || ''} onChange={e => setEditingPost(p => ({ ...p, meta_title: e.target.value }))}
                      placeholder="SEO title (defaults to post title)" />
                    <p className="text-xs text-muted-foreground mt-1">{(editingPost.meta_title || '').length}/60 chars</p>
                  </div>
                  <div>
                    <Label>Meta Description</Label>
                    <Textarea value={editingPost.meta_description || ''} onChange={e => setEditingPost(p => ({ ...p, meta_description: e.target.value }))}
                      placeholder="SEO description (defaults to excerpt)" rows={2} />
                    <p className="text-xs text-muted-foreground mt-1">{(editingPost.meta_description || '').length}/160 chars</p>
                  </div>
                  <div>
                    <Label>Keywords (comma-separated)</Label>
                    <Input value={keywordsInput} onChange={e => setKeywordsInput(e.target.value)} placeholder="ai writing, content generator" />
                  </div>
                  <div>
                    <Label>OG Image URL</Label>
                    <Input value={editingPost.og_image || ''} onChange={e => setEditingPost(p => ({ ...p, og_image: e.target.value }))}
                      placeholder="Social sharing image (defaults to featured image)" />
                  </div>
                </div>

                <Separator />

                {/* Scheduling */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Publishing</h3>
                  <div>
                    <Label>Status</Label>
                    <Select value={editingPost.status || 'draft'} onValueChange={v => setEditingPost(p => ({ ...p, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {editingPost.status === 'scheduled' && (
                    <div>
                      <Label>Schedule Date</Label>
                      <Input type="datetime-local" value={editingPost.scheduled_at ? editingPost.scheduled_at.slice(0, 16) : ''}
                        onChange={e => setEditingPost(p => ({ ...p, scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : null }))} />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button onClick={() => handleSave(false)} disabled={saving} className="gap-2">
                    <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
                  </Button>
                  {editingPost.status !== 'published' && (
                    <Button onClick={() => handleSave(true)} disabled={saving} variant="secondary" className="gap-2">
                      <Globe className="h-4 w-4" /> Publish Now
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="gap-2">
                    <X className="h-4 w-4" /> Cancel
                  </Button>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
