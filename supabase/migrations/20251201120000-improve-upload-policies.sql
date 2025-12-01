-- Migration pour améliorer les politiques d'upload
-- Vérifie explicitement que l'utilisateur est authentifié

-- Supprimer les anciennes politiques pour les remplacer
DROP POLICY IF EXISTS "Users can upload their own memorial photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own memorial photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own memorial photos" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload their own memorial media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own memorial media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own memorial media" ON storage.objects;

-- Recréer les politiques avec vérification d'authentification explicite

-- =====================================================
-- POLITIQUES POUR dde_memorial_photos (Images)
-- =====================================================

-- INSERT : Les utilisateurs authentifiés peuvent uploader dans leur propre dossier
CREATE POLICY "Authenticated users can upload their own memorial photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'dde_memorial_photos' AND 
  auth.role() = 'authenticated' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- SELECT : Tous peuvent voir les photos (déjà public)
DROP POLICY IF EXISTS "Anyone can view memorial photos" ON storage.objects;
CREATE POLICY "Anyone can view memorial photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'dde_memorial_photos');

-- UPDATE : Les utilisateurs authentifiés peuvent modifier leurs propres photos
CREATE POLICY "Authenticated users can update their own memorial photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'dde_memorial_photos' AND 
  auth.role() = 'authenticated' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- DELETE : Les utilisateurs authentifiés peuvent supprimer leurs propres photos
CREATE POLICY "Authenticated users can delete their own memorial photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'dde_memorial_photos' AND 
  auth.role() = 'authenticated' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- POLITIQUES POUR dde_memorial_media (Vidéos et Audios)
-- =====================================================

-- INSERT : Les utilisateurs authentifiés peuvent uploader dans leur propre dossier
CREATE POLICY "Authenticated users can upload their own memorial media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'dde_memorial_media' AND 
  auth.role() = 'authenticated' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- SELECT : Tous peuvent voir les médias (déjà public)
DROP POLICY IF EXISTS "Anyone can view memorial media" ON storage.objects;
CREATE POLICY "Anyone can view memorial media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'dde_memorial_media');

-- UPDATE : Les utilisateurs authentifiés peuvent modifier leurs propres médias
CREATE POLICY "Authenticated users can update their own memorial media" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'dde_memorial_media' AND 
  auth.role() = 'authenticated' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- DELETE : Les utilisateurs authentifiés peuvent supprimer leurs propres médias
CREATE POLICY "Authenticated users can delete their own memorial media" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'dde_memorial_media' AND 
  auth.role() = 'authenticated' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

