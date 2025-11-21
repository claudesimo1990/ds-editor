-- =====================================================
-- Deutschlandecho Database Installation Script
-- =====================================================
-- This script sets up the complete database schema for the memorial/obituary platform
-- Run this script in a fresh Supabase project to get all required tables, functions, and policies

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- =====================================================
-- CUSTOM TYPES
-- =====================================================

-- User role types
CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'user');

-- =====================================================
-- SEQUENCES
-- =====================================================

-- Order number sequence
CREATE SEQUENCE IF NOT EXISTS zl_order_number_seq START 1;

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_dde_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM dde_admin_users 
    WHERE user_id = $1 AND is_active = true
  );
$$;

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'ZL' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('zl_order_number_seq')::TEXT, 4, '0');
END;
$$;

-- Function to set order number trigger
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- USER MANAGEMENT TABLES
-- =====================================================

-- Admin users table
CREATE TABLE dde_admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'admin',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid
);

ALTER TABLE dde_admin_users ENABLE ROW LEVEL SECURITY;

-- User profiles table
CREATE TABLE dde_user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  first_name text,
  last_name text,
  display_name text,
  phone text,
  street_address text,
  postal_code text,
  city text,
  country text DEFAULT 'Deutschland',
  date_of_birth date,
  language text DEFAULT 'de',
  timezone text DEFAULT 'Europe/Berlin',
  preferred_contact_method text DEFAULT 'email',
  account_status text DEFAULT 'active',
  profile_visibility text DEFAULT 'private',
  email_verified boolean DEFAULT false,
  phone_verified boolean DEFAULT false,
  newsletter_subscription boolean DEFAULT false,
  marketing_emails boolean DEFAULT false,
  notifications_enabled boolean DEFAULT true,
  data_processing_consent boolean DEFAULT true,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE dde_user_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CORE CONTENT TABLES
-- =====================================================

-- Obituaries table
CREATE TABLE dde_obituaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  deceased_first_name text NOT NULL,
  deceased_last_name text NOT NULL,
  deceased_additional_name text,
  birth_date date NOT NULL,
  death_date date NOT NULL,
  birth_year integer,
  birth_maiden_name text,
  gender text,
  birth_place text,
  death_place text,
  last_residence text,
  relationship_status text,
  cause_of_death text,
  location_date text,
  trauerspruch text,
  introduction text,
  main_text text,
  side_texts text,
  additional_texts text,
  photo_url text,
  background_image text DEFAULT 'memorial-bg-1.jpg',
  symbol_image text,
  font_family text DEFAULT 'memorial',
  frame_style text DEFAULT 'none',
  color_theme text DEFAULT 'light',
  custom_color text,
  text_align text DEFAULT 'center',
  line_height numeric DEFAULT 1.6,
  letter_spacing numeric DEFAULT 0,
  background_opacity numeric DEFAULT 0.7,
  orientation text DEFAULT 'portrait',
  family_members jsonb DEFAULT '[]',
  life_events jsonb DEFAULT '{}',
  is_published boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  payment_required boolean DEFAULT false,
  payment_status text DEFAULT 'none',
  publishing_fee numeric DEFAULT 0,
  published_duration_days integer,
  published_at timestamp with time zone,
  published_until timestamp with time zone,
  deleted_at timestamp with time zone,
  views_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE dde_obituaries ENABLE ROW LEVEL SECURITY;

-- Memorial pages table
CREATE TABLE dde_memorial_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  deceased_first_name text NOT NULL,
  deceased_last_name text NOT NULL,
  birth_date date NOT NULL,
  death_date date NOT NULL,
  birth_year integer,
  birth_maiden_name text,
  gender text,
  birth_place text,
  death_place text,
  relationship_status text,
  cause_of_death text,
  location text,
  memorial_text text,
  life_story text,
  main_photo_url text,
  hero_background_url text,
  family_members jsonb DEFAULT '[]',
  life_events jsonb DEFAULT '{}',
  photo_gallery jsonb DEFAULT '[]',
  is_published boolean DEFAULT false,
  is_moderated boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  moderation_status text DEFAULT 'pending',
  payment_required boolean DEFAULT false,
  payment_status text DEFAULT 'none',
  publishing_fee numeric DEFAULT 0,
  publishing_duration_days integer DEFAULT 365,
  published_at date,
  published_until timestamp with time zone,
  deleted_at timestamp with time zone,
  visitor_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE dde_memorial_pages ENABLE ROW LEVEL SECURITY;

