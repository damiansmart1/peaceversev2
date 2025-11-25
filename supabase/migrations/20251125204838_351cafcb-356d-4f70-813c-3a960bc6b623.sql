-- =====================================================
-- WORLD-CLASS EARLY WARNING SYSTEM - ADVANCED FEATURES
-- =====================================================

-- 1. AUTOMATED RISK SCORING & AI THREAT ASSESSMENT
-- =====================================================
CREATE TABLE IF NOT EXISTS public.incident_risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.citizen_reports(id) ON DELETE CASCADE,
  overall_risk_score NUMERIC(5,2) NOT NULL CHECK (overall_risk_score BETWEEN 0 AND 100),
  threat_level TEXT NOT NULL CHECK (threat_level IN ('low', 'medium', 'high', 'critical', 'imminent')),
  
  -- Risk factor components
  severity_score NUMERIC(5,2) CHECK (severity_score BETWEEN 0 AND 100),
  urgency_score NUMERIC(5,2) CHECK (urgency_score BETWEEN 0 AND 100),
  impact_score NUMERIC(5,2) CHECK (impact_score BETWEEN 0 AND 100),
  escalation_probability NUMERIC(5,2) CHECK (escalation_probability BETWEEN 0 AND 100),
  contagion_risk NUMERIC(5,2) CHECK (contagion_risk BETWEEN 0 AND 100),
  
  -- AI analysis
  ai_confidence NUMERIC(5,2) CHECK (ai_confidence BETWEEN 0 AND 100),
  ai_reasoning JSONB,
  contributing_factors JSONB,
  risk_indicators JSONB,
  
  -- Prediction
  escalation_timeline TEXT, -- e.g., "24-48 hours", "7 days", "immediate"
  predicted_impact_area TEXT[],
  recommended_actions JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  calculated_by TEXT DEFAULT 'ai_system',
  
  UNIQUE(incident_id, created_at)
);

CREATE INDEX idx_risk_scores_incident ON public.incident_risk_scores(incident_id);
CREATE INDEX idx_risk_scores_threat_level ON public.incident_risk_scores(threat_level);
CREATE INDEX idx_risk_scores_overall ON public.incident_risk_scores(overall_risk_score DESC);
CREATE INDEX idx_risk_scores_created ON public.incident_risk_scores(created_at DESC);

-- 2. CROSS-BORDER INCIDENT CORRELATION
-- =====================================================
CREATE TABLE IF NOT EXISTS public.incident_correlations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_incident_id UUID NOT NULL REFERENCES public.citizen_reports(id) ON DELETE CASCADE,
  related_incident_id UUID NOT NULL REFERENCES public.citizen_reports(id) ON DELETE CASCADE,
  
  correlation_type TEXT NOT NULL CHECK (correlation_type IN ('same_actor', 'same_location', 'same_pattern', 'temporal', 'cross_border', 'spillover', 'displacement')),
  correlation_strength NUMERIC(5,2) CHECK (correlation_strength BETWEEN 0 AND 100),
  
  -- Analysis details
  shared_characteristics JSONB,
  geographic_distance_km NUMERIC(10,2),
  temporal_distance_hours INTEGER,
  cross_border BOOLEAN DEFAULT FALSE,
  countries_involved TEXT[],
  
  -- AI insights
  ai_analysis JSONB,
  pattern_detected TEXT,
  escalation_chain BOOLEAN DEFAULT FALSE,
  
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  detected_by TEXT DEFAULT 'ai_correlation_engine',
  
  CONSTRAINT no_self_correlation CHECK (primary_incident_id != related_incident_id),
  UNIQUE(primary_incident_id, related_incident_id)
);

CREATE INDEX idx_correlations_primary ON public.incident_correlations(primary_incident_id);
CREATE INDEX idx_correlations_related ON public.incident_correlations(related_incident_id);
CREATE INDEX idx_correlations_type ON public.incident_correlations(correlation_type);
CREATE INDEX idx_correlations_strength ON public.incident_correlations(correlation_strength DESC);
CREATE INDEX idx_correlations_cross_border ON public.incident_correlations(cross_border) WHERE cross_border = TRUE;

