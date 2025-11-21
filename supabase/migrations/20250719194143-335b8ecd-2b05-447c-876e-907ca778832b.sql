-- Create RPC function to increment obituary views
CREATE OR REPLACE FUNCTION increment_obituary_views(obituary_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE dde_obituaries 
  SET views_count = COALESCE(views_count, 0) + 1 
  WHERE id = obituary_id;
END;
$$;

-- Update pricing structure in calculate_publishing_fee function
CREATE OR REPLACE FUNCTION calculate_publishing_fee(duration_days INTEGER)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
BEGIN
  -- 1 month (30 days) free
  IF duration_days <= 30 THEN
    RETURN 0;
  -- 2-12 months: 19.9 EUR
  ELSIF duration_days <= 365 THEN
    RETURN 19.9;
  -- 36 months: 49.9 EUR  
  ELSIF duration_days <= 1095 THEN
    RETURN 49.9;
  -- Lifetime (represented as 99999 days): 129 EUR
  ELSE
    RETURN 129;
  END IF;
END;
$$;