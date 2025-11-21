-- Restore missing foreign key relationships
ALTER TABLE dde_candles ADD CONSTRAINT dde_candles_obituary_id_fkey 
  FOREIGN KEY (obituary_id) REFERENCES dde_obituaries(id) ON DELETE CASCADE;

ALTER TABLE dde_candles ADD CONSTRAINT dde_candles_memorial_page_id_fkey 
  FOREIGN KEY (memorial_page_id) REFERENCES dde_memorial_pages(id) ON DELETE CASCADE;

ALTER TABLE dde_condolences ADD CONSTRAINT dde_condolences_memorial_page_id_fkey 
  FOREIGN KEY (memorial_page_id) REFERENCES dde_memorial_pages(id) ON DELETE CASCADE;

ALTER TABLE dde_memorial_photos ADD CONSTRAINT dde_memorial_photos_memorial_page_id_fkey 
  FOREIGN KEY (memorial_page_id) REFERENCES dde_memorial_pages(id) ON DELETE CASCADE;

ALTER TABLE dde_memorial_visits ADD CONSTRAINT dde_memorial_visits_memorial_page_id_fkey 
  FOREIGN KEY (memorial_page_id) REFERENCES dde_memorial_pages(id) ON DELETE CASCADE;

-- Restore missing triggers
CREATE TRIGGER update_dde_user_profiles_updated_at
  BEFORE UPDATE ON dde_user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dde_obituaries_updated_at
  BEFORE UPDATE ON dde_obituaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dde_memorial_pages_updated_at
  BEFORE UPDATE ON dde_memorial_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dde_orders_updated_at
  BEFORE UPDATE ON dde_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dde_payment_methods_updated_at
  BEFORE UPDATE ON dde_payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dde_email_queue_updated_at
  BEFORE UPDATE ON dde_email_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dde_email_templates_updated_at
  BEFORE UPDATE ON dde_email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dde_notifications_updated_at
  BEFORE UPDATE ON dde_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_dde_orders_order_number
  BEFORE INSERT ON dde_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

CREATE TRIGGER set_dde_candles_expiration
  BEFORE INSERT ON dde_candles
  FOR EACH ROW
  EXECUTE FUNCTION set_candle_expiration();

-- Create the user creation trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Fix function security by adding search_path
CREATE OR REPLACE FUNCTION public.is_dde_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM dde_admin_users 
    WHERE user_id = $1 AND is_active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  RETURN 'ZL' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('zl_order_number_seq')::TEXT, 4, '0');
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_candle_expiration()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.expires_at := NEW.lit_at + INTERVAL '1 hour' * COALESCE(NEW.duration_hours, 24);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;