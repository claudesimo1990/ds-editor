-- Add cause_of_death field to memorial pages table
ALTER TABLE dde_memorial_pages 
ADD COLUMN cause_of_death text CHECK (cause_of_death IN ('natuerlich', 'unnatuerlich')) DEFAULT NULL;