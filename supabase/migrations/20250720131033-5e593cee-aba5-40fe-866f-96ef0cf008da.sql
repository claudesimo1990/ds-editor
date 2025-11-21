-- Create storage bucket for memorial photos
INSERT INTO storage.buckets (id, name, public) VALUES ('dde_memorial_photos', 'dde_memorial_photos', true);

-- Create policies for memorial photos
CREATE POLICY "Users can upload their own memorial photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'dde_memorial_photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view memorial photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'dde_memorial_photos');

CREATE POLICY "Users can update their own memorial photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'dde_memorial_photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own memorial photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'dde_memorial_photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add photo and orientation fields to memorial pages table
ALTER TABLE public.dde_memorial_pages 
ADD COLUMN main_photo_url TEXT,
ADD COLUMN photo_gallery jsonb DEFAULT '[]'::jsonb;

-- Add publishing related fields
ALTER TABLE public.dde_memorial_pages
ADD COLUMN publishing_duration_days INTEGER DEFAULT 365,
ADD COLUMN publishing_fee NUMERIC DEFAULT 0,
ADD COLUMN payment_status TEXT DEFAULT 'none',
ADD COLUMN payment_required BOOLEAN DEFAULT false;