-- Restrict safe_spaces table access to authenticated users only
-- Drop any existing SELECT policies that might be too permissive
DROP POLICY IF EXISTS "Authenticated users can view safe spaces" ON public.safe_spaces;
DROP POLICY IF EXISTS "Safe spaces are viewable by everyone" ON public.safe_spaces;

-- Only authenticated users can view safe spaces
CREATE POLICY "Authenticated users can view safe spaces"
ON public.safe_spaces
FOR SELECT
TO authenticated
USING (true);