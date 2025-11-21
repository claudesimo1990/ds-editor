# Deutschlandecho Database Setup

Vollständige Datenbank-Installation für ein neues Supabase Projekt.

## 🚀 Quick Start

### 1. Hauptdatenbank installieren
```sql
-- Im Supabase SQL Editor ausführen:
-- Kopiere den kompletten Inhalt von install-database.sql und führe ihn aus
```

### 2. Admin-Benutzer erstellen
```sql
-- 1. Erst normal über Supabase Auth registrieren
-- 2. User ID aus auth.users holen:
SELECT id, email FROM auth.users WHERE email = 'deine-email@example.com';

-- 3. create-admin-user.sql bearbeiten und User ID einsetzen
-- 4. Script ausführen
```

## 📋 Was wird installiert?

### Core Tabellen
- `dde_user_profiles` - Benutzerprofile
- `dde_admin_users` - Admin-Benutzer
- `dde_obituaries` - Traueranzeigen
- `dde_memorial_pages` - Gedenkseiten
- `dde_candles` - Virtuelle Kerzen
- `dde_condolences` - Beileidsbekundungen

### Benachrichtigungen & Email
- `dde_notifications` - In-App Benachrichtigungen
- `dde_email_templates` - Email-Vorlagen
- `dde_email_queue` - Email-Warteschlange

### Payment System
- `dde_orders` - Bestellungen
- `dde_payment_methods` - Zahlungsmethoden

### Media & Files
- `dde_memorial_photos` - Gedenkfotos
- `dde_memorial_visits` - Besucherstatistiken

## 🔧 Funktionen & Trigger

### Utility Functions
- `is_dde_admin()` - Admin-Check
- `generate_order_number()` - Bestellnummern
- `update_updated_at_column()` - Timestamp Updates

### Automatische Triggers
- Auto-Update von `updated_at` Feldern
- Bestellnummer-Generierung
- Kerzen-Ablaufzeit berechnen
- Auto-Profil bei Registrierung

## 🛡️ Security (RLS)

Alle Tabellen haben Row Level Security aktiviert:
- **Benutzer** sehen nur ihre eigenen Daten
- **Admins** haben Vollzugriff
- **Öffentlich** nur publizierte/moderierte Inhalte
- **Anonyme** können Kerzen anzünden & Kondolenzen schreiben

## 💾 Storage Buckets

- `obituary-photos` (öffentlich) - Traueranzeigen-Fotos
- `memorial-photos` (öffentlich) - Gedenkseiten-Fotos  
- `user-uploads` (privat) - Benutzer-Uploads

## ⚡ Performance

### Indizes erstellt für:
- User-Suchen
- Publizierte Inhalte
- Ablaufzeiten
- Email-Queue Status
- Zahlungsstatus

## 🔁 Cron Jobs (Optional)

- **Alle Stunden**: Abgelaufene Kerzen deaktivieren
- **Täglich 9:00**: Ablaufende Inhalte prüfen
- **Alle 5 Min**: Email-Queue abarbeiten

## 📧 Standard Email-Templates

6 vorgefertigte Templates:
- `approval_required` - Genehmigung erforderlich
- `approved` - Inhalt genehmigt
- `rejected` - Inhalt abgelehnt
- `expiring_soon` - Läuft bald ab
- `expired` - Abgelaufen
- `payment_required` - Zahlung erforderlich

## ✅ Nach der Installation

1. **Admin erstellen** mit `create-admin-user.sql`
2. **Edge Functions** deployen (separate Scripts)
3. **Email-Templates** anpassen falls nötig
4. **Stripe** für Zahlungen konfigurieren
5. **Domain** & DNS einrichten

## 🔍 Testen

```sql
-- Admin-Funktion testen
SELECT is_dde_admin(auth.uid());

-- Tabellen überprüfen
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'dde_%';

-- RLS Policies überprüfen  
SELECT tablename, policyname, cmd FROM pg_policies 
WHERE schemaname = 'public';
```

## 🚨 Wichtige Hinweise

- **Backup**: Immer vor größeren Änderungen
- **Testing**: RLS-Policies mit verschiedenen Benutzern testen
- **Secrets**: Edge Function Secrets separat konfigurieren
- **Performance**: Bei vielen Benutzern zusätzliche Indizes erwägen