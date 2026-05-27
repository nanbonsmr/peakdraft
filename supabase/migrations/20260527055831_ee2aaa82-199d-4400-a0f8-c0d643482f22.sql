
CREATE TABLE public.instagram_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  ig_user_id TEXT NOT NULL,
  ig_username TEXT,
  page_id TEXT NOT NULL,
  page_name TEXT,
  page_access_token TEXT NOT NULL,
  user_access_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.instagram_connections TO authenticated;
GRANT ALL ON public.instagram_connections TO service_role;

ALTER TABLE public.instagram_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own instagram connection" ON public.instagram_connections FOR SELECT TO authenticated USING ((auth.uid())::text = user_id);
CREATE POLICY "Users insert own instagram connection" ON public.instagram_connections FOR INSERT TO authenticated WITH CHECK ((auth.uid())::text = user_id);
CREATE POLICY "Users update own instagram connection" ON public.instagram_connections FOR UPDATE TO authenticated USING ((auth.uid())::text = user_id) WITH CHECK ((auth.uid())::text = user_id);
CREATE POLICY "Users delete own instagram connection" ON public.instagram_connections FOR DELETE TO authenticated USING ((auth.uid())::text = user_id);

CREATE TABLE public.instagram_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  caption TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_for TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  ig_media_id TEXT,
  ig_permalink TEXT,
  error TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.instagram_posts TO authenticated;
GRANT ALL ON public.instagram_posts TO service_role;

ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own instagram posts" ON public.instagram_posts FOR SELECT TO authenticated USING ((auth.uid())::text = user_id);
CREATE POLICY "Users insert own instagram posts" ON public.instagram_posts FOR INSERT TO authenticated WITH CHECK ((auth.uid())::text = user_id);
CREATE POLICY "Users update own instagram posts" ON public.instagram_posts FOR UPDATE TO authenticated USING ((auth.uid())::text = user_id) WITH CHECK ((auth.uid())::text = user_id);
CREATE POLICY "Users delete own instagram posts" ON public.instagram_posts FOR DELETE TO authenticated USING ((auth.uid())::text = user_id);

CREATE TRIGGER update_instagram_connections_updated_at BEFORE UPDATE ON public.instagram_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_instagram_posts_updated_at BEFORE UPDATE ON public.instagram_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