-- 3. PREDICTIVE HOTSPOT ANALYSIS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.predictive_hotspots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Geographic data
  region_name TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  radius_km NUMERIC(10,2) NOT NULL,
  
  -- Risk assessment
  hotspot_score NUMERIC(5,2) NOT NULL CHECK (hotspot_score BETWEEN 0 AND 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'severe', 'critical')),
  
  -- Prediction details
  prediction_window TEXT NOT NULL, -- e.g., "7_days", "14_days", "30_days"
  confidence_level NUMERIC(5,2) CHECK (confidence_level BETWEEN 0 AND 100),
  
  -- Contributing factors
  incident_count_30d INTEGER,
  incident_trend TEXT CHECK (incident_trend IN ('increasing', 'stable', 'decreasing')),
  historical_patterns JSONB,
  seasonal_factors JSONB,
  environmental_factors JSONB,
  socioeconomic_indicators JSONB,
  
  -- AI analysis
  ai_model_used TEXT,
  prediction_factors JSONB,
  similar_historical_events JSONB,
  
  -- Recommendations
  recommended_interventions JSONB,
  monitoring_priority TEXT CHECK (monitoring_priority IN ('low', 'medium', 'high', 'urgent')),
  
  predicted_at TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'monitoring', 'resolved', 'escalated'))
);

CREATE INDEX idx_hotspots_country ON public.predictive_hotspots(country);
CREATE INDEX idx_hotspots_risk_level ON public.predictive_hotspots(risk_level);
CREATE INDEX idx_hotspots_score ON public.predictive_hotspots(hotspot_score DESC);
CREATE INDEX idx_hotspots_valid ON public.predictive_hotspots(valid_until) WHERE status = 'active';
CREATE INDEX idx_hotspots_location ON public.predictive_hotspots(latitude, longitude);

-- 4. REAL-TIME ALERT SYSTEM
-- =====================================================
CREATE TABLE IF NOT EXISTS public.alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Trigger conditions
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('risk_score', 'incident_count', 'hotspot', 'correlation', 'escalation', 'cross_border')),
  threshold_value NUMERIC,
  geographic_scope TEXT[], -- countries or regions
  
  -- Alert configuration
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'alert', 'critical', 'emergency')),
  notification_channels TEXT[] DEFAULT ARRAY['in_app'], -- 'email', 'sms', 'push', 'in_app'
  
  -- Recipients
  recipient_roles TEXT[] DEFAULT ARRAY['admin'], -- 'admin', 'government', 'partner', 'verifier'
  recipient_users UUID[],
  
  -- Throttling
  cooldown_minutes INTEGER DEFAULT 60,
  max_alerts_per_day INTEGER DEFAULT 50,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

CREATE TABLE IF NOT EXISTS public.alert_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  alert_rule_id UUID REFERENCES public.alert_rules(id) ON DELETE SET NULL,
  
  -- Alert details
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  
  -- Context
  incident_ids UUID[],
  hotspot_ids UUID[],
  correlation_ids UUID[],
  
  -- Delivery
  channels_sent TEXT[],
  recipients UUID[],
  
  -- Metadata
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID,
  
  context_data JSONB,
  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'expired'))
);

CREATE INDEX idx_alerts_severity ON public.alert_logs(severity);
CREATE INDEX idx_alerts_triggered ON public.alert_logs(triggered_at DESC);
CREATE INDEX idx_alerts_status ON public.alert_logs(status);

