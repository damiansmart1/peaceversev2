
-- ============ ENUMS ============
CREATE TYPE public.mediation_case_status AS ENUM ('intake','assessment','party_onboarding','dialogue','negotiation','drafting','agreement_reached','implementation','monitoring','closed','suspended','failed');
CREATE TYPE public.mediation_confidentiality AS ENUM ('public','restricted','confidential');
CREATE TYPE public.mediation_member_role AS ENUM ('lead_mediator','co_mediator','rapporteur','observer','party_representative','technical_advisor','funder');
CREATE TYPE public.mediation_party_type AS ENUM ('community','government','armed_group','political_party','business','civil_society','religious_institution','individual','other');
CREATE TYPE public.mediation_session_status AS ENUM ('scheduled','in_progress','completed','cancelled','postponed');
CREATE TYPE public.mediation_entry_type AS ENUM ('statement','question','proposal','clarification','concern','commitment','decision','caucus_note');
CREATE TYPE public.mediation_visibility AS ENUM ('all_members','mediators_only','parties_only');
CREATE TYPE public.mediation_agreement_status AS ENUM ('draft','under_review','agreed','signed','implemented','breached','void');
CREATE TYPE public.mediation_clause_status AS ENUM ('pending','in_progress','complete','delayed','breached');

-- ============ CASES ============
CREATE TABLE public.mediation_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_ref text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text,
  conflict_type text,
  status public.mediation_case_status NOT NULL DEFAULT 'intake',
  confidentiality public.mediation_confidentiality NOT NULL DEFAULT 'restricted',
  is_public boolean NOT NULL DEFAULT false,
  lead_mediator_id uuid,
  organization text,
  country_code text,
  region text,
  location_name text,
  latitude numeric,
  longitude numeric,
  affected_population integer,
  started_at timestamptz DEFAULT now(),
  target_resolution_date date,
  closed_at timestamptz,
  progress_percent integer NOT NULL DEFAULT 0,
  trust_index numeric,
  tags text[] DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.mediation_case_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.mediation_cases(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  member_role public.mediation_member_role NOT NULL DEFAULT 'observer',
  organization text,
  is_active boolean NOT NULL DEFAULT true,
  added_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (case_id, user_id)
);

-- ============ SECURITY DEFINER HELPERS ============
CREATE OR REPLACE FUNCTION public.is_mediation_member(_case_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.mediation_case_members
    WHERE case_id = _case_id AND user_id = _user_id AND is_active = true
  ) OR public.has_role(_user_id, 'admin')
$$;

CREATE OR REPLACE FUNCTION public.is_mediation_facilitator(_case_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.mediation_case_members
    WHERE case_id = _case_id AND user_id = _user_id AND is_active = true
      AND member_role IN ('lead_mediator','co_mediator','rapporteur')
  ) OR public.has_role(_user_id, 'admin')
$$;

-- ============ PARTIES ============
CREATE TABLE public.mediation_parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.mediation_cases(id) ON DELETE CASCADE,
  party_name text NOT NULL,
  party_type public.mediation_party_type NOT NULL DEFAULT 'community',
  representative_name text,
  representative_title text,
  contact_email text,
  contact_phone text,
  user_id uuid,
  position_summary text,
  interests text[] DEFAULT '{}',
  red_lines text[] DEFAULT '{}',
  engagement_status text NOT NULL DEFAULT 'invited',
  is_signatory boolean NOT NULL DEFAULT true,
  trust_level integer,
  color_token text,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============ SESSIONS ============
CREATE TABLE public.mediation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.mediation_cases(id) ON DELETE CASCADE,
  session_number integer NOT NULL DEFAULT 1,
  title text NOT NULL,
  agenda text,
  modality text NOT NULL DEFAULT 'in_person',
  location_name text,
  scheduled_at timestamptz,
  duration_minutes integer,
  status public.mediation_session_status NOT NULL DEFAULT 'scheduled',
  facilitator_id uuid,
  attendee_party_ids uuid[] DEFAULT '{}',
  minutes text,
  outcomes text,
  next_steps text,
  climate_rating integer,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============ DIALOGUE ============
