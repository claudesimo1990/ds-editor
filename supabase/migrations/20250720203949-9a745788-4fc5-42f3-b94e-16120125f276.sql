-- Add hero_background_url column to memorial pages
ALTER TABLE dde_memorial_pages 
ADD COLUMN hero_background_url TEXT;