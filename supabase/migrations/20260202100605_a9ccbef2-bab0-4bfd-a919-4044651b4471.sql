
-- =============================================
-- COMPREHENSIVE ELECTION REPORTING SYSTEM
-- Designed for high security, auditability, and accuracy
-- =============================================

-- Election status enum
CREATE TYPE public.election_status AS ENUM (
  'draft',
  'scheduled', 
  'registration',
  'campaigning',
  'voting',
  'counting',
  'verification',
  'certified',
  'disputed',
  'completed'
);

-- Election type enum
CREATE TYPE public.election_type AS ENUM (
  'presidential',
  'parliamentary',
  'gubernatorial',
  'local',
  'referendum',
  'by_election',
  'primary'
);

-- Incident severity for elections
CREATE TYPE public.election_incident_severity AS ENUM (
  'minor',
  'moderate', 
  'serious',
  'critical',
  'emergency'
);

-- Observer role enum
CREATE TYPE public.observer_role AS ENUM (
  'domestic_observer',
  'international_observer',
  'party_agent',
  'media',
  'election_official',
  'security_personnel'
);

-- =============================================
-- CORE ELECTION TABLES
-- =============================================

-- Elections master table
CREATE TABLE public.elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  election_type election_type NOT NULL,
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  regions TEXT[] DEFAULT '{}',
  
  -- Dates
  registration_start DATE,
  registration_end DATE,
  campaign_start DATE,
  campaign_end DATE,
  voting_date DATE NOT NULL,
  voting_end_date DATE,
  
  -- Status and metadata
  status election_status DEFAULT 'draft',
  is_active BOOLEAN DEFAULT true,
  total_registered_voters INTEGER DEFAULT 0,
  total_polling_stations INTEGER DEFAULT 0,
  
  -- Configuration
  config JSONB DEFAULT '{}',
  candidates JSONB DEFAULT '[]',
  political_parties JSONB DEFAULT '[]',
  
  -- Security
  verification_required BOOLEAN DEFAULT true,
  multi_signature_required BOOLEAN DEFAULT true,
  min_signatures_required INTEGER DEFAULT 2,
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  certified_by UUID REFERENCES auth.users(id),
  certified_at TIMESTAMPTZ
);

-- Polling stations
CREATE TABLE public.polling_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE NOT NULL,
  
  -- Identification
  station_code TEXT NOT NULL,
  station_name TEXT NOT NULL,
  
  -- Location
  country_code TEXT NOT NULL,
  region TEXT,
  district TEXT,
  constituency TEXT,
  ward TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Capacity
  registered_voters INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_accessible BOOLEAN DEFAULT true,
  accessibility_notes TEXT,
  
  -- Equipment and setup
  equipment_status JSONB DEFAULT '{}',
  setup_verified BOOLEAN DEFAULT false,
  setup_verified_by UUID REFERENCES auth.users(id),
  setup_verified_at TIMESTAMPTZ,
  
  -- Operations
  opened_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(election_id, station_code)
);

-- Election observers
CREATE TABLE public.election_observers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  
  -- Personal info
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  organization TEXT,
  
  -- Accreditation
  observer_role observer_role NOT NULL,
  accreditation_number TEXT,
  accreditation_status TEXT DEFAULT 'pending',
  accredited_by UUID REFERENCES auth.users(id),
  accredited_at TIMESTAMPTZ,
  
  -- Assignment
  assigned_stations UUID[] DEFAULT '{}',
  assigned_regions TEXT[] DEFAULT '{}',
  
  -- Verification
  id_verified BOOLEAN DEFAULT false,
  training_completed BOOLEAN DEFAULT false,
  oath_signed BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  deployment_status TEXT DEFAULT 'undeployed',
  current_location JSONB,
  last_check_in TIMESTAMPTZ,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Election incidents (specialized for elections)
