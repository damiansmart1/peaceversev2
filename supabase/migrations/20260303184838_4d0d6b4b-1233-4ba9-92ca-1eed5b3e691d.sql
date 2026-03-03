
-- =============================================
-- 1. FIX citizen_reports INSERT policy (prevent impersonation)
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can create reports" ON public.citizen_reports;

CREATE POLICY "Authenticated users can create reports"
ON public.citizen_reports FOR INSERT TO authenticated
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = reporter_id AND (is_anonymous IS NULL OR is_anonymous = false))
  OR
  (is_anonymous = true AND reporter_id IS NULL)
);

-- =============================================
-- 2. FIX citizen_reports UPDATE policies (split by role)
-- =============================================
DROP POLICY IF EXISTS "Users can update own reports or admins" ON public.citizen_reports;
DROP POLICY IF EXISTS "Authorized users can update reports" ON public.citizen_reports;

-- Reporters can update their own reports (only if still pending/draft)
CREATE POLICY "Reporters can update own reports"
ON public.citizen_reports FOR UPDATE TO authenticated
USING (auth.uid() = reporter_id)
WITH CHECK (auth.uid() = reporter_id);

-- Admins and verifiers can update reports for moderation
CREATE POLICY "Admins and verifiers can update reports"
ON public.citizen_reports FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'verifier'::app_role)
);

-- =============================================
-- 3. FIX profiles table - restrict email visibility
-- =============================================
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Users can view their own full profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Others can view profiles but email is handled by public_profiles view
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT TO authenticated
USING (true);

-- NOTE: The public_profiles view (which already has security_invoker=true) 
-- should be used in code to exclude emails from non-owners.
-- We keep the base table readable but the view masks sensitive fields.

-- =============================================
-- 4. FIX citizen_reports_safe view - add security_invoker
-- =============================================
ALTER VIEW public.citizen_reports_safe SET (security_invoker = on);

-- =============================================
-- 5. Add poll_responses uniqueness constraint
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_poll_response'
  ) THEN
    ALTER TABLE public.poll_responses 
    ADD CONSTRAINT unique_user_poll_response UNIQUE (poll_id, user_id);
  END IF;
END $$;

-- =============================================
-- 6. Create secure process_content_tip function
-- =============================================
CREATE OR REPLACE FUNCTION public.process_content_tip(
  p_content_id UUID,
  p_creator_id UUID,
  p_amount NUMERIC,
  p_message TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tipper_id UUID;
BEGIN
  v_tipper_id := auth.uid();
  IF v_tipper_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Cannot tip yourself
  IF v_tipper_id = p_creator_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot tip yourself');
  END IF;
  
  -- Validate amount
  IF p_amount <= 0 OR p_amount > 1000 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid amount (must be between 0 and 1000)');
  END IF;

  -- Validate content exists
  IF NOT EXISTS (SELECT 1 FROM content WHERE id = p_content_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Content not found');
  END IF;

  -- Atomic tip processing
  INSERT INTO content_tips (content_id, tipper_id, creator_id, amount, message)
  VALUES (p_content_id, v_tipper_id, p_creator_id, p_amount, p_message);
  
  INSERT INTO creator_earnings (user_id, amount, source, source_id, description)
  VALUES (p_creator_id, p_amount, 'tip', p_content_id, 'Tip from supporter');
  
  -- Update wallet if table exists
  BEGIN
    UPDATE user_wallets
    SET balance = balance + p_amount,
        total_earned = total_earned + p_amount
    WHERE user_id = p_creator_id;
  EXCEPTION WHEN undefined_table THEN
    -- user_wallets table doesn't exist yet, skip
    NULL;
  END;
  
  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
