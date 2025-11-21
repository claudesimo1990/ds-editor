-- Add admin policy for viewing all memorial pages
CREATE POLICY "Admins can view all memorial pages"
ON public.dde_memorial_pages
FOR SELECT
TO public
USING (is_dde_admin(auth.uid()));