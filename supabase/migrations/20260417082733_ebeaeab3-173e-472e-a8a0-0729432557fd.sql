-- ============================================================================
-- WORLD-CLASS POLLS & PROPOSALS UPGRADE
-- Aligned with OGP, IAP2 Spectrum, UN SDG 16
-- ============================================================================

-- 1. Extend proposals table with international standards fields
ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS iap2_level TEXT CHECK (iap2_level IN ('inform','consult','involve','collaborate','empower')),
  ADD COLUMN IF NOT EXISTS sdg_indicators TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS voting_method TEXT DEFAULT 'simple' CHECK (voting_method IN ('simple','ranked_choice','quadratic','approval','weighted')),
  ADD COLUMN IF NOT EXISTS voting_options JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS quadratic_credits INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS sponsor_partner_id UUID,
  ADD COLUMN IF NOT EXISTS sponsor_logo_url TEXT,
  ADD COLUMN IF NOT EXISTS sponsor_disclosure TEXT,
  ADD COLUMN IF NOT EXISTS response_required_by TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS response_status TEXT DEFAULT 'awaiting' CHECK (response_status IN ('awaiting','received','reviewing','responded','action_taken','closed_no_action')),
  ADD COLUMN IF NOT EXISTS official_response TEXT,
  ADD COLUMN IF NOT EXISTS official_response_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS official_responder_id UUID,
  ADD COLUMN IF NOT EXISTS action_taken_summary TEXT,
  ADD COLUMN IF NOT EXISTS embed_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS embed_views INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS jurisdiction TEXT,
  ADD COLUMN IF NOT EXISTS region_weight JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS integrity_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_proposals_response_status ON public.proposals(response_status);
CREATE INDEX IF NOT EXISTS idx_proposals_iap2 ON public.proposals(iap2_level);
CREATE INDEX IF NOT EXISTS idx_proposals_embed_token ON public.proposals(embed_token);

-- 2. Advanced votes table (ranked choice / quadratic / approval)
CREATE TABLE IF NOT EXISTS public.proposal_advanced_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  voting_method TEXT NOT NULL,
  ranked_choices JSONB,
  quadratic_allocation JSONB,
  approval_selections TEXT[],
  weight NUMERIC DEFAULT 1.0,
  region TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_method TEXT,
  vote_hash TEXT NOT NULL,
  previous_hash TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (proposal_id, user_id)
);

ALTER TABLE public.proposal_advanced_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own advanced votes" ON public.proposal_advanced_votes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public can view aggregate vote rows" ON public.proposal_advanced_votes
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can cast advanced votes" ON public.proposal_advanced_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own advanced vote" ON public.proposal_advanced_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_adv_votes_proposal ON public.proposal_advanced_votes(proposal_id);

-- 3. Deliberation: structured for/against arguments
CREATE TABLE IF NOT EXISTS public.proposal_arguments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  stance TEXT NOT NULL CHECK (stance IN ('for','against','neutral')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  ai_summary TEXT,
  parent_argument_id UUID REFERENCES public.proposal_arguments(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT false,
  display_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.proposal_arguments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view arguments" ON public.proposal_arguments FOR SELECT USING (true);
CREATE POLICY "Auth users can post arguments" ON public.proposal_arguments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own arguments" ON public.proposal_arguments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own arguments" ON public.proposal_arguments
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Amendments and version history
CREATE TABLE IF NOT EXISTS public.proposal_amendments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  proposed_by UUID NOT NULL,
  version_number INTEGER NOT NULL,
  diff_summary TEXT NOT NULL,
  proposed_title TEXT,
  proposed_description TEXT,
  rationale TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','withdrawn','merged')),
  support_count INTEGER DEFAULT 0,
  oppose_count INTEGER DEFAULT 0,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.proposal_amendments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view amendments" ON public.proposal_amendments FOR SELECT USING (true);
CREATE POLICY "Auth can propose amendments" ON public.proposal_amendments
  FOR INSERT WITH CHECK (auth.uid() = proposed_by);
CREATE POLICY "Proposers update own amendments" ON public.proposal_amendments
  FOR UPDATE USING (auth.uid() = proposed_by);

-- 5. Government response loop
CREATE TABLE IF NOT EXISTS public.proposal_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL,
  responder_role TEXT NOT NULL,
  responder_organization TEXT,
  status TEXT NOT NULL CHECK (status IN ('received','reviewing','responded','action_taken','closed_no_action')),
  response_text TEXT NOT NULL,
  action_plan TEXT,
  action_deadline TIMESTAMPTZ,
  evidence_urls TEXT[] DEFAULT '{}',
  is_official BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.proposal_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view responses" ON public.proposal_responses FOR SELECT USING (true);
CREATE POLICY "Government/admin can post responses" ON public.proposal_responses
  FOR INSERT WITH CHECK (
    auth.uid() = responder_id AND (
      public.has_role(auth.uid(), 'government') OR
      public.has_role(auth.uid(), 'admin') OR
      public.has_role(auth.uid(), 'partner')
    )
  );
CREATE POLICY "Responders can update own responses" ON public.proposal_responses
  FOR UPDATE USING (auth.uid() = responder_id);

-- 6. Partner sponsorships
CREATE TABLE IF NOT EXISTS public.proposal_sponsorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL,
  partner_name TEXT NOT NULL,
  partner_logo_url TEXT,
  sponsorship_type TEXT DEFAULT 'standard' CHECK (sponsorship_type IN ('standard','featured','co_host','funder')),
  disclosure_text TEXT NOT NULL,
  amount_contributed NUMERIC,
  currency TEXT DEFAULT 'USD',
  starts_at TIMESTAMPTZ DEFAULT now(),
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.proposal_sponsorships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view sponsorships" ON public.proposal_sponsorships FOR SELECT USING (true);
CREATE POLICY "Partners create sponsorships" ON public.proposal_sponsorships
  FOR INSERT WITH CHECK (
    auth.uid() = partner_id AND (
      public.has_role(auth.uid(), 'partner') OR
      public.has_role(auth.uid(), 'admin')
    )
  );
CREATE POLICY "Partners manage own sponsorships" ON public.proposal_sponsorships
  FOR UPDATE USING (auth.uid() = partner_id OR public.has_role(auth.uid(), 'admin'));

-- 7. Citizen assemblies
CREATE TABLE IF NOT EXISTS public.citizen_assemblies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  topic TEXT,
  host_organization TEXT,
  co_host_partner_id UUID,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  meeting_url TEXT,
  meeting_format TEXT DEFAULT 'hybrid' CHECK (meeting_format IN ('online','in_person','hybrid')),
  location TEXT,
  max_participants INTEGER DEFAULT 100,
  participant_selection_method TEXT DEFAULT 'random_lottery' CHECK (participant_selection_method IN ('random_lottery','open','stratified','invited')),
  required_demographics JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','registration_open','in_progress','completed','cancelled')),
  outcomes_summary TEXT,
  recording_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.citizen_assemblies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view assemblies" ON public.citizen_assemblies FOR SELECT USING (true);
CREATE POLICY "Partners/gov/admin create assemblies" ON public.citizen_assemblies
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND (
      public.has_role(auth.uid(), 'partner') OR
      public.has_role(auth.uid(), 'government') OR
      public.has_role(auth.uid(), 'admin')
    )
  );
CREATE POLICY "Creators update own assemblies" ON public.citizen_assemblies
  FOR UPDATE USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- 8. Assembly participants
CREATE TABLE IF NOT EXISTS public.assembly_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assembly_id UUID NOT NULL REFERENCES public.citizen_assemblies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  registration_status TEXT DEFAULT 'registered' CHECK (registration_status IN ('registered','selected','waitlisted','attended','no_show','declined')),
  demographic_data JSONB,
  contribution_summary TEXT,
  registered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (assembly_id, user_id)
);

