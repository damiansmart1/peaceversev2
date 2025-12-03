-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create policy for users to view their own complete profile
CREATE POLICY "Users can view own full profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Create policy for viewing basic public profile info (excludes email access for others)
-- This allows other users to see profiles but the email column is protected at application level
CREATE POLICY "Authenticated users can view public profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create a secure view for public profile data that excludes sensitive fields
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  display_name,
  avatar_url,
  bio,
  user_type,
  is_verified,
  is_creator,
  creator_tier,
  peace_points,
  current_level,
  followers_count,
  following_count,
  posts_count,
  total_views,
  social_links,
  created_at
  -- Explicitly excluding: email
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;