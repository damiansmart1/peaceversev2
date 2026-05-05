-- 1. Fix has_role and is_election_admin to enforce is_active and expires_at
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND COALESCE(is_active, true) = true
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

CREATE OR REPLACE FUNCTION public.is_election_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'government')
      AND COALESCE(is_active, true) = true
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- 2. Lock down sms_sessions and ussd_sessions to admins only
DROP POLICY IF EXISTS "Admins can manage SMS sessions" ON public.sms_sessions;
CREATE POLICY "Admins can manage SMS sessions"
  ON public.sms_sessions
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "System can manage sessions" ON public.ussd_sessions;
-- Keep existing "Admins can manage USSD sessions" policy; no replacement public policy

-- 3. Prevent impersonation on proposal_comments
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.proposal_comments;
CREATE POLICY "Authenticated users can create comments"
  ON public.proposal_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4. Lock profiles SELECT to own row only (remove permissive "everyone" policy)
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
-- "Users can view own profile" / "Users can view own full profile" remain in place
