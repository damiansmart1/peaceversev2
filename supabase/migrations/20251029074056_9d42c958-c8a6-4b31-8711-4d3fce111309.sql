-- Restrict safe_spaces to authenticated users only
DROP POLICY IF EXISTS "Safe spaces are viewable by everyone" ON public.safe_spaces;

-- Only authenticated users can view safe spaces
CREATE POLICY "Authenticated users can view safe spaces"
ON public.safe_spaces
FOR SELECT
TO authenticated
USING (true);