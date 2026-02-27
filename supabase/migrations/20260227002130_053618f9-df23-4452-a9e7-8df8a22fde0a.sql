
-- Create storage bucket for generated images
INSERT INTO storage.buckets (id, name, public) VALUES ('generated-images', 'generated-images', true);

-- Create table to store image generation metadata
CREATE TABLE public.image_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  template_type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  style_preset TEXT NOT NULL DEFAULT 'professional',
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.image_generations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own images" ON public.image_generations
  FOR SELECT USING ((auth.uid())::text = user_id);

CREATE POLICY "Users can insert their own images" ON public.image_generations
  FOR INSERT WITH CHECK ((auth.uid())::text = user_id);

CREATE POLICY "Users can delete their own images" ON public.image_generations
  FOR DELETE USING ((auth.uid())::text = user_id);

-- Storage policies for generated-images bucket
CREATE POLICY "Users can upload their own images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'generated-images' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own generated images" ON storage.objects
  FOR SELECT USING (bucket_id = 'generated-images' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own generated images" ON storage.objects
  FOR DELETE USING (bucket_id = 'generated-images' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view generated images" ON storage.objects
  FOR SELECT USING (bucket_id = 'generated-images');
