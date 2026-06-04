
-- ============ partner_notes ============
CREATE TABLE public.partner_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_name text,
  title text NOT NULL,
  body text,
  tags text[] DEFAULT '{}',
  is_pinned boolean DEFAULT false,
  related_incident_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_notes TO authenticated;
GRANT ALL ON public.partner_notes TO service_role;
ALTER TABLE public.partner_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view notes" ON public.partner_notes
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'partner') OR
    public.has_role(auth.uid(), 'government') OR
    public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Partners can create notes" ON public.partner_notes
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND (
      public.has_role(auth.uid(), 'partner') OR
      public.has_role(auth.uid(), 'government') OR
      public.has_role(auth.uid(), 'admin')
    )
  );
CREATE POLICY "Authors can update own notes" ON public.partner_notes
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authors can delete own notes" ON public.partner_notes
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- ============ partner_tasks ============
CREATE TABLE public.partner_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_name text,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in_progress','blocked','done')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  due_date date,
  related_incident_id uuid,
  related_hotspot_id uuid,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_tasks TO authenticated;
GRANT ALL ON public.partner_tasks TO service_role;
ALTER TABLE public.partner_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view tasks" ON public.partner_tasks
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'partner') OR
    public.has_role(auth.uid(), 'government') OR
    public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Partners can create tasks" ON public.partner_tasks
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND (
      public.has_role(auth.uid(), 'partner') OR
      public.has_role(auth.uid(), 'government') OR
      public.has_role(auth.uid(), 'admin')
    )
  );
CREATE POLICY "Creators or assignees can update tasks" ON public.partner_tasks
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = created_by OR auth.uid() = assigned_to OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Creators can delete tasks" ON public.partner_tasks
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- ============ partner_interventions ============
CREATE TABLE public.partner_interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_name text NOT NULL,
  programme_name text NOT NULL,
  description text,
  country text,
  region text,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','active','completed','suspended')),
  start_date date,
  end_date date,
  budget_usd numeric(14,2) DEFAULT 0,
  spent_usd numeric(14,2) DEFAULT 0,
  beneficiaries_target integer DEFAULT 0,
  beneficiaries_reached integer DEFAULT 0,
  outcome_summary text,
  sdg_alignment text[] DEFAULT '{}',
  donor text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_interventions TO authenticated;
GRANT ALL ON public.partner_interventions TO service_role;
ALTER TABLE public.partner_interventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view interventions" ON public.partner_interventions
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'partner') OR
    public.has_role(auth.uid(), 'government') OR
    public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Partners can create interventions" ON public.partner_interventions
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND (
      public.has_role(auth.uid(), 'partner') OR
      public.has_role(auth.uid(), 'government') OR
      public.has_role(auth.uid(), 'admin')
    )
  );
CREATE POLICY "Creators can update interventions" ON public.partner_interventions
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Creators can delete interventions" ON public.partner_interventions
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- updated_at triggers
CREATE TRIGGER trg_partner_notes_updated_at BEFORE UPDATE ON public.partner_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_partner_tasks_updated_at BEFORE UPDATE ON public.partner_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_partner_interventions_updated_at BEFORE UPDATE ON public.partner_interventions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- indices
CREATE INDEX idx_partner_notes_org ON public.partner_notes(organization_name);
CREATE INDEX idx_partner_tasks_status ON public.partner_tasks(status);
CREATE INDEX idx_partner_tasks_assigned ON public.partner_tasks(assigned_to);
CREATE INDEX idx_partner_interventions_country ON public.partner_interventions(country);
CREATE INDEX idx_partner_interventions_status ON public.partner_interventions(status);
