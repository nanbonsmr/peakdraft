
-- Blog posts table
CREATE TABLE public.blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  featured_image text,
  category text NOT NULL DEFAULT 'General',
  tags text[] DEFAULT '{}',
  author text NOT NULL DEFAULT 'PeakDraft Team',
  status text NOT NULL DEFAULT 'draft', -- draft, published, scheduled
  published_at timestamp with time zone,
  scheduled_at timestamp with time zone,
  meta_title text,
  meta_description text,
  meta_keywords text[] DEFAULT '{}',
  og_image text,
  reading_time integer DEFAULT 5,
  featured boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Anyone can read published blog posts"
  ON public.blog_posts FOR SELECT
  TO public
  USING (status = 'published' AND (published_at IS NULL OR published_at <= now()));

-- Admins can do everything (via service role or admin check)
CREATE POLICY "Admins can manage blog posts"
  ON public.blog_posts FOR ALL
  TO authenticated
  USING (public.is_admin_by_user_id((auth.uid())::text))
  WITH CHECK (public.is_admin_by_user_id((auth.uid())::text));

-- Updated at trigger
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