-- Memorial photos table
CREATE TABLE dde_memorial_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_page_id uuid,
  photo_url text NOT NULL,
  caption text,
  sort_order integer DEFAULT 0,
  is_moderated boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE dde_memorial_photos ENABLE ROW LEVEL SECURITY;

-- Memorial visits tracking
CREATE TABLE dde_memorial_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_page_id uuid,
  visitor_ip text,
  visited_at timestamp with time zone DEFAULT now()
);

ALTER TABLE dde_memorial_visits ENABLE ROW LEVEL SECURITY;

-- Candles table
CREATE TABLE dde_candles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obituary_id uuid,
  memorial_page_id uuid,
  lit_by_name text NOT NULL,
  lit_by_email text,
  message text,
  duration_hours integer DEFAULT 24,
  lit_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE dde_candles ENABLE ROW LEVEL SECURITY;

-- Condolences table
CREATE TABLE dde_condolences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_page_id uuid,
  author_name text NOT NULL,
  author_email text,
  message text NOT NULL,
  is_public boolean DEFAULT true,
  is_moderated boolean DEFAULT false,
  moderation_status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE dde_condolences ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- NOTIFICATION & EMAIL SYSTEM
-- =====================================================

-- Notifications table
CREATE TABLE dde_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  is_email_sent boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE dde_notifications ENABLE ROW LEVEL SECURITY;

-- Email templates table
CREATE TABLE dde_email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  html_template text NOT NULL,
  text_template text,
  variables jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE dde_email_templates ENABLE ROW LEVEL SECURITY;

-- Email queue table
CREATE TABLE dde_email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email_address text NOT NULL,
  subject text NOT NULL,
  html_content text NOT NULL,
  text_content text,
  template_name text,
  template_data jsonb DEFAULT '{}',
  status text DEFAULT 'pending',
  scheduled_for timestamp with time zone DEFAULT now(),
  sent_at timestamp with time zone,
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  last_attempt_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE dde_email_queue ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PAYMENT SYSTEM
-- =====================================================

-- Orders table
CREATE TABLE dde_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_number text NOT NULL,
  total_amount numeric NOT NULL,
  currency text DEFAULT 'EUR',
  status text DEFAULT 'pending',
  payment_status text DEFAULT 'pending',
  payment_method text,
  stripe_session_id text,
  stripe_payment_intent_id text,
  items jsonb NOT NULL DEFAULT '[]',
  billing_address jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone
);

ALTER TABLE dde_orders ENABLE ROW LEVEL SECURITY;

-- Payment methods table
CREATE TABLE dde_payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  provider text,
  external_id text,
  card_brand text,
  last_four_digits text,
  expiry_month integer,
  expiry_year integer,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE dde_payment_methods ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated at triggers
CREATE TRIGGER update_dde_user_profiles_updated_at
  BEFORE UPDATE ON dde_user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dde_obituaries_updated_at
  BEFORE UPDATE ON dde_obituaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dde_memorial_pages_updated_at
  BEFORE UPDATE ON dde_memorial_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dde_notifications_updated_at
  BEFORE UPDATE ON dde_notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dde_email_templates_updated_at
  BEFORE UPDATE ON dde_email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dde_email_queue_updated_at
  BEFORE UPDATE ON dde_email_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dde_orders_updated_at
  BEFORE UPDATE ON dde_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dde_payment_methods_updated_at
  BEFORE UPDATE ON dde_payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Order number trigger
CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON dde_orders
  FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- Candle expiration trigger
