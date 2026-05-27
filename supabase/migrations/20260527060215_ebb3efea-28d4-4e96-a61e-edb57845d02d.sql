
SELECT cron.schedule(
  'instagram-publish-due-every-minute',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://vegvmdmfegsdjukbiqam.supabase.co/functions/v1/instagram-publish-due',
    headers := '{"Content-Type": "application/json", "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3ZtZG1mZWdzZGp1a2JpcWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODYwMjcsImV4cCI6MjA3MzI2MjAyN30.LMEWYszaaQH78cBGYjSEtGnU_CmoazmHCe0hVC5VFI8"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
