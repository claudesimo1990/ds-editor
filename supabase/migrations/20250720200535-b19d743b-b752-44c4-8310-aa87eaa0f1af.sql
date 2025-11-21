-- Add admin update policy for memorial pages
CREATE POLICY "Admins can manage all memorial pages" ON public.dde_memorial_pages
FOR ALL USING (is_dde_admin(auth.uid()));