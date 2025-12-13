-- Create reporter safety analysis table
CREATE TABLE public.reporter_safety_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_reporter_hash TEXT,
  safety_score INTEGER DEFAULT 100 CHECK (safety_score >= 0 AND safety_score <= 100),
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  is_in_danger_zone BOOLEAN DEFAULT false,
  last_known_safe_location JSONB,
  safety_protocols_active TEXT[] DEFAULT '{}',
  threat_indicators JSONB DEFAULT '{}',
  protection_measures TEXT[] DEFAULT '{}',
  last_safety_check TIMESTAMPTZ,
  safety_alerts_enabled BOOLEAN DEFAULT true,
  emergency_contacts JSONB DEFAULT '[]',
  secure_communication_enabled BOOLEAN DEFAULT false,
  location_masking_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create incident pattern analysis table
CREATE TABLE public.incident_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_name TEXT NOT NULL,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('geographic', 'temporal', 'actor', 'method', 'target', 'escalation', 'seasonal', 'cross_border')),
  description TEXT,
  detection_criteria JSONB NOT NULL,
  matched_incidents UUID[] DEFAULT '{}',
  incident_count INTEGER DEFAULT 0,
  countries_affected TEXT[] DEFAULT '{}',
  regions_affected TEXT[] DEFAULT '{}',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  recurrence_frequency TEXT,
  severity_trend TEXT CHECK (severity_trend IN ('escalating', 'stable', 'de-escalating', 'unknown')),
  confidence_score INTEGER DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  ai_analysis JSONB,
  recommendations JSONB,
  is_active BOOLEAN DEFAULT true,
  last_occurrence TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create geographic cluster analysis table
CREATE TABLE public.geographic_clusters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cluster_name TEXT NOT NULL,
  center_latitude DOUBLE PRECISION NOT NULL,
  center_longitude DOUBLE PRECISION NOT NULL,
  radius_km DOUBLE PRECISION NOT NULL,
  incident_count INTEGER DEFAULT 0,
  incident_ids UUID[] DEFAULT '{}',
  primary_category TEXT,
  categories JSONB DEFAULT '{}',
  severity_distribution JSONB DEFAULT '{}',
  average_severity DOUBLE PRECISION,
  cluster_risk_score INTEGER DEFAULT 0 CHECK (cluster_risk_score >= 0 AND cluster_risk_score <= 100),
  affected_population INTEGER,
  countries TEXT[] DEFAULT '{}',
  cities TEXT[] DEFAULT '{}',
  first_incident_date TIMESTAMPTZ,
  last_incident_date TIMESTAMPTZ,
  growth_rate DOUBLE PRECISION,
  is_expanding BOOLEAN DEFAULT false,
  ai_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create perpetrator network analysis table
CREATE TABLE public.perpetrator_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  perpetrator_identifier TEXT NOT NULL,
  perpetrator_type TEXT,
  aliases TEXT[] DEFAULT '{}',
  description TEXT,
  incident_count INTEGER DEFAULT 0,
  linked_incidents UUID[] DEFAULT '{}',
  operating_areas TEXT[] DEFAULT '{}',
  operating_countries TEXT[] DEFAULT '{}',
  modus_operandi TEXT[] DEFAULT '{}',
  target_types TEXT[] DEFAULT '{}',
  threat_level TEXT DEFAULT 'low' CHECK (threat_level IN ('low', 'medium', 'high', 'critical', 'extreme')),
  activity_timeline JSONB DEFAULT '[]',
  first_recorded TIMESTAMPTZ,
  last_activity TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  network_connections TEXT[] DEFAULT '{}',
  ai_profile JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create temporal analysis table
CREATE TABLE public.temporal_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_period TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  country TEXT,
  region TEXT,
  total_incidents INTEGER DEFAULT 0,
  incident_breakdown JSONB DEFAULT '{}',
  peak_hours INTEGER[] DEFAULT '{}',
  peak_days TEXT[] DEFAULT '{}',
  peak_months INTEGER[] DEFAULT '{}',
  category_distribution JSONB DEFAULT '{}',
  severity_distribution JSONB DEFAULT '{}',
  trend_direction TEXT CHECK (trend_direction IN ('increasing', 'stable', 'decreasing')),
  percentage_change DOUBLE PRECISION,
  comparison_period JSONB,
  seasonality_detected BOOLEAN DEFAULT false,
  seasonality_pattern TEXT,
  ai_insights JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create safety alerts table
