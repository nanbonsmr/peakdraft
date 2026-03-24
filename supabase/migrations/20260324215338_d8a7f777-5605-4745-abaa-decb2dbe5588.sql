
CREATE TABLE public.workflow_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_title TEXT,
  content_preview TEXT,
  result_preview TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.workflow_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workflow history" ON public.workflow_history FOR SELECT TO authenticated USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert their own workflow history" ON public.workflow_history FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can delete their own workflow history" ON public.workflow_history FOR DELETE TO authenticated USING ((auth.uid() = user_id));

CREATE INDEX idx_workflow_history_user_id ON public.workflow_history(user_id);
CREATE INDEX idx_workflow_history_created_at ON public.workflow_history(created_at DESC);
