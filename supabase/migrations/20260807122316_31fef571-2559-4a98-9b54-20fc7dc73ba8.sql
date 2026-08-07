
CREATE TYPE public.mel_plan AS ENUM ('free','starter','professional','enterprise');
CREATE TYPE public.mel_org_role AS ENUM ('owner','admin','mel_manager','field_officer','viewer');
CREATE TYPE public.mel_project_status AS ENUM ('design','baseline','implementation','midline','endline','closed');
CREATE TYPE public.mel_indicator_type AS ENUM ('impact','outcome','output','activity','input');
CREATE TYPE public.mel_submission_status AS ENUM ('pending','verified','flagged','rejected');

CREATE TABLE public.mel_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  org_type text NOT NULL DEFAULT 'ngo',
  country_code text,
  contact_email text,
  logo_url text,
  plan public.mel_plan NOT NULL DEFAULT 'free',
  billing_status text NOT NULL DEFAULT 'trial',
  trial_ends_at timestamptz DEFAULT (now() + interval '30 days'),
  seat_limit integer NOT NULL DEFAULT 3,
  project_limit integer NOT NULL DEFAULT 1,
  submission_limit integer NOT NULL DEFAULT 500,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.mel_org_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.mel_organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  org_role public.mel_org_role NOT NULL DEFAULT 'viewer',
  is_active boolean NOT NULL DEFAULT true,
  invited_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);

CREATE OR REPLACE FUNCTION public.is_mel_member(_org_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.mel_org_members WHERE org_id = _org_id AND user_id = _user_id AND is_active = true)
     OR public.has_role(_user_id, 'admin')
$$;

CREATE OR REPLACE FUNCTION public.is_mel_manager(_org_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.mel_org_members WHERE org_id = _org_id AND user_id = _user_id AND is_active = true
                 AND org_role IN ('owner','admin','mel_manager'))
     OR public.has_role(_user_id, 'admin')
$$;