CREATE TABLE public.election_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE NOT NULL,
  polling_station_id UUID REFERENCES public.polling_stations(id),
  
  -- Reporter
  reported_by UUID REFERENCES auth.users(id),
  reporter_role observer_role,
  is_anonymous BOOLEAN DEFAULT false,
  
  -- Incident details
  incident_code TEXT UNIQUE DEFAULT 'EI-' || substr(gen_random_uuid()::text, 1, 8),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  sub_category TEXT,
  severity election_incident_severity NOT NULL,
  
  -- Location
  country_code TEXT NOT NULL,
  region TEXT,
  district TEXT,
  location_address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Timing
  incident_datetime TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  
  -- Evidence
  media_urls TEXT[] DEFAULT '{}',
  evidence_description TEXT,
  has_witnesses BOOLEAN DEFAULT false,
  witness_count INTEGER DEFAULT 0,
  
  -- Impact
  people_affected INTEGER,
  voting_disrupted BOOLEAN DEFAULT false,
  disruption_duration_minutes INTEGER,
  
  -- Resolution
  status TEXT DEFAULT 'reported',
  resolution_status TEXT,
  resolution_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  
  -- Verification
  verification_status TEXT DEFAULT 'pending',
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,
  credibility_score DECIMAL(3, 2),
  
  -- Security flags
  requires_immediate_action BOOLEAN DEFAULT false,
  escalated BOOLEAN DEFAULT false,
  escalated_to UUID[] DEFAULT '{}',
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Election results (with multi-signature verification)
CREATE TABLE public.election_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE NOT NULL,
  polling_station_id UUID REFERENCES public.polling_stations(id) NOT NULL,
  
  -- Vote counts
  total_registered INTEGER NOT NULL,
  total_votes_cast INTEGER NOT NULL,
  valid_votes INTEGER NOT NULL,
  rejected_votes INTEGER NOT NULL,
  
  -- Results by candidate/party
  results_data JSONB NOT NULL DEFAULT '{}',
  
  -- Turnout
  turnout_percentage DECIMAL(5, 2),
  
  -- Verification chain
  submitted_by UUID REFERENCES auth.users(id) NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  
  -- Signatures (multi-party verification)
  signatures JSONB DEFAULT '[]',
  signature_count INTEGER DEFAULT 0,
  fully_verified BOOLEAN DEFAULT false,
  
  -- Status
  status TEXT DEFAULT 'submitted',
  contested BOOLEAN DEFAULT false,
  contest_reason TEXT,
  
  -- Document reference
  result_form_url TEXT,
  form_image_urls TEXT[] DEFAULT '{}',
  
  -- Integrity
  hash_value TEXT,
  previous_hash TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Result signatures (for multi-party verification)
CREATE TABLE public.result_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID REFERENCES public.election_results(id) ON DELETE CASCADE NOT NULL,
  
  signer_id UUID REFERENCES auth.users(id) NOT NULL,
  signer_role observer_role NOT NULL,
  signer_organization TEXT,
  
  signature_type TEXT NOT NULL,
  signature_hash TEXT,
  signed_at TIMESTAMPTZ DEFAULT now(),
  
  comments TEXT,
  agrees_with_result BOOLEAN DEFAULT true,
  objection_reason TEXT,
  
  ip_address INET,
  device_info JSONB,
  
  UNIQUE(result_id, signer_id)
);

-- Election audit log (immutable)
CREATE TABLE public.election_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE,
  
  action_type TEXT NOT NULL,
  action_details JSONB NOT NULL,
  
  entity_type TEXT NOT NULL,
  entity_id UUID,
  
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMPTZ DEFAULT now(),
  
  ip_address INET,
  user_agent TEXT,
  
  -- Integrity
  previous_log_hash TEXT,
  log_hash TEXT
);

-- Election categories for incident classification
CREATE TABLE public.election_incident_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  severity_default election_incident_severity DEFAULT 'moderate',
  sub_categories TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default election incident categories
