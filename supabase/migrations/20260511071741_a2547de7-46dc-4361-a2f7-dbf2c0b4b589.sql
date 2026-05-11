
-- Avatars table
CREATE TABLE public.avatars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  reference_url TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own avatars" ON public.avatars
  FOR SELECT TO authenticated USING ((auth.uid())::text = user_id);
CREATE POLICY "Users create own avatars" ON public.avatars
  FOR INSERT TO authenticated WITH CHECK ((auth.uid())::text = user_id);
CREATE POLICY "Users update own avatars" ON public.avatars
  FOR UPDATE TO authenticated USING ((auth.uid())::text = user_id) WITH CHECK ((auth.uid())::text = user_id);
CREATE POLICY "Users delete own avatars" ON public.avatars
  FOR DELETE TO authenticated USING ((auth.uid())::text = user_id);

CREATE TRIGGER update_avatars_updated_at
  BEFORE UPDATE ON public.avatars
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_avatars_user_id ON public.avatars(user_id);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users upload to own avatar folder"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own avatar files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own avatar files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);
