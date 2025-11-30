-- Migration zum Erstellen des Audio/Video-Buckets
-- Im SQL Editor von Supabase ausführen

-- Bucket für Medien (Audio/Video) erstellen
-- Dieser Bucket akzeptiert alle MIME-Typen, im Gegensatz zu dde_memorial_photos, der auf Bilder beschränkt ist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('dde_memorial_media', 'dde_memorial_media', true)
ON CONFLICT (id) DO NOTHING;

-- Richtlinien für Medien erstellen
-- Einfüge-Richtlinie: Benutzer können ihre eigenen Medien hochladen
CREATE POLICY IF NOT EXISTS "Users can upload their own memorial media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'dde_memorial_media' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Lese-Richtlinie: Jeder kann die Medien ansehen
CREATE POLICY IF NOT EXISTS "Anyone can view memorial media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'dde_memorial_media');

-- Aktualisierungs-Richtlinie: Benutzer können ihre eigenen Medien aktualisieren
CREATE POLICY IF NOT EXISTS "Users can update their own memorial media" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'dde_memorial_media' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Lösch-Richtlinie: Benutzer können ihre eigenen Medien löschen
CREATE POLICY IF NOT EXISTS "Users can delete their own memorial media" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'dde_memorial_media' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