CREATE TABLE public.mediation_dialogue_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.mediation_cases(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.mediation_sessions(id) ON DELETE SET NULL,
  party_id uuid REFERENCES public.mediation_parties(id) ON DELETE SET NULL,
  author_id uuid NOT NULL DEFAULT auth.uid(),
  author_name text,
  entry_type public.mediation_entry_type NOT NULL DEFAULT 'statement',
  content text NOT NULL,
  visibility public.mediation_visibility NOT NULL DEFAULT 'all_members',
  is_flagged boolean NOT NULL DEFAULT false,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============ AGREEMENTS ============
CREATE TABLE public.mediation_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.mediation_cases(id) ON DELETE CASCADE,
  title text NOT NULL,
  agreement_type text NOT NULL DEFAULT 'framework',
  content text,
  version integer NOT NULL DEFAULT 1,
  status public.mediation_agreement_status NOT NULL DEFAULT 'draft',
  effective_date date,
  review_date date,
  compliance_percent integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.mediation_agreement_clauses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid NOT NULL REFERENCES public.mediation_agreements(id) ON DELETE CASCADE,
  case_id uuid NOT NULL REFERENCES public.mediation_cases(id) ON DELETE CASCADE,
  clause_number text,
  title text NOT NULL,
  clause_text text,
  responsible_party_id uuid REFERENCES public.mediation_parties(id) ON DELETE SET NULL,
  due_date date,
  status public.mediation_clause_status NOT NULL DEFAULT 'pending',
  completion_percent integer NOT NULL DEFAULT 0,
  verification_note text,
  verified_by uuid,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.mediation_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid NOT NULL REFERENCES public.mediation_agreements(id) ON DELETE CASCADE,
  case_id uuid NOT NULL REFERENCES public.mediation_cases(id) ON DELETE CASCADE,
  party_id uuid REFERENCES public.mediation_parties(id) ON DELETE SET NULL,
  signatory_name text NOT NULL,
  signatory_title text,
  signed_by uuid DEFAULT auth.uid(),
  signed_at timestamptz NOT NULL DEFAULT now(),
  signature_hash text,
  notes text,
  UNIQUE (agreement_id, party_id)
);

-- ============ DOCUMENTS & MILESTONES ============
CREATE TABLE public.mediation_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.mediation_cases(id) ON DELETE CASCADE,
  title text NOT NULL,
  doc_type text NOT NULL DEFAULT 'supporting',
  file_url text,
  description text,
  visibility public.mediation_visibility NOT NULL DEFAULT 'all_members',
  uploaded_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.mediation_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.mediation_cases(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  phase public.mediation_case_status,
  order_index integer NOT NULL DEFAULT 0,
  due_date date,
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'pending',
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============ GRANTS ============
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mediation_cases TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mediation_case_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mediation_parties TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mediation_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mediation_dialogue_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mediation_agreements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mediation_agreement_clauses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mediation_signatures TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mediation_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mediation_milestones TO authenticated;
GRANT SELECT ON public.mediation_cases TO anon;
GRANT ALL ON public.mediation_cases TO service_role;
GRANT ALL ON public.mediation_case_members TO service_role;
GRANT ALL ON public.mediation_parties TO service_role;
GRANT ALL ON public.mediation_sessions TO service_role;
GRANT ALL ON public.mediation_dialogue_entries TO service_role;
GRANT ALL ON public.mediation_agreements TO service_role;
GRANT ALL ON public.mediation_agreement_clauses TO service_role;
GRANT ALL ON public.mediation_signatures TO service_role;
GRANT ALL ON public.mediation_documents TO service_role;
GRANT ALL ON public.mediation_milestones TO service_role;

-- ============ RLS ============
ALTER TABLE public.mediation_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mediation_case_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mediation_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mediation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mediation_dialogue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mediation_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mediation_agreement_clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mediation_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mediation_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mediation_milestones ENABLE ROW LEVEL SECURITY;

-- cases
CREATE POLICY "Public cases are viewable" ON public.mediation_cases FOR SELECT USING (is_public = true);
CREATE POLICY "Members can view their cases" ON public.mediation_cases FOR SELECT TO authenticated
  USING (public.is_mediation_member(id, auth.uid()) OR created_by = auth.uid());
CREATE POLICY "Mediators and partners can create cases" ON public.mediation_cases FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND public.has_any_role(auth.uid(), ARRAY['admin','government','partner','verifier']::app_role[]));
CREATE POLICY "Facilitators can update cases" ON public.mediation_cases FOR UPDATE TO authenticated
  USING (public.is_mediation_facilitator(id, auth.uid()) OR created_by = auth.uid());
