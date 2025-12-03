-- Create function to increment share count atomically
CREATE OR REPLACE FUNCTION public.increment_share_count(content_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE content
  SET share_count = COALESCE(share_count, 0) + 1
  WHERE id = content_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_share_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_share_count(UUID) TO anon;