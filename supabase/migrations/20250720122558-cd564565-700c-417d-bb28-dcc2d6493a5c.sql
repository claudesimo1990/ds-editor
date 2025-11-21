
-- Phase 2: Datenmodell erweitern für Memorial Pages
ALTER TABLE dde_memorial_pages 
ADD COLUMN IF NOT EXISTS birth_maiden_name TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('weiblich', 'männlich', 'divers')),
ADD COLUMN IF NOT EXISTS birth_year INTEGER,
ADD COLUMN IF NOT EXISTS birth_place TEXT,
ADD COLUMN IF NOT EXISTS death_place TEXT,
ADD COLUMN IF NOT EXISTS relationship_status TEXT CHECK (relationship_status IN ('single', 'in_beziehung', 'verlobt', 'verheiratet', 'getrennt', 'geschieden', 'verwitwet', 'kompliziert')),
ADD COLUMN IF NOT EXISTS family_members JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS life_events JSONB DEFAULT '{}'::jsonb;

-- Phase 2: Datenmodell für Obituaries erweitern (falls noch nicht vorhanden)
ALTER TABLE dde_obituaries 
ADD COLUMN IF NOT EXISTS birth_maiden_name TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('weiblich', 'männlich', 'divers')),
ADD COLUMN IF NOT EXISTS birth_year INTEGER,
ADD COLUMN IF NOT EXISTS birth_place TEXT,
ADD COLUMN IF NOT EXISTS death_place TEXT,
ADD COLUMN IF NOT EXISTS relationship_status TEXT CHECK (relationship_status IN ('single', 'in_beziehung', 'verlobt', 'verheiratet', 'getrennt', 'geschieden', 'verwitwet', 'kompliziert')),
ADD COLUMN IF NOT EXISTS family_members JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS life_events JSONB DEFAULT '{}'::jsonb;

-- Kommentar für bessere Dokumentation
COMMENT ON COLUMN dde_memorial_pages.family_members IS 'Array of family member objects with details like name, relationship, birth_date, etc.';
COMMENT ON COLUMN dde_memorial_pages.life_events IS 'Object containing life events categorized by type (work, education, etc.)';
COMMENT ON COLUMN dde_obituaries.family_members IS 'Array of family member objects with details like name, relationship, birth_date, etc.';
COMMENT ON COLUMN dde_obituaries.life_events IS 'Object containing life events categorized by type (work, education, etc.)';
