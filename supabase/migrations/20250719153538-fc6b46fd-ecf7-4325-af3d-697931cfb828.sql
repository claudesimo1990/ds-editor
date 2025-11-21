-- Fix infinite recursion in dde_admin_users policies
-- First drop the existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can manage admin users" ON dde_admin_users;
DROP POLICY IF EXISTS "Admins can view admin users" ON dde_admin_users;

-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_dde_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM dde_admin_users 
    WHERE user_id = $1 AND is_active = true
  );
$$;

-- Create new policies using the security definer function
CREATE POLICY "Admins can manage admin users" 
ON dde_admin_users 
FOR ALL 
USING (public.is_dde_admin(auth.uid()));

CREATE POLICY "Admins can view admin users" 
ON dde_admin_users 
FOR SELECT 
USING (public.is_dde_admin(auth.uid()));