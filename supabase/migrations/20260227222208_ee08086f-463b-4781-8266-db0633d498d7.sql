CREATE TABLE public.infobase (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  brand_name text NOT NULL,
  description text,
  industry text,
  target_audience text,
  tone_of_voice text,
  website_url text,
  products_services text,
  unique_selling_points text,
  additional_context text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.infobase ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own infobase" ON public.infobase FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own infobase" ON public.infobase FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own infobase" ON public.infobase FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own infobase" ON public.infobase FOR DELETE USING (auth.uid() = user_id);