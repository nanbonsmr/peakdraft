
CREATE TABLE public.free_tool_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  tool_id text NOT NULL,
  used_at timestamp with time zone NOT NULL DEFAULT now(),
  usage_date date NOT NULL DEFAULT CURRENT_DATE
);

ALTER TABLE public.free_tool_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own free tool usage" ON public.free_tool_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own free tool usage" ON public.free_tool_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_free_tool_usage_user_date ON public.free_tool_usage (user_id, usage_date);
