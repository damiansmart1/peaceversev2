-- Fix 1: Restrict proposal_votes to prevent user tracking
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Votes are viewable by everyone" ON proposal_votes;

-- Create restricted policies for proposal_votes
CREATE POLICY "Users can view their own votes"
ON proposal_votes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins and moderators can view all votes"
ON proposal_votes FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'moderator'::app_role)
);

-- Create a secure view for aggregated vote counts (public data)
CREATE OR REPLACE VIEW public.proposal_vote_summary AS
SELECT 
  proposal_id,
  COUNT(*) FILTER (WHERE vote_value = 1) as support_count,
  COUNT(*) FILTER (WHERE vote_value = -1) as oppose_count,
  COUNT(*) FILTER (WHERE vote_value = 0) as abstain_count,
  COUNT(DISTINCT user_id) as total_voters
FROM proposal_votes
GROUP BY proposal_id;

-- Make the view publicly readable
GRANT SELECT ON public.proposal_vote_summary TO anon, authenticated;

-- Fix 2: Restrict safe_spaces to require authentication
DROP POLICY IF EXISTS "Authenticated users can view safe spaces" ON safe_spaces;

CREATE POLICY "Authenticated users can view safe spaces"
ON safe_spaces FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Fix 3: Create secure atomic purchase function
CREATE OR REPLACE FUNCTION public.purchase_reward_item(
  p_item_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_item RECORD;
  v_user_points INTEGER;
  v_purchase_id UUID;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Not authenticated'
    );
  END IF;

  -- Lock and fetch item details with FOR UPDATE to prevent race conditions
  SELECT * INTO v_item
  FROM reward_store_items
  WHERE id = p_item_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Item not found'
    );
  END IF;

  -- Check if item is available
  IF NOT v_item.is_available THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Item not available'
    );
  END IF;

  -- Check quantity for limited items
  IF v_item.limited_quantity AND (v_item.quantity_remaining IS NULL OR v_item.quantity_remaining <= 0) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Out of stock'
    );
  END IF;

  -- Lock and fetch user points with FOR UPDATE
  SELECT peace_points INTO v_user_points
  FROM profiles
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User profile not found'
    );
  END IF;

  -- Check if user has enough points
  IF v_user_points < v_item.cost_points THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Not enough Peace Points'
    );
  END IF;

  -- All validations passed, perform atomic operations
  
  -- Create purchase record
  INSERT INTO user_purchases (user_id, item_id, points_spent)
  VALUES (v_user_id, p_item_id, v_item.cost_points)
  RETURNING id INTO v_purchase_id;

  -- Deduct points from user
  UPDATE profiles
  SET peace_points = peace_points - v_item.cost_points
  WHERE user_id = v_user_id;

  -- Update item quantity if limited
  IF v_item.limited_quantity AND v_item.quantity_remaining IS NOT NULL THEN
    UPDATE reward_store_items
    SET quantity_remaining = quantity_remaining - 1
    WHERE id = p_item_id;
  END IF;

  -- Apply item effects based on type
  IF v_item.item_type = 'profile_frame' THEN
    UPDATE profiles
    SET profile_frame = v_item.image_url
    WHERE user_id = v_user_id;
  ELSIF v_item.item_type = 'accessory' THEN
    UPDATE profiles
    SET avatar_accessories = COALESCE(avatar_accessories, '[]'::jsonb) || jsonb_build_array(v_item.metadata)
    WHERE user_id = v_user_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'purchase_id', v_purchase_id,
    'message', 'Purchase successful'
  );
END;
$$;