ALTER TABLE public.assembly_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own participation" ON public.assembly_participants
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner') OR public.has_role(auth.uid(), 'government'));
CREATE POLICY "Users register themselves" ON public.assembly_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own registration" ON public.assembly_participants
  FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 9. Webhooks for partner integrations
CREATE TABLE IF NOT EXISTS public.proposal_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL,
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE,
  event_types TEXT[] NOT NULL,
  endpoint_url TEXT NOT NULL,
  secret_token TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.proposal_webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners view own webhooks" ON public.proposal_webhooks
  FOR SELECT USING (auth.uid() = partner_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Partners manage own webhooks" ON public.proposal_webhooks
  FOR ALL USING (auth.uid() = partner_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = partner_id OR public.has_role(auth.uid(), 'admin'));

-- 10. Audit trail with hash-chain integrity
CREATE TABLE IF NOT EXISTS public.proposal_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor_id UUID,
  actor_role TEXT,
  event_data JSONB,
  event_hash TEXT NOT NULL,
  previous_hash TEXT,
  block_number BIGSERIAL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.proposal_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Audit log is public" ON public.proposal_audit_log FOR SELECT USING (true);
CREATE POLICY "System inserts audit entries" ON public.proposal_audit_log
  FOR INSERT WITH CHECK (true);

CREATE INDEX idx_audit_proposal ON public.proposal_audit_log(proposal_id, block_number);

-- 11. Embeddable widget views log
CREATE TABLE IF NOT EXISTS public.proposal_embed_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  embed_token TEXT NOT NULL,
  referrer_domain TEXT,
  viewer_country TEXT,
  viewed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.proposal_embed_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can log embed views" ON public.proposal_embed_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone view embed analytics" ON public.proposal_embed_views FOR SELECT USING (true);

-- 12. SDG 16 indicators tracking
CREATE TABLE IF NOT EXISTS public.sdg16_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_code TEXT NOT NULL,
  indicator_name TEXT NOT NULL,
  description TEXT,
  metric_value NUMERIC,
  measurement_period TEXT,
  jurisdiction TEXT,
  data_source TEXT,
  last_updated TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sdg16_indicators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read SDG indicators" ON public.sdg16_indicators FOR SELECT USING (true);
CREATE POLICY "Admin manage SDG indicators" ON public.sdg16_indicators FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger: auto-generate embed_token on proposal create
CREATE OR REPLACE FUNCTION public.generate_embed_token()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.embed_token IS NULL THEN
    NEW.embed_token := encode(gen_random_bytes(16), 'hex');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_proposal_embed_token ON public.proposals;
CREATE TRIGGER trg_proposal_embed_token
  BEFORE INSERT ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.generate_embed_token();

-- Backfill embed tokens
UPDATE public.proposals SET embed_token = encode(gen_random_bytes(16), 'hex') WHERE embed_token IS NULL;

-- Updated_at triggers
CREATE TRIGGER trg_arguments_updated BEFORE UPDATE ON public.proposal_arguments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_assemblies_updated BEFORE UPDATE ON public.citizen_assemblies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();