CREATE TABLE public.mel_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.mel_organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  description text,
  donor text,
  budget_amount numeric,
  budget_currency text DEFAULT 'USD',
  status public.mel_project_status NOT NULL DEFAULT 'design',
  theory_of_change text,
  country_code text,
  locations text[] DEFAULT '{}',
  start_date date,
  end_date date,
  target_beneficiaries integer,
  reached_beneficiaries integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.mel_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.mel_projects(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.mel_organizations(id) ON DELETE CASCADE,
  code text,
  name text NOT NULL,
  definition text,
  indicator_type public.mel_indicator_type NOT NULL DEFAULT 'outcome',
  unit text DEFAULT 'count',
  baseline_value numeric DEFAULT 0,
  target_value numeric,
  current_value numeric DEFAULT 0,
  frequency text DEFAULT 'quarterly',
  data_source text,
  disaggregation text[] DEFAULT '{}',
  sdg_alignment text[] DEFAULT '{}',
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.mel_indicator_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id uuid NOT NULL REFERENCES public.mel_indicators(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.mel_organizations(id) ON DELETE CASCADE,
  period_label text NOT NULL,
  measured_value numeric NOT NULL,
  measured_on date NOT NULL DEFAULT current_date,
  phase text DEFAULT 'monitoring',
  notes text,
  disaggregation_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  recorded_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.mel_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.mel_projects(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.mel_organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  phase text NOT NULL DEFAULT 'monitoring',
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  linked_indicator_id uuid REFERENCES public.mel_indicators(id) ON DELETE SET NULL,
  is_public boolean NOT NULL DEFAULT false,
  allow_offline boolean NOT NULL DEFAULT true,
  public_token text UNIQUE DEFAULT encode(gen_random_bytes(12),'hex'),
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.mel_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.mel_forms(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.mel_projects(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.mel_organizations(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  respondent_gender text,
  respondent_age_group text,
  location_name text,
  latitude numeric,
  longitude numeric,
  channel text NOT NULL DEFAULT 'online',
  collected_offline boolean NOT NULL DEFAULT false,
  collected_at timestamptz NOT NULL DEFAULT now(),
  synced_at timestamptz,
  status public.mel_submission_status NOT NULL DEFAULT 'pending',
  submitted_by uuid DEFAULT auth.uid(),
  verified_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- GRANTS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mel_organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mel_org_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mel_projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mel_indicators TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mel_indicator_measurements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mel_forms TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mel_submissions TO authenticated;
GRANT SELECT ON public.mel_forms TO anon;
GRANT INSERT ON public.mel_submissions TO anon;
GRANT ALL ON public.mel_organizations TO service_role;
GRANT ALL ON public.mel_org_members TO service_role;
GRANT ALL ON public.mel_projects TO service_role;
GRANT ALL ON public.mel_indicators TO service_role;
GRANT ALL ON public.mel_indicator_measurements TO service_role;
GRANT ALL ON public.mel_forms TO service_role;
GRANT ALL ON public.mel_submissions TO service_role;

ALTER TABLE public.mel_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mel_org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mel_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mel_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mel_indicator_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mel_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mel_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view org" ON public.mel_organizations FOR SELECT TO authenticated
  USING (public.is_mel_member(id, auth.uid()) OR created_by = auth.uid());
CREATE POLICY "Users create org" ON public.mel_organizations FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "Managers update org" ON public.mel_organizations FOR UPDATE TO authenticated
  USING (public.is_mel_manager(id, auth.uid()) OR created_by = auth.uid());
CREATE POLICY "Admins delete org" ON public.mel_organizations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members view org members" ON public.mel_org_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_mel_member(org_id, auth.uid()));
CREATE POLICY "Managers add org members" ON public.mel_org_members FOR INSERT TO authenticated
  WITH CHECK (public.is_mel_manager(org_id, auth.uid())
    OR EXISTS (SELECT 1 FROM public.mel_organizations o WHERE o.id = org_id AND o.created_by = auth.uid()));
CREATE POLICY "Managers update org members" ON public.mel_org_members FOR UPDATE TO authenticated
  USING (public.is_mel_manager(org_id, auth.uid()));
CREATE POLICY "Managers remove org members" ON public.mel_org_members FOR DELETE TO authenticated
  USING (public.is_mel_manager(org_id, auth.uid()));

CREATE POLICY "Members view projects" ON public.mel_projects FOR SELECT TO authenticated
  USING (public.is_mel_member(org_id, auth.uid()));
CREATE POLICY "Managers create projects" ON public.mel_projects FOR INSERT TO authenticated
  WITH CHECK (public.is_mel_manager(org_id, auth.uid()));
CREATE POLICY "Managers update projects" ON public.mel_projects FOR UPDATE TO authenticated
  USING (public.is_mel_manager(org_id, auth.uid()));
CREATE POLICY "Managers delete projects" ON public.mel_projects FOR DELETE TO authenticated
  USING (public.is_mel_manager(org_id, auth.uid()));

CREATE POLICY "Members view indicators" ON public.mel_indicators FOR SELECT TO authenticated
  USING (public.is_mel_member(org_id, auth.uid()));
CREATE POLICY "Managers create indicators" ON public.mel_indicators FOR INSERT TO authenticated
  WITH CHECK (public.is_mel_manager(org_id, auth.uid()));
CREATE POLICY "Managers update indicators" ON public.mel_indicators FOR UPDATE TO authenticated
  USING (public.is_mel_manager(org_id, auth.uid()));
CREATE POLICY "Managers delete indicators" ON public.mel_indicators FOR DELETE TO authenticated
  USING (public.is_mel_manager(org_id, auth.uid()));

CREATE POLICY "Members view measurements" ON public.mel_indicator_measurements FOR SELECT TO authenticated
  USING (public.is_mel_member(org_id, auth.uid()));
CREATE POLICY "Members record measurements" ON public.mel_indicator_measurements FOR INSERT TO authenticated
  WITH CHECK (recorded_by = auth.uid() AND public.is_mel_member(org_id, auth.uid()));
CREATE POLICY "Managers update measurements" ON public.mel_indicator_measurements FOR UPDATE TO authenticated
  USING (public.is_mel_manager(org_id, auth.uid()));
CREATE POLICY "Managers delete measurements" ON public.mel_indicator_measurements FOR DELETE TO authenticated
  USING (public.is_mel_manager(org_id, auth.uid()));

CREATE POLICY "Public forms are readable" ON public.mel_forms FOR SELECT USING (is_public = true AND is_active = true);
CREATE POLICY "Members view forms" ON public.mel_forms FOR SELECT TO authenticated
  USING (public.is_mel_member(org_id, auth.uid()));
CREATE POLICY "Managers create forms" ON public.mel_forms FOR INSERT TO authenticated
  WITH CHECK (public.is_mel_manager(org_id, auth.uid()));
CREATE POLICY "Managers update forms" ON public.mel_forms FOR UPDATE TO authenticated
  USING (public.is_mel_manager(org_id, auth.uid()));
CREATE POLICY "Managers delete forms" ON public.mel_forms FOR DELETE TO authenticated
  USING (public.is_mel_manager(org_id, auth.uid()));

CREATE POLICY "Members view submissions" ON public.mel_submissions FOR SELECT TO authenticated
  USING (public.is_mel_member(org_id, auth.uid()));
CREATE POLICY "Members submit data" ON public.mel_submissions FOR INSERT TO authenticated
  WITH CHECK (public.is_mel_member(org_id, auth.uid()) OR EXISTS (
    SELECT 1 FROM public.mel_forms f WHERE f.id = form_id AND f.is_public = true AND f.is_active = true));
CREATE POLICY "Anonymous can submit to public forms" ON public.mel_submissions FOR INSERT TO anon
  WITH CHECK (EXISTS (SELECT 1 FROM public.mel_forms f WHERE f.id = form_id AND f.is_public = true AND f.is_active = true));
CREATE POLICY "Managers update submissions" ON public.mel_submissions FOR UPDATE TO authenticated
  USING (public.is_mel_manager(org_id, auth.uid()));
CREATE POLICY "Managers delete submissions" ON public.mel_submissions FOR DELETE TO authenticated
  USING (public.is_mel_manager(org_id, auth.uid()));

CREATE TRIGGER trg_mel_org_updated BEFORE UPDATE ON public.mel_organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mel_project_updated BEFORE UPDATE ON public.mel_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mel_indicator_updated BEFORE UPDATE ON public.mel_indicators
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mel_form_updated BEFORE UPDATE ON public.mel_forms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_mel_org()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.mel_org_members (org_id, user_id, org_role, invited_by)
  VALUES (NEW.id, NEW.created_by, 'owner', NEW.created_by)
  ON CONFLICT (org_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_mel_org_creator AFTER INSERT ON public.mel_organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_mel_org();

CREATE INDEX idx_mel_members_user ON public.mel_org_members(user_id);
CREATE INDEX idx_mel_projects_org ON public.mel_projects(org_id);
CREATE INDEX idx_mel_indicators_project ON public.mel_indicators(project_id);
CREATE INDEX idx_mel_submissions_form ON public.mel_submissions(form_id, created_at DESC);