CREATE OR REPLACE FUNCTION set_candle_expiration()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.expires_at := NEW.lit_at + INTERVAL '1 hour' * COALESCE(NEW.duration_hours, 24);
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_candle_expiration_trigger
  BEFORE INSERT ON dde_candles
  FOR EACH ROW EXECUTE FUNCTION set_candle_expiration();

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.dde_user_profiles (user_id, first_name, last_name, display_name)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    COALESCE(
      new.raw_user_meta_data ->> 'display_name',
      CONCAT(new.raw_user_meta_data ->> 'first_name', ' ', new.raw_user_meta_data ->> 'last_name')
    )
  );
  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Admin users policies
CREATE POLICY "Admins can manage admin users" ON dde_admin_users
  FOR ALL USING (is_dde_admin(auth.uid()));

CREATE POLICY "Admins can view admin users" ON dde_admin_users
  FOR SELECT USING (is_dde_admin(auth.uid()));

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON dde_user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON dde_user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON dde_user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON dde_user_profiles
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles" ON dde_user_profiles
  FOR ALL USING (is_dde_admin(auth.uid()));

-- Obituaries policies
CREATE POLICY "Users can view published obituaries" ON dde_obituaries
  FOR SELECT USING (((is_published = true) AND (is_deleted = false)) OR (auth.uid() = user_id));

CREATE POLICY "Users can create their own obituaries" ON dde_obituaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own obituaries" ON dde_obituaries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own obituaries" ON dde_obituaries
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all obituaries" ON dde_obituaries
  FOR SELECT USING (is_dde_admin(auth.uid()));

-- Memorial pages policies
CREATE POLICY "Anyone can view published memorial pages" ON dde_memorial_pages
  FOR SELECT USING (((is_published = true) AND (is_moderated = true) AND (is_deleted = false)) OR (auth.uid() = user_id));

CREATE POLICY "Users can view their own memorial pages" ON dde_memorial_pages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own memorial pages" ON dde_memorial_pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memorial pages" ON dde_memorial_pages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memorial pages" ON dde_memorial_pages
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all memorial pages" ON dde_memorial_pages
  FOR ALL USING (is_dde_admin(auth.uid()));

CREATE POLICY "Admins can view all memorial pages" ON dde_memorial_pages
  FOR SELECT USING (is_dde_admin(auth.uid()));

-- Memorial photos policies
CREATE POLICY "Anyone can view photos of published memorial pages" ON dde_memorial_photos
  FOR SELECT USING ((EXISTS ( SELECT 1
   FROM dde_memorial_pages
  WHERE ((dde_memorial_pages.id = dde_memorial_photos.memorial_page_id) AND (dde_memorial_pages.is_published = true) AND (dde_memorial_pages.is_moderated = true)))) AND (is_moderated = true));

CREATE POLICY "Users can manage photos of their memorial pages" ON dde_memorial_photos
  FOR ALL USING (EXISTS ( SELECT 1
   FROM dde_memorial_pages
  WHERE ((dde_memorial_pages.id = dde_memorial_photos.memorial_page_id) AND (dde_memorial_pages.user_id = auth.uid()))));

-- Memorial visits policies
CREATE POLICY "Anyone can record visits" ON dde_memorial_visits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Memorial page owners can view visit stats" ON dde_memorial_visits
  FOR SELECT USING (EXISTS ( SELECT 1
   FROM dde_memorial_pages
  WHERE ((dde_memorial_pages.id = dde_memorial_visits.memorial_page_id) AND (dde_memorial_pages.user_id = auth.uid()))));

-- Candles policies
CREATE POLICY "Anyone can light candles" ON dde_candles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can light candles for memorial pages" ON dde_candles
  FOR INSERT WITH CHECK (memorial_page_id IS NOT NULL);

CREATE POLICY "Anyone can view active candles" ON dde_candles
  FOR SELECT USING ((is_active = true) AND (expires_at > now()));

