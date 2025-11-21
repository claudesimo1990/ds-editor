-- Create dde_admin_users table
CREATE TABLE public.dde_admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.dde_admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage admin users" 
ON public.dde_admin_users 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.dde_admin_users 
  WHERE user_id = auth.uid() AND is_active = true
));

CREATE POLICY "Admins can view admin users" 
ON public.dde_admin_users 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.dde_admin_users 
  WHERE user_id = auth.uid() AND is_active = true
));

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_dde_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.dde_admin_users 
    WHERE dde_admin_users.user_id = $1 AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;