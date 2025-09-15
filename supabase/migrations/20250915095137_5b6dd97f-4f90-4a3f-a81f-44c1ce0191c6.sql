-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests  
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the subscription expiration function to run daily at 2 AM UTC
SELECT cron.schedule(
  'expire-subscriptions-daily',
  '0 2 * * *', -- Daily at 2 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://vegvmdmfegsdjukbiqam.supabase.co/functions/v1/expire-subscriptions',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3ZtZG1mZWdzZGp1a2JpcWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODYwMjcsImV4cCI6MjA3MzI2MjAyN30.LMEWYszaaQH78cBGYjSEtGnU_CmoazmHCe0hVC5VFI8"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Also create a function to manually trigger subscription expiration (for testing)
CREATE OR REPLACE FUNCTION public.trigger_subscription_expiration()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    net.http_post(
        url:='https://vegvmdmfegsdjukbiqam.supabase.co/functions/v1/expire-subscriptions',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3ZtZG1mZWdzZGp1a2JpcWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODYwMjcsImV4cCI6MjA3MzI2MjAyN30.LMEWYszaaQH78cBGYjSEtGnU_CmoazmHCe0hVC5VFI8"}'::jsonb,
        body:='{"manual_trigger": true}'::jsonb
    );
$$;