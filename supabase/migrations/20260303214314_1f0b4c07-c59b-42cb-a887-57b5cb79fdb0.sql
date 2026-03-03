
-- 1. Observation Checklists (Carter Center methodology)
CREATE TABLE public.observation_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  polling_station_id UUID REFERENCES public.polling_stations(id),
  observer_id UUID REFERENCES public.election_observers(id),
  phase TEXT NOT NULL DEFAULT 'voting',
  checklist_data JSONB NOT NULL DEFAULT '{}',
  overall_rating TEXT,
  notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.observation_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view checklists" ON public.observation_checklists
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert checklists" ON public.observation_checklists
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can update checklists" ON public.observation_checklists
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'government')
  );

-- 2. Observer Check-ins (GPS tracking)
CREATE TABLE public.observer_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  observer_id UUID NOT NULL REFERENCES public.election_observers(id),
  polling_station_id UUID REFERENCES public.polling_stations(id),
  check_type TEXT NOT NULL DEFAULT 'check_in',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy_meters DOUBLE PRECISION,
  device_info JSONB,
  checked_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.observer_check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view check-ins" ON public.observer_check_ins
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert check-ins" ON public.observer_check_ins
  FOR INSERT TO authenticated WITH CHECK (true);

-- 3. Election Anomalies (statistical detection)
CREATE TABLE public.election_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  polling_station_id UUID REFERENCES public.polling_stations(id),
  anomaly_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  description TEXT,
  statistical_data JSONB,
  confidence_score DOUBLE PRECISION,
  status TEXT DEFAULT 'detected',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.election_anomalies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view anomalies" ON public.election_anomalies
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert anomalies" ON public.election_anomalies
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can update anomalies" ON public.election_anomalies
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'verifier')
  );

-- 4. PVT Samples (Parallel Vote Tabulation)
CREATE TABLE public.pvt_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  polling_station_id UUID REFERENCES public.polling_stations(id),
  sample_group TEXT,
  results_data JSONB NOT NULL DEFAULT '{}',
  turnout_data JSONB,
  projected_results JSONB,
  margin_of_error DOUBLE PRECISION,
  confidence_level DOUBLE PRECISION DEFAULT 0.95,
  submitted_by UUID,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pvt_samples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view pvt_samples" ON public.pvt_samples
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert pvt_samples" ON public.pvt_samples
  FOR INSERT TO authenticated WITH CHECK (true);

-- 5. Add gender to observers and geofence to polling stations
ALTER TABLE public.election_observers ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.polling_stations ADD COLUMN IF NOT EXISTS geofence_radius_meters INTEGER DEFAULT 500;

-- 6. Indexes for performance
CREATE INDEX idx_observation_checklists_election ON public.observation_checklists(election_id);
CREATE INDEX idx_observation_checklists_phase ON public.observation_checklists(phase);
CREATE INDEX idx_observer_check_ins_election ON public.observer_check_ins(election_id);
CREATE INDEX idx_observer_check_ins_observer ON public.observer_check_ins(observer_id);
CREATE INDEX idx_election_anomalies_election ON public.election_anomalies(election_id);
CREATE INDEX idx_election_anomalies_type ON public.election_anomalies(anomaly_type);
CREATE INDEX idx_pvt_samples_election ON public.pvt_samples(election_id);
