-- Create storage bucket for obituary photos
INSERT INTO storage.buckets (id, name, public) VALUES ('dde_obituary_photos', 'dde_obituary_photos', true);

-- Create policies for obituary photos
CREATE POLICY "Users can upload their own obituary photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'dde_obituary_photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view all obituary photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'dde_obituary_photos');

CREATE POLICY "Users can update their own obituary photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'dde_obituary_photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own obituary photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'dde_obituary_photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add photo and orientation fields to obituaries table
ALTER TABLE public.dde_obituaries 
ADD COLUMN photo_url TEXT,
ADD COLUMN orientation TEXT DEFAULT 'portrait' CHECK (orientation IN ('portrait', 'landscape'));

-- Create index for orientation
CREATE INDEX idx_dde_obituaries_orientation ON public.dde_obituaries(orientation);