CREATE POLICY "Admins can delete cases" ON public.mediation_cases FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- members
CREATE POLICY "Members can view case membership" ON public.mediation_case_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_mediation_member(case_id, auth.uid()));
CREATE POLICY "Facilitators can add members" ON public.mediation_case_members FOR INSERT TO authenticated
  WITH CHECK (public.is_mediation_facilitator(case_id, auth.uid())
    OR EXISTS (SELECT 1 FROM public.mediation_cases c WHERE c.id = case_id AND c.created_by = auth.uid()));
CREATE POLICY "Facilitators can update members" ON public.mediation_case_members FOR UPDATE TO authenticated
  USING (public.is_mediation_facilitator(case_id, auth.uid()));
CREATE POLICY "Facilitators can remove members" ON public.mediation_case_members FOR DELETE TO authenticated
  USING (public.is_mediation_facilitator(case_id, auth.uid()));

-- parties
CREATE POLICY "Members can view parties" ON public.mediation_parties FOR SELECT TO authenticated
  USING (public.is_mediation_member(case_id, auth.uid()));
CREATE POLICY "Facilitators manage parties insert" ON public.mediation_parties FOR INSERT TO authenticated
  WITH CHECK (public.is_mediation_facilitator(case_id, auth.uid()));
CREATE POLICY "Facilitators manage parties update" ON public.mediation_parties FOR UPDATE TO authenticated
  USING (public.is_mediation_facilitator(case_id, auth.uid()));
CREATE POLICY "Facilitators manage parties delete" ON public.mediation_parties FOR DELETE TO authenticated
  USING (public.is_mediation_facilitator(case_id, auth.uid()));

-- sessions
CREATE POLICY "Members can view sessions" ON public.mediation_sessions FOR SELECT TO authenticated
  USING (public.is_mediation_member(case_id, auth.uid()));
CREATE POLICY "Facilitators create sessions" ON public.mediation_sessions FOR INSERT TO authenticated
  WITH CHECK (public.is_mediation_facilitator(case_id, auth.uid()));
CREATE POLICY "Facilitators update sessions" ON public.mediation_sessions FOR UPDATE TO authenticated
  USING (public.is_mediation_facilitator(case_id, auth.uid()));
CREATE POLICY "Facilitators delete sessions" ON public.mediation_sessions FOR DELETE TO authenticated
  USING (public.is_mediation_facilitator(case_id, auth.uid()));

-- dialogue
CREATE POLICY "Members can view dialogue" ON public.mediation_dialogue_entries FOR SELECT TO authenticated
  USING (public.is_mediation_member(case_id, auth.uid())
    AND (visibility <> 'mediators_only' OR public.is_mediation_facilitator(case_id, auth.uid())));
CREATE POLICY "Members can post dialogue" ON public.mediation_dialogue_entries FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND public.is_mediation_member(case_id, auth.uid()));
CREATE POLICY "Authors and facilitators update dialogue" ON public.mediation_dialogue_entries FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR public.is_mediation_facilitator(case_id, auth.uid()));
CREATE POLICY "Authors and facilitators delete dialogue" ON public.mediation_dialogue_entries FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR public.is_mediation_facilitator(case_id, auth.uid()));

-- agreements
CREATE POLICY "Members can view agreements" ON public.mediation_agreements FOR SELECT TO authenticated
  USING (public.is_mediation_member(case_id, auth.uid()));
CREATE POLICY "Facilitators create agreements" ON public.mediation_agreements FOR INSERT TO authenticated
  WITH CHECK (public.is_mediation_facilitator(case_id, auth.uid()));
CREATE POLICY "Facilitators update agreements" ON public.mediation_agreements FOR UPDATE TO authenticated
  USING (public.is_mediation_facilitator(case_id, auth.uid()));
CREATE POLICY "Facilitators delete agreements" ON public.mediation_agreements FOR DELETE TO authenticated
  USING (public.is_mediation_facilitator(case_id, auth.uid()));

-- clauses
CREATE POLICY "Members can view clauses" ON public.mediation_agreement_clauses FOR SELECT TO authenticated
  USING (public.is_mediation_member(case_id, auth.uid()));
