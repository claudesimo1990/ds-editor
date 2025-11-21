# Supabase Export Scripts

Zwei Scripts zum Exportieren deiner kompletten Supabase Datenbank.

## Einfacher Export (`export-supabase-simple.sh`)

Schneller Export der wichtigsten Komponenten:

```bash
# Ausführbar machen
chmod +x scripts/export-supabase-simple.sh

# Ausführen
./scripts/export-supabase-simple.sh

# Oder mit Passwort als Parameter
./scripts/export-supabase-simple.sh "dein-db-passwort"
```

**Exportiert:**
- Komplette Datenbank (Schema + Daten)  
- Edge Functions
- Supabase Config

## Vollständiger Export (`export-supabase.sh`)

Umfassender Export mit allen Details:

```bash
# Ausführbar machen  
chmod +x scripts/export-supabase.sh

# Ausführen
./scripts/export-supabase.sh
```

**Exportiert zusätzlich:**
- Einzelne Tabellen als JSON
- RLS Policies im Detail
- Database Functions & Triggers
- Vollständige Dokumentation
- Export-Metadaten

## Voraussetzungen

- **PostgreSQL Client Tools** (`pg_dump`, `psql`)
- **Supabase CLI** (für erweiterte Features)
- **jq** (optional, für JSON-Formatierung)

### Installation (macOS):
```bash
brew install postgresql supabase/tap/supabase jq
```

### Installation (Ubuntu/Debian):
```bash
sudo apt install postgresql-client jq
npm install -g supabase
```

## Datenbank-Passwort finden

1. Gehe zu deinem Supabase Dashboard
2. Settings → Database  
3. Connection string → kopiere das Passwort

## Restore

```bash
# Datenbank wiederherstellen
psql "deine-neue-db-url" < database_backup.sql

# Edge Functions deployen
cp -r functions/* dein-neues-projekt/supabase/functions/
supabase functions deploy
```

## Ausgabe

Beide Scripts erstellen:
- Einen Ordner mit allen Exports
- Ein `.tar.gz` Archiv für einfachen Transfer

**Beispiel:** `supabase-backup-20241220_143022.tar.gz`