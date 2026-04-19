
-- Workflow templates: saved chains of actions users can re-run
CREATE TABLE public.workflow_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  source_types text[] NOT NULL DEFAULT '{}'::text[],
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  use_brand_context boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workflow templates"
ON public.workflow_templates FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflow templates"
ON public.workflow_templates FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow templates"
ON public.workflow_templates FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflow templates"
ON public.workflow_templates FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_workflow_templates_updated_at
BEFORE UPDATE ON public.workflow_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Workflow schedules: deferred / scheduled actions that should run later
CREATE TABLE public.workflow_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  source_type text NOT NULL,
  source_title text,
  content text NOT NULL,
  options jsonb NOT NULL DEFAULT '{}'::jsonb,
  scheduled_for timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  result text,
  error text,
  executed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workflow_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workflow schedules"
ON public.workflow_schedules FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflow schedules"
ON public.workflow_schedules FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow schedules"
ON public.workflow_schedules FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflow schedules"
ON public.workflow_schedules FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_workflow_schedules_updated_at
BEFORE UPDATE ON public.workflow_schedules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_workflow_schedules_user_pending ON public.workflow_schedules(user_id, status, scheduled_for);
CREATE INDEX idx_workflow_templates_user ON public.workflow_templates(user_id);
