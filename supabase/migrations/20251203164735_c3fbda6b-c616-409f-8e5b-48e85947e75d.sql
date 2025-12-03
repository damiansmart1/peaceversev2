-- Drop and recreate view without SECURITY DEFINER
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true) AS
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
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;