-- Enable REPLICA IDENTITY FULL on tasks table for complete row data in realtime updates
ALTER TABLE public.tasks REPLICA IDENTITY FULL;

-- Add tasks table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;