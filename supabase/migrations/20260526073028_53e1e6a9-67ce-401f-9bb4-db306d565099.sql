
CREATE TABLE public.linkedin_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  linkedin_user_id text NOT NULL,
  name text,
  email text,
  picture text,
  access_token text NOT NULL,
  refresh_token text,
  expires_at timestamptz NOT NULL,
  scope text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.linkedin_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own linkedin connection" ON public.linkedin_connections
  FOR SELECT TO authenticated USING ((auth.uid())::text = user_id);
CREATE POLICY "Users insert own linkedin connection" ON public.linkedin_connections
  FOR INSERT TO authenticated WITH CHECK ((auth.uid())::text = user_id);
CREATE POLICY "Users update own linkedin connection" ON public.linkedin_connections
  FOR UPDATE TO authenticated USING ((auth.uid())::text = user_id) WITH CHECK ((auth.uid())::text = user_id);
CREATE POLICY "Users delete own linkedin connection" ON public.linkedin_connections
  FOR DELETE TO authenticated USING ((auth.uid())::text = user_id);

CREATE TRIGGER update_linkedin_connections_updated_at
  BEFORE UPDATE ON public.linkedin_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.linkedin_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  text text NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'pending',
  scheduled_for timestamptz,
  posted_at timestamptz,
  linkedin_post_id text,
  linkedin_post_url text,
  error text,
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.linkedin_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own linkedin posts" ON public.linkedin_posts
  FOR SELECT TO authenticated USING ((auth.uid())::text = user_id);
CREATE POLICY "Users insert own linkedin posts" ON public.linkedin_posts
  FOR INSERT TO authenticated WITH CHECK ((auth.uid())::text = user_id);
CREATE POLICY "Users update own linkedin posts" ON public.linkedin_posts
  FOR UPDATE TO authenticated USING ((auth.uid())::text = user_id) WITH CHECK ((auth.uid())::text = user_id);
CREATE POLICY "Users delete own linkedin posts" ON public.linkedin_posts
  FOR DELETE TO authenticated USING ((auth.uid())::text = user_id);

CREATE TRIGGER update_linkedin_posts_updated_at
  BEFORE UPDATE ON public.linkedin_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_linkedin_posts_due ON public.linkedin_posts (status, scheduled_for) WHERE status = 'pending';

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'linkedin-publish-due',
  '* * * * *',
  $$
  SELECT net.http_post(
    url:='https://vegvmdmfegsdjukbiqam.supabase.co/functions/v1/linkedin-publish-due',
    headers:='{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3ZtZG1mZWdzZGp1a2JpcWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODYwMjcsImV4cCI6MjA3MzI2MjAyN30.LMEWYszaaQH78cBGYjSEtGnU_CmoazmHCe0hVC5VFI8"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);