-- Condolences policies
CREATE POLICY "Anyone can create condolences" ON dde_condolences
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view public moderated condolences" ON dde_condolences
  FOR SELECT USING ((is_public = true) AND (is_moderated = true));

CREATE POLICY "Memorial page owners can view all condolences" ON dde_condolences
  FOR SELECT USING (EXISTS ( SELECT 1
   FROM dde_memorial_pages
  WHERE ((dde_memorial_pages.id = dde_condolences.memorial_page_id) AND (dde_memorial_pages.user_id = auth.uid()))));

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON dde_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON dde_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications" ON dde_notifications
  FOR ALL USING (is_dde_admin(auth.uid()));

-- Email templates policies
CREATE POLICY "Public can view active templates" ON dde_email_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage email templates" ON dde_email_templates
  FOR ALL USING (is_dde_admin(auth.uid()));

-- Email queue policies
CREATE POLICY "Admins can manage email queue" ON dde_email_queue
  FOR ALL USING (is_dde_admin(auth.uid()));

-- Orders policies
CREATE POLICY "Users can view their own orders" ON dde_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON dde_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders" ON dde_orders
  FOR ALL USING (is_dde_admin(auth.uid()));

-- Payment methods policies
CREATE POLICY "Users can view their own payment methods" ON dde_payment_methods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own payment methods" ON dde_payment_methods
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment methods" ON dde_payment_methods
  FOR SELECT USING (is_dde_admin(auth.uid()));

