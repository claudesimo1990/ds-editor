-- Fix the security definer view issue by removing the view
-- and relying on RLS policies with application-level field filtering

DROP VIEW IF EXISTS public_candles;

-- The RLS policies are sufficient - no need for a view
-- The application code will handle field selection appropriately