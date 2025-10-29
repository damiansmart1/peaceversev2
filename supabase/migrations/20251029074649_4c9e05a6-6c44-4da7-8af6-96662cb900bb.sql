-- Fix profiles table RLS to explicitly deny public access
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Only authenticated users can view their own profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);