INSERT INTO public.election_incident_categories (name, description, severity_default, sub_categories) VALUES
('Voter Intimidation', 'Threats or coercion against voters', 'serious', ARRAY['Physical threats', 'Verbal threats', 'Armed presence', 'Voter harassment']),
('Ballot Irregularities', 'Issues with ballot papers or boxes', 'serious', ARRAY['Missing ballots', 'Pre-marked ballots', 'Ballot stuffing', 'Ballot destruction']),
('Voting Process Issues', 'Problems with voting procedures', 'moderate', ARRAY['Late opening', 'Early closing', 'Queue management', 'Voter turned away']),
('Equipment Failure', 'Technical or equipment problems', 'moderate', ARRAY['Biometric failure', 'Power outage', 'Ink issues', 'Stamp problems']),
('Violence', 'Physical violence or clashes', 'critical', ARRAY['Physical assault', 'Mob violence', 'Property destruction', 'Armed conflict']),
('Vote Buying', 'Attempts to purchase votes', 'serious', ARRAY['Cash distribution', 'Gift distribution', 'Promises made', 'Transport bribery']),
('Observer Obstruction', 'Interference with observers', 'serious', ARRAY['Access denied', 'Threatened', 'Credentials rejected', 'Documents confiscated']),
('Result Manipulation', 'Tampering with results', 'critical', ARRAY['Tally alteration', 'Form falsification', 'Transmission issues', 'Unauthorized access']),
('Campaigning Violation', 'Illegal campaign activities', 'moderate', ARRAY['Campaign materials at station', 'Active campaigning', 'Branded items', 'Party agents campaigning']),
('Media/Communication Issues', 'Problems with media or communications', 'minor', ARRAY['Network blackout', 'Media blocked', 'Journalists threatened', 'Social media manipulation']);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polling_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_observers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_incident_categories ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SECURITY DEFINER FUNCTIONS
-- =============================================

-- Function to check if user is election admin
CREATE OR REPLACE FUNCTION public.is_election_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
    AND role IN ('admin', 'government')
  )
$$;

-- Function to check if user is election observer
CREATE OR REPLACE FUNCTION public.is_election_observer(_user_id UUID, _election_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.election_observers
    WHERE user_id = _user_id
    AND election_id = _election_id
    AND is_active = true
    AND accreditation_status = 'approved'
  )
$$;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Elections policies
CREATE POLICY "Anyone can view active elections" ON public.elections
  FOR SELECT USING (is_active = true AND status != 'draft');

CREATE POLICY "Admins can manage elections" ON public.elections
  FOR ALL USING (public.is_election_admin(auth.uid()));

-- Polling stations policies
CREATE POLICY "Anyone can view polling stations" ON public.polling_stations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage polling stations" ON public.polling_stations
  FOR ALL USING (public.is_election_admin(auth.uid()));

-- Observers policies
CREATE POLICY "Users can view their own observer record" ON public.election_observers
  FOR SELECT USING (user_id = auth.uid() OR public.is_election_admin(auth.uid()));

CREATE POLICY "Admins can manage observers" ON public.election_observers
  FOR ALL USING (public.is_election_admin(auth.uid()));

-- Incidents policies
CREATE POLICY "Anyone can view verified incidents" ON public.election_incidents
  FOR SELECT USING (verification_status = 'verified' OR reported_by = auth.uid() OR public.is_election_admin(auth.uid()));

CREATE POLICY "Authenticated users can report incidents" ON public.election_incidents
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Reporters can update own incidents" ON public.election_incidents
  FOR UPDATE USING (reported_by = auth.uid() OR public.is_election_admin(auth.uid()));

CREATE POLICY "Admins can delete incidents" ON public.election_incidents
  FOR DELETE USING (public.is_election_admin(auth.uid()));

-- Results policies
CREATE POLICY "Anyone can view verified results" ON public.election_results
  FOR SELECT USING (fully_verified = true OR public.is_election_admin(auth.uid()));

CREATE POLICY "Observers can submit results" ON public.election_results
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage results" ON public.election_results
  FOR ALL USING (public.is_election_admin(auth.uid()));

