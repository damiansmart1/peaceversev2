-- Feature Two: volunteer mediator network
CREATE TYPE public.mediator_category AS ENUM ('professional', 'trained_volunteer', 'community_facilitator');
CREATE TYPE public.mediator_status AS ENUM ('pending', 'approved', 'suspended');
CREATE TYPE public.mediator_assignment_status AS ENUM ('proposed', 'accepted', 'declined', 'active', 'completed', 'escalated', 'referred');

CREATE TABLE public.mediators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  full_name text NOT NULL,
  mediator_category public.mediator_category NOT NULL DEFAULT 'trained_volunteer',
  organization text,
  bio text,
  specializations text[] NOT NULL DEFAULT '{}',
  languages text[] NOT NULL DEFAULT '{}',
  locations_served text[] NOT NULL DEFAULT '{}',
  credentials text,
  credential_verified boolean NOT NULL DEFAULT false,
  verified_by uuid,
  verified_at timestamptz,
  availability text,
  preferred_formats text[] NOT NULL DEFAULT '{}',
  max_active_cases integer NOT NULL DEFAULT 2,
  active_cases integer NOT NULL DEFAULT 0,
  is_accepting_referrals boolean NOT NULL DEFAULT true,
  code_of_conduct_accepted_at timestamptz,
  safeguarding_acknowledged boolean NOT NULL DEFAULT false,
  status public.mediator_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

COMMENT ON TABLE public.mediators IS 'Volunteer mediator network. Category distinguishes verified professional mediators, trained volunteer mediators and community dialogue facilitators — never present a volunteer as a qualified professional.';

CREATE TABLE public.mediator_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.mediation_cases(id) ON DELETE CASCADE,
  mediator_id uuid NOT NULL REFERENCES public.mediators(id) ON DELETE CASCADE,
  status public.mediator_assignment_status NOT NULL DEFAULT 'proposed',
  proposed_by uuid,
  suitability_reason text,
  conflict_of_interest_declared text,
  responded_at timestamptz,
  escalation_reason text,
  referral_notes text,
  follow_up_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.mediator_assignments IS 'Mediator-to-case assignments with consent, conflict-of-interest, escalation and referral tracking.';

ALTER TABLE public.mediation_cases
  ADD COLUMN IF NOT EXISTS party_consent_confirmed boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.mediation_cases.party_consent_confirmed IS 'All participating parties have consented before mediation begins; mediation must remain voluntary.';

ALTER TABLE public.mediation_cases
  ADD COLUMN IF NOT EXISTS source_report_id uuid;

COMMENT ON COLUMN public.mediation_cases.source_report_id IS 'Citizen report this case was opened from, when a reported situation is assessed as suitable for voluntary mediation.';

CREATE OR REPLACE FUNCTION public.is_approved_mediator(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.mediators
    WHERE user_id = _user_id AND status = 'approved'
  )
$$;

CREATE OR REPLACE FUNCTION public.mediator_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER mediators_touch_updated_at
  BEFORE UPDATE ON public.mediators
  FOR EACH ROW EXECUTE FUNCTION public.mediator_touch_updated_at();

CREATE TRIGGER mediator_assignments_touch_updated_at
  BEFORE UPDATE ON public.mediator_assignments
  FOR EACH ROW EXECUTE FUNCTION public.mediator_touch_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mediators TO authenticated;
GRANT ALL ON public.mediators TO service_role;
GRANT SELECT ON public.mediators TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mediator_assignments TO authenticated;
GRANT ALL ON public.mediator_assignments TO service_role;

ALTER TABLE public.mediators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mediator_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved mediator directory is public"
  ON public.mediators FOR SELECT
  USING (status = 'approved' OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "People can register as mediators"
  ON public.mediators FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Mediators can manage their own profile"
  ON public.mediators FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can remove mediator records"
  ON public.mediators FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Case members and assigned mediators view assignments"
  ON public.mediator_assignments FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.mediators m
      WHERE m.id = mediator_id AND m.user_id = auth.uid()
    )
    OR public.is_mediation_member(case_id, auth.uid())
  );

CREATE POLICY "Facilitators and admins propose assignments"
  ON public.mediator_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.is_mediation_facilitator(case_id, auth.uid())
  );

CREATE POLICY "Assigned mediators and facilitators update assignments"
  ON public.mediator_assignments FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.is_mediation_facilitator(case_id, auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.mediators m
      WHERE m.id = mediator_id AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.is_mediation_facilitator(case_id, auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.mediators m
      WHERE m.id = mediator_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and facilitators remove assignments"
  ON public.mediator_assignments FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.is_mediation_facilitator(case_id, auth.uid())
  );