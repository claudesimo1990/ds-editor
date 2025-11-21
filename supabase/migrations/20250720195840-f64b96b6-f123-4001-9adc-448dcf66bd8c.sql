-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create cron job to check expiring content every day at 10:00 AM
SELECT cron.schedule(
  'check-expiring-content-daily',
  '0 10 * * *', -- Every day at 10:00 AM
  $$
  SELECT
    net.http_post(
        url:='https://ytuumwgmdnqcmkvrtsll.supabase.co/functions/v1/check-expiring-content',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0dXVtd2dtZG5xY21rdnJ0c2xsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzk4OTgsImV4cCI6MjA2NDcxNTg5OH0.dokZeBnl7aZjoPerM4rzXrdgKmOiF-dB30zo3si5X60"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Create cron job to process email queue every 5 minutes
SELECT cron.schedule(
  'process-email-queue',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://ytuumwgmdnqcmkvrtsll.supabase.co/functions/v1/process-email-queue',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0dXVtd2dtZG5xY21rdnJ0c2xsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzk4OTgsImV4cCI6MjA2NDcxNTg5OH0.dokZeBnl7aZjoPerM4rzXrdgKmOiF-dB30zo3si5X60"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);