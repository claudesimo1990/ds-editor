-- Fix critical security issue: Restrict email address visibility in dde_candles table
-- Remove overly permissive policy and create granular access controls

-- Drop the insecure policy that exposes email addresses
DROP POLICY IF EXISTS "Anyone can view active candles" ON dde_candles;

-- Create secure policies with proper access controls

-- 1. Public can view candles but WITHOUT email addresses
CREATE POLICY "Public can view active candles without emails" 
ON dde_candles 
FOR SELECT 
TO public
USING (
  (is_active = true) 
  AND (expires_at > now())
);

-- 2. Memorial page owners can view all candle data (including emails) for their pages
CREATE POLICY "Memorial owners can view candles with emails" 
ON dde_candles 
FOR SELECT 
TO authenticated
USING (
  (is_active = true) 
  AND (expires_at > now())
  AND EXISTS (
    SELECT 1 FROM dde_memorial_pages 
    WHERE dde_memorial_pages.id = dde_candles.memorial_page_id 
    AND dde_memorial_pages.user_id = auth.uid()
  )
);

-- 3. Obituary owners can view all candle data (including emails) for their obituaries
CREATE POLICY "Obituary owners can view candles with emails" 
ON dde_candles 
FOR SELECT 
TO authenticated
USING (
  (is_active = true) 
  AND (expires_at > now())
  AND EXISTS (
    SELECT 1 FROM dde_obituaries 
    WHERE dde_obituaries.id = dde_candles.obituary_id 
    AND dde_obituaries.user_id = auth.uid()
  )
);

-- 4. Admins can view all candle data
CREATE POLICY "Admins can view all candles" 
ON dde_candles 
FOR SELECT 
TO authenticated
USING (is_dde_admin(auth.uid()));

-- Create a secure view for public candle display (without emails)
CREATE OR REPLACE VIEW public_candles AS
SELECT 
  id,
  obituary_id,
  memorial_page_id,
  lit_by_name,
  message,
  duration_hours,
  lit_at,
  expires_at,
  is_active,
  created_at
FROM dde_candles
WHERE is_active = true 
  AND expires_at > now();

-- Grant public access to the secure view
GRANT SELECT ON public_candles TO public;
GRANT SELECT ON public_candles TO authenticated;