-- 5. EXTERNAL DATA INTEGRATION TRACKING
-- =====================================================
CREATE TABLE IF NOT EXISTS public.external_data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('social_media', 'news', 'weather', 'satellite', 'ngo', 'government')),
  
  -- Configuration
  api_endpoint TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  fetch_frequency_minutes INTEGER DEFAULT 60,
  
  -- Status
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT,
  total_records_fetched INTEGER DEFAULT 0,
  
  -- Metadata
  configuration JSONB,
  credentials_key TEXT, -- reference to secrets
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.external_data_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  source_id UUID NOT NULL REFERENCES public.external_data_sources(id) ON DELETE CASCADE,
  
  -- Record data
  external_id TEXT,
  record_type TEXT NOT NULL,
  content JSONB NOT NULL,
  
  -- Analysis
  relevance_score NUMERIC(5,2),
  linked_incident_ids UUID[],
  ai_extracted_entities JSONB,
  ai_sentiment TEXT,
  
  -- Metadata
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  original_timestamp TIMESTAMPTZ,
  
  geographic_data JSONB,
  
  UNIQUE(source_id, external_id)
);

CREATE INDEX idx_external_records_source ON public.external_data_records(source_id);
CREATE INDEX idx_external_records_fetched ON public.external_data_records(fetched_at DESC);
CREATE INDEX idx_external_records_relevance ON public.external_data_records(relevance_score DESC) WHERE relevance_score IS NOT NULL;

-- 6. NETWORK ANALYSIS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.actor_networks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Network identification
  network_name TEXT,
  network_type TEXT CHECK (network_type IN ('conflict_actors', 'response_organizations', 'affected_communities', 'geographic_cluster')),
  
  -- Entities
  actors JSONB NOT NULL, -- Array of actor entities with metadata
  relationships JSONB NOT NULL, -- Graph of connections
  
  -- Analysis
  centrality_scores JSONB,
  key_actors JSONB,
  influence_map JSONB,
  
  -- Geographic
  primary_locations TEXT[],
  countries_involved TEXT[],
  
  -- Temporal
  first_observed TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  activity_timeline JSONB,
  
  -- Risk
  network_threat_level TEXT CHECK (network_threat_level IN ('low', 'medium', 'high', 'critical')),
  expansion_trend TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_networks_type ON public.actor_networks(network_type);
CREATE INDEX idx_networks_threat ON public.actor_networks(network_threat_level);
CREATE INDEX idx_networks_activity ON public.actor_networks(last_activity DESC);

-- 7. SCENARIO MODELING
-- =====================================================
CREATE TABLE IF NOT EXISTS public.scenario_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Model parameters
  base_incident_id UUID REFERENCES public.citizen_reports(id),
  scenario_type TEXT NOT NULL CHECK (scenario_type IN ('escalation', 'intervention', 'spillover', 'resolution')),
  
  -- Input parameters
  assumptions JSONB NOT NULL,
  variables JSONB NOT NULL,
  time_horizon_days INTEGER NOT NULL,
  
  -- Predictions
  predicted_outcomes JSONB NOT NULL,
  probability_distribution JSONB,
  confidence_intervals JSONB,
  
  -- Impact assessment
  estimated_affected_population INTEGER,
  geographic_impact_areas TEXT[],
  economic_impact_usd NUMERIC(15,2),
  humanitarian_impact_score NUMERIC(5,2),
  
  -- Interventions
  tested_interventions JSONB,
  recommended_interventions JSONB,
  
  -- Metadata
  model_version TEXT,
  ai_model_used TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived'))
);

CREATE INDEX idx_scenarios_type ON public.scenario_models(scenario_type);
CREATE INDEX idx_scenarios_status ON public.scenario_models(status);
CREATE INDEX idx_scenarios_base_incident ON public.scenario_models(base_incident_id);

