import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Globe, ArrowLeft, Calendar, Image, Upload, X, Loader2 } from "lucide-react";
import { BlogContentEditor } from "@/components/BlogContentEditor";

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

export default function AdminBlogEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [post, setPost] = useState<Partial<BlogPost>>({ ...emptyPost });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [tagsInput, setTagsInput] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ogFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id!)
      .single();

    if (data && !error) {
      setPost(data);
      setTagsInput((data.tags || []).join(', '));
      setKeywordsInput((data.meta_keywords || []).join(', '));
    } else {
      toast.error('Failed to load post');
      navigate('/admin/blog');
    }
    setLoading(false);
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const calculateReadingTime = (content: string) =>
    Math.max(1, Math.ceil(content.split(/\s+/).length / 200));

  const uploadImage = async (file: File, target: 'featured' | 'og') => {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error) {
      toast.error('Upload failed: ' + error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);

    const url = urlData.publicUrl;

    if (target === 'featured') {
      setPost(p => ({ ...p, featured_image: url }));
    } else {
      setPost(p => ({ ...p, og_image: url }));
    }

    toast.success('Image uploaded!');
    setUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'featured' | 'og') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be under 5MB');
        return;
      }
      uploadImage(file, target);
    }
  };

  const handleSave = async (publishNow = false) => {
    if (!post.title || !post.slug) {
      toast.error('Title and slug are required');
      return;
    }
    setSaving(true);

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const meta_keywords = keywordsInput.split(',').map(k => k.trim()).filter(Boolean);
    const reading_time = calculateReadingTime(post.content || '');

    const postData = {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content || '',
      featured_image: post.featured_image || null,
      category: post.category || 'General',
      tags,
      author: post.author || 'PeakDraft Team',
      status: publishNow ? 'published' : (post.status || 'draft'),
      published_at: publishNow ? new Date().toISOString() : post.published_at,
      scheduled_at: post.scheduled_at || null,
      meta_title: post.meta_title || post.title,
      meta_description: post.meta_description || post.excerpt,
      meta_keywords,
      og_image: post.og_image || post.featured_image || null,
      reading_time,
      featured: post.featured || false,
    };

    let error;
    if (isEditing) {
      ({ error } = await supabase.from('blog_posts').update(postData).eq('id', id!));
    } else {
      ({ error } = await supabase.from('blog_posts').insert(postData));
    }

    if (error) {
      toast.error('Failed to save: ' + error.message);
    } else {
      toast.success(publishNow ? 'Published!' : 'Saved!');
      navigate('/admin/blog');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/blog')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{isEditing ? 'Edit Post' : 'Create New Post'}</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleSave(false)} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
          </Button>
          {post.status !== 'published' && (
            <Button onClick={() => handleSave(true)} disabled={saving} variant="secondary" className="gap-2">
              <Globe className="h-4 w-4" /> Publish Now
            </Button>
          )}
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input value={post.title || ''} onChange={e => {
              const title = e.target.value;
              setPost(p => ({
                ...p,
                title,
                slug: p?.id ? p.slug : generateSlug(title),
                meta_title: p?.meta_title || title,
              }));
            }} placeholder="Blog post title" />
          </div>
          <div>
            <Label>Slug *</Label>
            <Input value={post.slug || ''} onChange={e => setPost(p => ({ ...p, slug: e.target.value }))}
              placeholder="url-friendly-slug" />
          </div>
          <div>
            <Label>Excerpt</Label>
            <Textarea value={post.excerpt || ''} onChange={e => setPost(p => ({ ...p, excerpt: e.target.value }))}
              placeholder="Brief description..." rows={2} />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader><CardTitle>Content</CardTitle></CardHeader>
        <CardContent>
          <Label>Content (Markdown supported)</Label>
          <Textarea value={post.content || ''} onChange={e => setPost(p => ({ ...p, content: e.target.value }))}
            placeholder="Write your blog post content here... Supports **bold**, *italic*, ## headings, - lists, [links](url), ![images](url)"
            rows={20} className="font-mono text-sm" />
        </CardContent>
      </Card>

      {/* Media */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Image className="h-4 w-4" /> Media</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Featured Image</Label>
            <div className="flex gap-2 mt-1">
              <Input value={post.featured_image || ''} onChange={e => setPost(p => ({ ...p, featured_image: e.target.value }))}
                placeholder="https://example.com/image.jpg or upload below" className="flex-1" />
              <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </Button>
              {post.featured_image && (
                <Button variant="outline" size="icon" onClick={() => setPost(p => ({ ...p, featured_image: '' }))}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => handleFileChange(e, 'featured')} />
            {post.featured_image && (
              <img src={post.featured_image} alt="Featured" className="mt-3 w-full max-h-48 object-cover rounded-lg" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Categorization */}
      <Card>
        <CardHeader><CardTitle>Categorization</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={post.category || 'General'} onValueChange={v => setPost(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Author</Label>
              <Input value={post.author || ''} onChange={e => setPost(p => ({ ...p, author: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>Tags (comma-separated)</Label>
            <Input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="ai, content, seo" />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={post.featured || false} onCheckedChange={v => setPost(p => ({ ...p, featured: v }))} />
            <Label>Featured Post</Label>
          </div>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> SEO Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Meta Title</Label>
            <Input value={post.meta_title || ''} onChange={e => setPost(p => ({ ...p, meta_title: e.target.value }))}
              placeholder="SEO title (defaults to post title)" />
            <p className="text-xs text-muted-foreground mt-1">{(post.meta_title || '').length}/60 chars</p>
          </div>
          <div>
            <Label>Meta Description</Label>
            <Textarea value={post.meta_description || ''} onChange={e => setPost(p => ({ ...p, meta_description: e.target.value }))}
              placeholder="SEO description (defaults to excerpt)" rows={2} />
            <p className="text-xs text-muted-foreground mt-1">{(post.meta_description || '').length}/160 chars</p>
          </div>
          <div>
            <Label>Keywords (comma-separated)</Label>
            <Input value={keywordsInput} onChange={e => setKeywordsInput(e.target.value)} placeholder="ai writing, content generator" />
          </div>
          <div>
            <Label>OG Image</Label>
            <div className="flex gap-2 mt-1">
              <Input value={post.og_image || ''} onChange={e => setPost(p => ({ ...p, og_image: e.target.value }))}
                placeholder="Social sharing image (defaults to featured image)" className="flex-1" />
              <Button variant="outline" size="icon" onClick={() => ogFileInputRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </Button>
            </div>
            <input ref={ogFileInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => handleFileChange(e, 'og')} />
          </div>
        </CardContent>
      </Card>

      {/* Publishing */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Publishing</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Status</Label>
            <Select value={post.status || 'draft'} onValueChange={v => setPost(p => ({ ...p, status: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {post.status === 'scheduled' && (
            <div>
              <Label>Schedule Date</Label>
              <Input type="datetime-local" value={post.scheduled_at ? post.scheduled_at.slice(0, 16) : ''}
                onChange={e => setPost(p => ({ ...p, scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : null }))} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Actions */}
      <div className="flex gap-3 pb-8">
        <Button onClick={() => handleSave(false)} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
        </Button>
        {post.status !== 'published' && (
          <Button onClick={() => handleSave(true)} disabled={saving} variant="secondary" className="gap-2">
            <Globe className="h-4 w-4" /> Publish Now
          </Button>
        )}
        <Button variant="outline" onClick={() => navigate('/admin/blog')}>Cancel</Button>
      </div>
    </div>
  );
}
