# Anleitung zur Ausführung der Audio/Video-Bucket-Migration

## Option 1: Über das Supabase Dashboard (Empfohlen)

1. Melden Sie sich bei Ihrem Supabase-Projekt an: https://supabase.com/dashboard
2. Gehen Sie zum **SQL Editor** (im linken Menü)
3. Klicken Sie auf **New Query**
4. Kopieren Sie den Inhalt der Datei `supabase/migrations/20251130164724-create-memorial-media-bucket.sql`
5. Klicken Sie auf **Run**, um die Migration auszuführen

## Option 2: Über die Supabase CLI

Falls Sie die Supabase CLI installiert haben:

```bash
supabase db push
```

Oder um eine spezifische Migration auszuführen:

```bash
supabase migration up
```

## Inhalt der Migration

Die Migration erstellt:
- Einen neuen Bucket `dde_memorial_media` für Audio- und Videodateien
- Die erforderlichen Sicherheitsrichtlinien, um Upload und Lesen zu ermöglichen

## Überprüfung

Nach der Ausführung der Migration können Sie überprüfen, ob der Bucket existiert:
1. Gehen Sie zu **Storage** im Supabase-Dashboard
2. Sie sollten den Bucket `dde_memorial_media` in der Liste sehen