-- Signatures policies
CREATE POLICY "Users can view their own signatures" ON public.result_signatures
  FOR SELECT USING (signer_id = auth.uid() OR public.is_election_admin(auth.uid()));

CREATE POLICY "Authenticated users can sign" ON public.result_signatures
  FOR INSERT WITH CHECK (auth.uid() = signer_id);

-- Audit log policies (read-only for admins)
CREATE POLICY "Admins can view audit logs" ON public.election_audit_log
  FOR SELECT USING (public.is_election_admin(auth.uid()));

-- Categories policies
CREATE POLICY "Anyone can view categories" ON public.election_incident_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.election_incident_categories
  FOR ALL USING (public.is_election_admin(auth.uid()));

-- =============================================
-- TRIGGERS AND FUNCTIONS
-- =============================================

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION public.update_election_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_elections_timestamp
  BEFORE UPDATE ON public.elections
  FOR EACH ROW EXECUTE FUNCTION public.update_election_timestamp();

CREATE TRIGGER update_polling_stations_timestamp
  BEFORE UPDATE ON public.polling_stations
  FOR EACH ROW EXECUTE FUNCTION public.update_election_timestamp();

CREATE TRIGGER update_election_observers_timestamp
  BEFORE UPDATE ON public.election_observers
  FOR EACH ROW EXECUTE FUNCTION public.update_election_timestamp();

CREATE TRIGGER update_election_incidents_timestamp
  BEFORE UPDATE ON public.election_incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_election_timestamp();

CREATE TRIGGER update_election_results_timestamp
  BEFORE UPDATE ON public.election_results
  FOR EACH ROW EXECUTE FUNCTION public.update_election_timestamp();

-- Audit log function
CREATE OR REPLACE FUNCTION public.log_election_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.election_audit_log (
    election_id,
    action_type,
    action_details,
    entity_type,
    entity_id,
    performed_by
  ) VALUES (
    COALESCE(NEW.election_id, OLD.election_id, NEW.id, OLD.id),
    TG_OP,
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'old', CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
      'new', CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END
    ),
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers
CREATE TRIGGER audit_elections
  AFTER INSERT OR UPDATE OR DELETE ON public.elections
  FOR EACH ROW EXECUTE FUNCTION public.log_election_action();

CREATE TRIGGER audit_election_results
  AFTER INSERT OR UPDATE OR DELETE ON public.election_results
  FOR EACH ROW EXECUTE FUNCTION public.log_election_action();

CREATE TRIGGER audit_result_signatures
  AFTER INSERT OR UPDATE OR DELETE ON public.result_signatures
  FOR EACH ROW EXECUTE FUNCTION public.log_election_action();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.elections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.election_incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.election_results;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_elections_country ON public.elections(country_code);
CREATE INDEX idx_elections_status ON public.elections(status);
CREATE INDEX idx_elections_voting_date ON public.elections(voting_date);

CREATE INDEX idx_polling_stations_election ON public.polling_stations(election_id);
CREATE INDEX idx_polling_stations_region ON public.polling_stations(region);

CREATE INDEX idx_election_observers_election ON public.election_observers(election_id);
CREATE INDEX idx_election_observers_user ON public.election_observers(user_id);

CREATE INDEX idx_election_incidents_election ON public.election_incidents(election_id);
CREATE INDEX idx_election_incidents_station ON public.election_incidents(polling_station_id);
CREATE INDEX idx_election_incidents_severity ON public.election_incidents(severity);
CREATE INDEX idx_election_incidents_status ON public.election_incidents(status);

CREATE INDEX idx_election_results_election ON public.election_results(election_id);
CREATE INDEX idx_election_results_station ON public.election_results(polling_station_id);

CREATE INDEX idx_election_audit_log_election ON public.election_audit_log(election_id);
CREATE INDEX idx_election_audit_log_entity ON public.election_audit_log(entity_type, entity_id);
