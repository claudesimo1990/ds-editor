-- Create comprehensive user profiles table for DDE
CREATE TABLE public.dde_user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  
  -- Address Information
  street_address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Deutschland',
  
  -- Contact Preferences
  preferred_contact_method TEXT DEFAULT 'email', -- 'email', 'phone', 'postal'
  
  -- Privacy Settings
  newsletter_subscription BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT false,
  data_processing_consent BOOLEAN DEFAULT true,
  profile_visibility TEXT DEFAULT 'private', -- 'private', 'public'
  
  -- Account Settings
  account_status TEXT DEFAULT 'active', -- 'active', 'suspended', 'deleted'
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  
  -- Additional Settings
  language TEXT DEFAULT 'de',
  timezone TEXT DEFAULT 'Europe/Berlin',
  notifications_enabled BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  UNIQUE(user_id)
);

-- Create orders table for purchase history
CREATE TABLE public.dde_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  
  -- Order Details
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'cancelled', 'refunded'
  
  -- Items (JSON array of order items)
  items JSONB NOT NULL DEFAULT '[]',
  
  -- Payment Information
  payment_method TEXT, -- 'stripe', 'paypal', 'bank_transfer', 'invoice'
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  
  -- Billing Information
  billing_address JSONB,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create payment methods table
CREATE TABLE public.dde_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Payment Method Details
  type TEXT NOT NULL, -- 'credit_card', 'debit_card', 'paypal', 'bank_transfer'
  provider TEXT, -- 'stripe', 'paypal'
  external_id TEXT, -- Stripe customer ID, PayPal agreement ID, etc.
  
  -- Card Information (encrypted/tokenized)
  last_four_digits TEXT,
  card_brand TEXT, -- 'visa', 'mastercard', 'amex'
  expiry_month INTEGER,
  expiry_year INTEGER,
  
  -- Settings
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE public.dde_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dde_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dde_payment_methods ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for dde_user_profiles
CREATE POLICY "Users can view their own profile"
  ON public.dde_user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.dde_user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.dde_user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
  ON public.dde_user_profiles FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles"
  ON public.dde_user_profiles FOR ALL
  USING (is_dde_admin(auth.uid()));

-- Create RLS Policies for dde_orders
CREATE POLICY "Users can view their own orders"
  ON public.dde_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON public.dde_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders"
  ON public.dde_orders FOR ALL
  USING (is_dde_admin(auth.uid()));

-- Create RLS Policies for dde_payment_methods
CREATE POLICY "Users can view their own payment methods"
  ON public.dde_payment_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own payment methods"
  ON public.dde_payment_methods FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment methods"
  ON public.dde_payment_methods FOR SELECT
  USING (is_dde_admin(auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_dde_user_profiles_user_id ON public.dde_user_profiles(user_id);
CREATE INDEX idx_dde_orders_user_id ON public.dde_orders(user_id);
CREATE INDEX idx_dde_orders_status ON public.dde_orders(status);
CREATE INDEX idx_dde_orders_created_at ON public.dde_orders(created_at DESC);
CREATE INDEX idx_dde_payment_methods_user_id ON public.dde_payment_methods(user_id);
CREATE INDEX idx_dde_payment_methods_is_default ON public.dde_payment_methods(user_id, is_default) WHERE is_default = true;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dde_user_profiles_updated_at
  BEFORE UPDATE ON public.dde_user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dde_orders_updated_at
  BEFORE UPDATE ON public.dde_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dde_payment_methods_updated_at
  BEFORE UPDATE ON public.dde_payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS dde_order_number_seq START 1000;

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_dde_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'DDE' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('dde_order_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION public.set_dde_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_dde_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_dde_order_number_trigger
  BEFORE INSERT ON public.dde_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_dde_order_number();

-- Add soft delete functionality to obituaries and memorial pages
ALTER TABLE public.dde_obituaries ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE public.dde_obituaries ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.dde_memorial_pages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE public.dde_memorial_pages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Update existing RLS policies to exclude deleted items
DROP POLICY IF EXISTS "Users can view published obituaries" ON public.dde_obituaries;
CREATE POLICY "Users can view published obituaries"
  ON public.dde_obituaries FOR SELECT
  USING ((is_published = true AND is_deleted = false) OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view published memorial pages" ON public.dde_memorial_pages;
CREATE POLICY "Anyone can view published memorial pages"
  ON public.dde_memorial_pages FOR SELECT
  USING ((is_published = true AND is_moderated = true AND is_deleted = false) OR auth.uid() = user_id);

-- Create function to soft delete user content
CREATE OR REPLACE FUNCTION public.soft_delete_user_content(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Soft delete obituaries
  UPDATE public.dde_obituaries 
  SET is_deleted = true, deleted_at = now(), is_published = false
  WHERE user_id = target_user_id AND is_deleted = false;
  
  -- Soft delete memorial pages
  UPDATE public.dde_memorial_pages 
  SET is_deleted = true, deleted_at = now(), is_published = false
  WHERE user_id = target_user_id AND is_deleted = false;
  
  -- Update user profile status
  UPDATE public.dde_user_profiles 
  SET account_status = 'deleted', updated_at = now()
  WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to permanently delete user and all content
CREATE OR REPLACE FUNCTION public.permanently_delete_user_data(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Delete all related data
  DELETE FROM public.dde_candles WHERE obituary_id IN (SELECT id FROM public.dde_obituaries WHERE user_id = target_user_id);
  DELETE FROM public.dde_candles WHERE memorial_page_id IN (SELECT id FROM public.dde_memorial_pages WHERE user_id = target_user_id);
  DELETE FROM public.dde_condolences WHERE memorial_page_id IN (SELECT id FROM public.dde_memorial_pages WHERE user_id = target_user_id);
  DELETE FROM public.dde_memorial_photos WHERE memorial_page_id IN (SELECT id FROM public.dde_memorial_pages WHERE user_id = target_user_id);
  DELETE FROM public.dde_memorial_visits WHERE memorial_page_id IN (SELECT id FROM public.dde_memorial_pages WHERE user_id = target_user_id);
  
  -- Delete user content
  DELETE FROM public.dde_obituaries WHERE user_id = target_user_id;
  DELETE FROM public.dde_memorial_pages WHERE user_id = target_user_id;
  DELETE FROM public.dde_payment_methods WHERE user_id = target_user_id;
  DELETE FROM public.dde_orders WHERE user_id = target_user_id;
  DELETE FROM public.dde_user_profiles WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;