CREATE POLICY "Facilitators create clauses" ON public.mediation_agreement_clauses FOR INSERT TO authenticated
  WITH CHECK (public.is_mediation_facilitator(case_id, auth.uid()));
CREATE POLICY "Facilitators update clauses" ON public.mediation_agreement_clauses FOR UPDATE TO authenticated
  USING (public.is_mediation_facilitator(case_id, auth.uid()));
CREATE POLICY "Facilitators delete clauses" ON public.mediation_agreement_clauses FOR DELETE TO authenticated
  USING (public.is_mediation_facilitator(case_id, auth.uid()));

-- signatures
CREATE POLICY "Members can view signatures" ON public.mediation_signatures FOR SELECT TO authenticated
  USING (public.is_mediation_member(case_id, auth.uid()));
CREATE POLICY "Members can sign" ON public.mediation_signatures FOR INSERT TO authenticated
  WITH CHECK (signed_by = auth.uid() AND public.is_mediation_member(case_id, auth.uid()));
CREATE POLICY "Facilitators delete signatures" ON public.mediation_signatures FOR DELETE TO authenticated
  USING (public.is_mediation_facilitator(case_id, auth.uid()));

-- documents
CREATE POLICY "Members can view documents" ON public.mediation_documents FOR SELECT TO authenticated
  USING (public.is_mediation_member(case_id, auth.uid())
    AND (visibility <> 'mediators_only' OR public.is_mediation_facilitator(case_id, auth.uid())));
CREATE POLICY "Members can upload documents" ON public.mediation_documents FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid() AND public.is_mediation_member(case_id, auth.uid()));
CREATE POLICY "Uploaders and facilitators update documents" ON public.mediation_documents FOR UPDATE TO authenticated
  USING (uploaded_by = auth.uid() OR public.is_mediation_facilitator(case_id, auth.uid()));
CREATE POLICY "Uploaders and facilitators delete documents" ON public.mediation_documents FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid() OR public.is_mediation_facilitator(case_id, auth.uid()));

-- milestones
CREATE POLICY "Members can view milestones" ON public.mediation_milestones FOR SELECT TO authenticated
  USING (public.is_mediation_member(case_id, auth.uid()));
CREATE POLICY "Facilitators create milestones" ON public.mediation_milestones FOR INSERT TO authenticated
  WITH CHECK (public.is_mediation_facilitator(case_id, auth.uid()));
CREATE POLICY "Facilitators update milestones" ON public.mediation_milestones FOR UPDATE TO authenticated
  USING (public.is_mediation_facilitator(case_id, auth.uid()));
CREATE POLICY "Facilitators delete milestones" ON public.mediation_milestones FOR DELETE TO authenticated
  USING (public.is_mediation_facilitator(case_id, auth.uid()));

-- ============ TRIGGERS ============
CREATE TRIGGER trg_mediation_cases_updated BEFORE UPDATE ON public.mediation_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mediation_parties_updated BEFORE UPDATE ON public.mediation_parties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mediation_sessions_updated BEFORE UPDATE ON public.mediation_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mediation_dialogue_updated BEFORE UPDATE ON public.mediation_dialogue_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mediation_agreements_updated BEFORE UPDATE ON public.mediation_agreements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mediation_clauses_updated BEFORE UPDATE ON public.mediation_agreement_clauses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mediation_milestones_updated BEFORE UPDATE ON public.mediation_milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- auto-add creator as lead mediator
CREATE OR REPLACE FUNCTION public.handle_new_mediation_case()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.mediation_case_members (case_id, user_id, member_role, added_by)
  VALUES (NEW.id, NEW.created_by, 'lead_mediator', NEW.created_by)
  ON CONFLICT (case_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_mediation_case_creator AFTER INSERT ON public.mediation_cases
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_mediation_case();

-- indexes
CREATE INDEX idx_mediation_cases_status ON public.mediation_cases(status);
CREATE INDEX idx_mediation_members_user ON public.mediation_case_members(user_id);
CREATE INDEX idx_mediation_parties_case ON public.mediation_parties(case_id);
CREATE INDEX idx_mediation_sessions_case ON public.mediation_sessions(case_id);
CREATE INDEX idx_mediation_dialogue_case ON public.mediation_dialogue_entries(case_id, created_at DESC);
CREATE INDEX idx_mediation_clauses_agreement ON public.mediation_agreement_clauses(agreement_id);