-- 8. EMERGENCY RESPONSE COORDINATION
-- =====================================================
CREATE TABLE IF NOT EXISTS public.response_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  team_name TEXT NOT NULL,
  organization TEXT NOT NULL,
  team_type TEXT CHECK (team_type IN ('first_responder', 'medical', 'security', 'humanitarian', 'coordination', 'logistics')),
  
  -- Capacity
  team_size INTEGER,
  available_resources JSONB,
  capabilities TEXT[],
  
  -- Location
  base_location TEXT,
  operating_regions TEXT[],
  coverage_radius_km NUMERIC(10,2),
  
  -- Availability
  current_status TEXT DEFAULT 'standby' CHECK (current_status IN ('standby', 'deployed', 'responding', 'offline')),
  availability_schedule JSONB,
  
  -- Contact
  contact_info JSONB NOT NULL,
  emergency_contact TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.response_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  team_id UUID NOT NULL REFERENCES public.response_teams(id),
  incident_id UUID NOT NULL REFERENCES public.citizen_reports(id),
  
  -- Deployment details
  deployment_status TEXT NOT NULL DEFAULT 'planned' CHECK (deployment_status IN ('planned', 'dispatched', 'on_scene', 'completed', 'aborted')),
  
  priority_level TEXT CHECK (priority_level IN ('routine', 'urgent', 'emergency', 'critical')),
  
  -- Timeline
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  dispatched_at TIMESTAMPTZ,
  arrived_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  estimated_arrival TIMESTAMPTZ,
  
  -- Resources
  deployed_personnel INTEGER,
  deployed_resources JSONB,
  
  -- Actions
  actions_taken JSONB,
  outcomes JSONB,
  
  -- Coordination
  coordinating_with UUID[], -- other team IDs
  reporting_to UUID,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deployments_team ON public.response_deployments(team_id);
CREATE INDEX idx_deployments_incident ON public.response_deployments(incident_id);
CREATE INDEX idx_deployments_status ON public.response_deployments(deployment_status);
CREATE INDEX idx_deployments_requested ON public.response_deployments(requested_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

ALTER TABLE public.incident_risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_data_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actor_networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.response_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.response_deployments ENABLE ROW LEVEL SECURITY;

-- Risk scores: Admins, Government, Partners can view
CREATE POLICY "Authorized users can view risk scores"
ON public.incident_risk_scores FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'government'::app_role) OR
  has_role(auth.uid(), 'partner'::app_role)
);

-- Correlations: Same access as risk scores
CREATE POLICY "Authorized users can view correlations"
ON public.incident_correlations FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'government'::app_role) OR
  has_role(auth.uid(), 'partner'::app_role)
);

-- Hotspots: Same access
CREATE POLICY "Authorized users can view hotspots"
ON public.predictive_hotspots FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'government'::app_role) OR
  has_role(auth.uid(), 'partner'::app_role)
);

-- Alert rules: Admin only
CREATE POLICY "Admins can manage alert rules"
ON public.alert_rules FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Alert logs: Recipients can view
CREATE POLICY "Recipients can view alert logs"
ON public.alert_logs FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'government'::app_role) OR
  auth.uid() = ANY(recipients)
);

-- External data: Admin and partners
CREATE POLICY "Authorized users can view external data"
ON public.external_data_sources FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'partner'::app_role)
);

CREATE POLICY "Authorized users can view external records"
ON public.external_data_records FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'partner'::app_role)
);

-- Networks: Government and admin
CREATE POLICY "Authorized users can view networks"
ON public.actor_networks FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'government'::app_role)
);

-- Scenarios: All authenticated users can view
CREATE POLICY "Authenticated users can view scenarios"
ON public.scenario_models FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage scenarios"
ON public.scenario_models FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Response teams: All authenticated can view
CREATE POLICY "Authenticated users can view response teams"
ON public.response_teams FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage response teams"
ON public.response_teams FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Response deployments: All authenticated can view
CREATE POLICY "Authenticated users can view deployments"
ON public.response_deployments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage deployments"
ON public.response_deployments FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_risk_scores_updated_at
BEFORE UPDATE ON public.incident_risk_scores
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_hotspots_updated_at
BEFORE UPDATE ON public.predictive_hotspots
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_alert_rules_updated_at
BEFORE UPDATE ON public.alert_rules
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_external_sources_updated_at
BEFORE UPDATE ON public.external_data_sources
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_networks_updated_at
BEFORE UPDATE ON public.actor_networks
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_response_teams_updated_at
BEFORE UPDATE ON public.response_teams
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_response_deployments_updated_at
BEFORE UPDATE ON public.response_deployments
FOR EACH ROW EXECUTE FUNCTION update_updated_at();