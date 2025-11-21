-- Create function to increment memorial page visitor count
CREATE OR REPLACE FUNCTION public.increment_memorial_visitor_count(
  page_id UUID,
  visitor_ip TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert visitor record
  INSERT INTO dde_memorial_visits (memorial_page_id, visitor_ip)
  VALUES (page_id, visitor_ip)
  ON CONFLICT DO NOTHING;
  
  -- Update visitor count
  UPDATE dde_memorial_pages
  SET visitor_count = visitor_count + 1
  WHERE id = page_id;
END;
$$;