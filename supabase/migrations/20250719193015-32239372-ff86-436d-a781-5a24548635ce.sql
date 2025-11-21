-- Add publishing and payment fields to dde_obituaries
ALTER TABLE dde_obituaries 
ADD COLUMN IF NOT EXISTS published_duration_days INTEGER,
ADD COLUMN IF NOT EXISTS publishing_fee NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS published_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'none';

-- Update the table to ensure correct defaults
UPDATE dde_obituaries 
SET publishing_fee = 0 
WHERE publishing_fee IS NULL;

-- Create a pricing function
CREATE OR REPLACE FUNCTION calculate_publishing_fee(duration_days INTEGER)
RETURNS NUMERIC AS $$
BEGIN
  -- Free for 30 days or less
  IF duration_days <= 30 THEN
    RETURN 0;
  END IF;
  
  -- 19.99 EUR for 31-90 days
  IF duration_days <= 90 THEN
    RETURN 19.99;
  END IF;
  
  -- 39.99 EUR for 91-365 days
  IF duration_days <= 365 THEN
    RETURN 39.99;
  END IF;
  
  -- 79.99 EUR for over 1 year
  RETURN 79.99;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set publishing fee automatically
CREATE OR REPLACE FUNCTION set_publishing_fee()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.published_duration_days IS NOT NULL THEN
    NEW.publishing_fee := calculate_publishing_fee(NEW.published_duration_days);
    NEW.payment_required := NEW.publishing_fee > 0;
    
    -- Set published_until date
    IF NEW.published_duration_days IS NOT NULL AND NEW.published_at IS NOT NULL THEN
      NEW.published_until := NEW.published_at + (NEW.published_duration_days || ' days')::INTERVAL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS set_publishing_fee_trigger ON dde_obituaries;
CREATE TRIGGER set_publishing_fee_trigger
  BEFORE INSERT OR UPDATE ON dde_obituaries
  FOR EACH ROW
  EXECUTE FUNCTION set_publishing_fee();