CREATE TABLE public.safety_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('reporter_at_risk', 'retaliation_warning', 'location_compromised', 'communication_breach', 'witness_protection', 'extraction_needed')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical', 'emergency')),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_hash TEXT,
  incident_id UUID REFERENCES public.citizen_reports(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  threat_details JSONB,
  recommended_actions TEXT[] DEFAULT '{}',
  location_data JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'false_alarm')),
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create data quality metrics table
CREATE TABLE public.data_quality_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES public.citizen_reports(id) ON DELETE CASCADE,
  completeness_score INTEGER DEFAULT 0 CHECK (completeness_score >= 0 AND completeness_score <= 100),
  accuracy_indicators JSONB DEFAULT '{}',
  consistency_score INTEGER DEFAULT 0 CHECK (consistency_score >= 0 AND consistency_score <= 100),
  timeliness_score INTEGER DEFAULT 0 CHECK (timeliness_score >= 0 AND timeliness_score <= 100),
  verification_level TEXT DEFAULT 'unverified' CHECK (verification_level IN ('unverified', 'partially_verified', 'verified', 'cross_referenced')),
  source_reliability TEXT DEFAULT 'unknown' CHECK (source_reliability IN ('unknown', 'new_source', 'occasional', 'regular', 'established', 'trusted')),
  duplicate_probability DOUBLE PRECISION DEFAULT 0,
  potential_duplicates UUID[] DEFAULT '{}',
  anomaly_flags TEXT[] DEFAULT '{}',
  data_gaps TEXT[] DEFAULT '{}',
  enhancement_suggestions TEXT[] DEFAULT '{}',
  overall_quality_score INTEGER DEFAULT 0 CHECK (overall_quality_score >= 0 AND overall_quality_score <= 100),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.reporter_safety_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geographic_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perpetrator_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temporal_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_quality_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies for reporter_safety_profiles (users can only see their own)
CREATE POLICY "Users can view own safety profile" ON public.reporter_safety_profiles
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can update own safety profile" ON public.reporter_safety_profiles
  FOR UPDATE USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage all safety profiles" ON public.reporter_safety_profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true)
  );

-- RLS policies for incident_patterns (viewable by verified roles)
CREATE POLICY "Verified roles can view patterns" ON public.incident_patterns
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'verifier', 'government', 'partner') AND is_active = true)
  );

CREATE POLICY "Admins can manage patterns" ON public.incident_patterns
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true)
  );

-- RLS policies for geographic_clusters
CREATE POLICY "Verified roles can view clusters" ON public.geographic_clusters
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'verifier', 'government', 'partner') AND is_active = true)
  );

CREATE POLICY "Admins can manage clusters" ON public.geographic_clusters
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true)
  );

-- RLS policies for perpetrator_analysis
CREATE POLICY "Verified roles can view perpetrator analysis" ON public.perpetrator_analysis
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'verifier', 'government', 'partner') AND is_active = true)
  );

CREATE POLICY "Admins can manage perpetrator analysis" ON public.perpetrator_analysis
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true)
  );

-- RLS policies for temporal_analysis
CREATE POLICY "Verified roles can view temporal analysis" ON public.temporal_analysis
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'verifier', 'government', 'partner') AND is_active = true)
  );

-- RLS policies for safety_alerts
CREATE POLICY "Users can view own safety alerts" ON public.safety_alerts
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage all safety alerts" ON public.safety_alerts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true)
  );

-- RLS policies for data_quality_metrics
CREATE POLICY "Verified roles can view data quality" ON public.data_quality_metrics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'verifier', 'government', 'partner') AND is_active = true)
  );

-- Create indexes for performance
CREATE INDEX idx_reporter_safety_profiles_reporter ON public.reporter_safety_profiles(reporter_id);
CREATE INDEX idx_reporter_safety_profiles_risk ON public.reporter_safety_profiles(risk_level);
CREATE INDEX idx_incident_patterns_type ON public.incident_patterns(pattern_type);
CREATE INDEX idx_incident_patterns_active ON public.incident_patterns(is_active);
CREATE INDEX idx_geographic_clusters_location ON public.geographic_clusters(center_latitude, center_longitude);
CREATE INDEX idx_perpetrator_analysis_type ON public.perpetrator_analysis(perpetrator_type);
CREATE INDEX idx_temporal_analysis_period ON public.temporal_analysis(start_date, end_date);
CREATE INDEX idx_safety_alerts_status ON public.safety_alerts(status);
CREATE INDEX idx_safety_alerts_reporter ON public.safety_alerts(reporter_id);
CREATE INDEX idx_data_quality_report ON public.data_quality_metrics(report_id);

-- Enable realtime for safety-critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.safety_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reporter_safety_profiles;