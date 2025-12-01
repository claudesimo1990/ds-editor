# Vérification des Permissions d'Upload - Espace Utilisateur

## ✅ État Actuel des Permissions

### 1. Buckets de Stockage

#### **dde_memorial_photos** (Images)
- **Bucket** : `dde_memorial_photos` (public)
- **Chemin d'upload** : `${user.id}/gallery/filename.ext`
- **Politique INSERT** : ✅ Vérifie que `auth.uid()::text = (storage.foldername(name))[1]`
- **Politique SELECT** : ✅ Public (tous peuvent voir)
- **Politique UPDATE** : ✅ Vérifie que l'utilisateur est propriétaire
- **Politique DELETE** : ✅ Vérifie que l'utilisateur est propriétaire

#### **dde_memorial_media** (Vidéos et Audios)
- **Bucket** : `dde_memorial_media` (public)
- **Chemin d'upload** : 
  - Vidéos : `${user.id}/videos/filename.ext`
  - Audios : `${user.id}/audios/filename.ext`
- **Politique INSERT** : ✅ Vérifie que `auth.uid()::text = (storage.foldername(name))[1]`
- **Politique SELECT** : ✅ Public (tous peuvent voir)
- **Politique UPDATE** : ✅ Vérifie que l'utilisateur est propriétaire
- **Politique DELETE** : ✅ Vérifie que l'utilisateur est propriétaire

### 2. Vérifications dans le Code

#### **SimpleCanvaEditor.tsx**
- ✅ Vérifie `!user?.id` avant l'upload (ligne 612)
- ✅ Utilise le chemin `${user.id}/gallery/` pour les images
- ✅ Utilise le chemin `${user.id}/videos/` pour les vidéos
- ✅ Utilise le chemin `${user.id}/audios/` pour les audios

### 3. Problèmes Potentiels Identifiés

#### ⚠️ Problème 1 : Vérification d'authentification dans les politiques
Les politiques actuelles vérifient seulement que le premier dossier correspond à l'ID utilisateur, mais ne vérifient pas explicitement que l'utilisateur est authentifié.

**Solution recommandée** : Ajouter `auth.role() = 'authenticated'` dans les politiques INSERT.

#### ⚠️ Problème 2 : Pas de vérification explicite de l'authentification
Le code vérifie `!user?.id` mais ne vérifie pas si l'utilisateur est toujours authentifié au moment de l'upload.

---

## 🔧 Améliorations Recommandées

### 1. Améliorer les Politiques RLS

Ajouter une vérification explicite de l'authentification dans toutes les politiques INSERT :

```sql
-- Pour dde_memorial_photos
CREATE POLICY "Users can upload their own memorial photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'dde_memorial_photos' AND 
  auth.role() = 'authenticated' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Pour dde_memorial_media
CREATE POLICY "Users can upload their own memorial media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'dde_memorial_media' AND 
  auth.role() = 'authenticated' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 2. Améliorer la Vérification dans le Code

Ajouter une vérification explicite de l'authentification avant chaque upload :

```typescript
// Vérifier que l'utilisateur est authentifié
const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
if (authError || !currentUser || currentUser.id !== user.id) {
  toast({
    title: "Authentifizierung erforderlich",
    description: "Bitte melden Sie sich an, um Dateien hochzuladen.",
    variant: "destructive",
  });
  return;
}
```

---

## 📋 Checklist de Vérification

- [x] Les buckets existent (`dde_memorial_photos`, `dde_memorial_media`)
- [x] Les politiques RLS sont configurées
- [x] Les chemins d'upload incluent l'ID utilisateur
- [x] Le code vérifie l'existence de l'utilisateur avant l'upload
- [ ] Les politiques vérifient explicitement l'authentification (à améliorer)
- [ ] Le code vérifie l'authentification avant chaque upload (à améliorer)

---

## 🚀 Actions à Prendre

1. **Créer une migration SQL** pour améliorer les politiques RLS
2. **Améliorer le code** pour vérifier l'authentification avant chaque upload
3. **Tester** les uploads avec un utilisateur authentifié et non authentifié