-- =====================================================
-- STORAGE SETUP
-- =====================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('obituary-photos', 'obituary-photos', true),
  ('memorial-photos', 'memorial-photos', true),
  ('user-uploads', 'user-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for obituary photos
CREATE POLICY "Anyone can view obituary photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'obituary-photos');

CREATE POLICY "Authenticated users can upload obituary photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'obituary-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own obituary photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'obituary-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own obituary photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'obituary-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for memorial photos
CREATE POLICY "Anyone can view memorial photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'memorial-photos');

CREATE POLICY "Authenticated users can upload memorial photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'memorial-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own memorial photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'memorial-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own memorial photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'memorial-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for user uploads
CREATE POLICY "Users can view their own uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload to their own folder" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own uploads" ON storage.objects
  FOR UPDATE USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own uploads" ON storage.objects
  FOR DELETE USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Insert default email templates
INSERT INTO dde_email_templates (name, subject, html_template, text_template, variables) VALUES 
('approval_required', 'Genehmigung erforderlich', '<h1>Hallo {{userName}}</h1><p>Ihr Inhalt wartet auf Genehmigung.</p>', 'Hallo {{userName}}\n\nIhr Inhalt wartet auf Genehmigung.', '{"userName": "Name des Benutzers"}'),
('approved', 'Inhalt genehmigt', '<h1>Hallo {{userName}}</h1><p>Ihr Inhalt wurde genehmigt und ist nun öffentlich sichtbar.</p>', 'Hallo {{userName}}\n\nIhr Inhalt wurde genehmigt und ist nun öffentlich sichtbar.', '{"userName": "Name des Benutzers"}'),
('rejected', 'Inhalt abgelehnt', '<h1>Hallo {{userName}}</h1><p>Ihr Inhalt wurde abgelehnt. Grund: {{reason}}</p>', 'Hallo {{userName}}\n\nIhr Inhalt wurde abgelehnt. Grund: {{reason}}', '{"userName": "Name des Benutzers", "reason": "Ablehnungsgrund"}'),
('expiring_soon', 'Inhalt läuft bald ab', '<h1>Hallo {{userName}}</h1><p>Ihr Inhalt läuft in {{daysLeft}} Tagen ab.</p>', 'Hallo {{userName}}\n\nIhr Inhalt läuft in {{daysLeft}} Tagen ab.', '{"userName": "Name des Benutzers", "daysLeft": "Anzahl verbleibende Tage"}'),
('expired', 'Inhalt abgelaufen', '<h1>Hallo {{userName}}</h1><p>Ihr Inhalt ist abgelaufen und wurde archiviert.</p>', 'Hallo {{userName}}\n\nIhr Inhalt ist abgelaufen und wurde archiviert.', '{"userName": "Name des Benutzers"}'),
('payment_required', 'Zahlung erforderlich', '<h1>Hallo {{userName}}</h1><p>Für die Veröffentlichung ist eine Zahlung von {{amount}}€ erforderlich.</p>', 'Hallo {{userName}}\n\nFür die Veröffentlichung ist eine Zahlung von {{amount}}€ erforderlich.', '{"userName": "Name des Benutzers", "amount": "Betrag"}')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- INDICES FOR PERFORMANCE
-- =====================================================

-- User profiles indices
CREATE INDEX IF NOT EXISTS idx_dde_user_profiles_user_id ON dde_user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_dde_user_profiles_email_verified ON dde_user_profiles(email_verified);

-- Obituaries indices
CREATE INDEX IF NOT EXISTS idx_dde_obituaries_user_id ON dde_obituaries(user_id);
CREATE INDEX IF NOT EXISTS idx_dde_obituaries_published ON dde_obituaries(is_published, is_deleted);
CREATE INDEX IF NOT EXISTS idx_dde_obituaries_published_until ON dde_obituaries(published_until);

-- Memorial pages indices
CREATE INDEX IF NOT EXISTS idx_dde_memorial_pages_user_id ON dde_memorial_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_dde_memorial_pages_published ON dde_memorial_pages(is_published, is_moderated, is_deleted);
CREATE INDEX IF NOT EXISTS idx_dde_memorial_pages_published_until ON dde_memorial_pages(published_until);

-- Candles indices
CREATE INDEX IF NOT EXISTS idx_dde_candles_obituary_id ON dde_candles(obituary_id);
CREATE INDEX IF NOT EXISTS idx_dde_candles_memorial_page_id ON dde_candles(memorial_page_id);
CREATE INDEX IF NOT EXISTS idx_dde_candles_expires_at ON dde_candles(expires_at);
CREATE INDEX IF NOT EXISTS idx_dde_candles_active ON dde_candles(is_active, expires_at);

-- Email queue indices
CREATE INDEX IF NOT EXISTS idx_dde_email_queue_status ON dde_email_queue(status);
CREATE INDEX IF NOT EXISTS idx_dde_email_queue_scheduled_for ON dde_email_queue(scheduled_for);

-- Orders indices
CREATE INDEX IF NOT EXISTS idx_dde_orders_user_id ON dde_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_dde_orders_status ON dde_orders(status);
CREATE INDEX IF NOT EXISTS idx_dde_orders_payment_status ON dde_orders(payment_status);

-- =====================================================
-- CRON JOBS (Optional - requires pg_cron extension)
-- =====================================================

-- Clean up expired candles every hour
SELECT cron.schedule('cleanup-expired-candles', '0 * * * *', 'UPDATE dde_candles SET is_active = false WHERE expires_at < now() AND is_active = true;');

-- Check for expiring content daily at 9 AM
SELECT cron.schedule('check-expiring-content', '0 9 * * *', 'SELECT check_expiring_content();');

-- Process email queue every 5 minutes
SELECT cron.schedule('process-email-queue', '*/5 * * * *', 'SELECT process_email_queue();');

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'Deutschlandecho Database Setup Complete!';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'Tables created: %', (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'dde_%');
  RAISE NOTICE 'Functions created: %', (SELECT count(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name LIKE '%dde%' OR routine_name IN ('is_dde_admin', 'generate_order_number', 'set_order_number', 'handle_new_user'));
  RAISE NOTICE 'Storage buckets created: 3';
  RAISE NOTICE 'Email templates inserted: 6';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create your first admin user in dde_admin_users';
  RAISE NOTICE '2. Configure email templates if needed';
  RAISE NOTICE '3. Set up your Edge Functions';
  RAISE NOTICE '4. Configure Stripe for payments';
  RAISE NOTICE '==========================================';
END $$;