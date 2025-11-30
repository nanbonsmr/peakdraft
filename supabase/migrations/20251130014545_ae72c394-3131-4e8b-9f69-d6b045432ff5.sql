-- Create a table to track dismissed notifications per user
CREATE TABLE public.dismissed_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  notification_id uuid NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  dismissed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, notification_id)
);

-- Enable RLS
ALTER TABLE public.dismissed_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own dismissed notifications
CREATE POLICY "Users can view their own dismissed notifications"
ON public.dismissed_notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can dismiss notifications
CREATE POLICY "Users can dismiss notifications"
ON public.dismissed_notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can un-dismiss notifications (delete)
CREATE POLICY "Users can remove dismissed notifications"
ON public.dismissed_notifications
FOR DELETE
USING (auth.uid() = user_id);