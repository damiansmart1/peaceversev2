-- Enable PostGIS extension for geography support
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create comprehensive citizen_reports table with extensive fields
CREATE TABLE IF NOT EXISTS public.citizen_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Basic Information
  title TEXT NOT NULL CHECK (char_length(title) >= 5 AND char_length(title) <= 200),
  description TEXT NOT NULL CHECK (char_length(description) >= 20 AND char_length(description) <= 10000),
  category TEXT NOT NULL CHECK (category IN ('violence', 'displacement', 'human_rights', 'infrastructure', 'health', 'education', 'security', 'environmental', 'economic', 'social', 'other')),
  sub_category TEXT,
  
  -- Incident Details
  incident_date TIMESTAMP WITH TIME ZONE,
  incident_time TIME,
  duration_minutes INTEGER,
  severity_level TEXT CHECK (severity_level IN ('low', 'medium', 'high', 'critical', 'emergency')),
  urgency_level TEXT CHECK (urgency_level IN ('routine', 'priority', 'urgent', 'immediate')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'verified', 'rejected', 'escalated', 'resolved')),
  
  -- People Involved
  estimated_people_affected INTEGER,
  casualties_reported INTEGER,
  injuries_reported INTEGER,
  children_involved BOOLEAN DEFAULT false,
  vulnerable_groups_affected TEXT[],
  
  -- Witness & Contact Information
  has_witnesses BOOLEAN DEFAULT false,
  witness_count INTEGER,
  witness_contact_info JSONB,
  reporter_contact_phone TEXT,
  reporter_contact_email TEXT,
  preferred_contact_method TEXT CHECK (preferred_contact_method IN ('email', 'phone', 'none')),
  
  -- Location Information
  location_latitude NUMERIC(10, 7),
  location_longitude NUMERIC(10, 7),
  location_name TEXT,
  location_address TEXT,
  location_city TEXT,
  location_region TEXT,
  location_country TEXT DEFAULT 'Kenya',
  location_postal_code TEXT,
  location_accuracy TEXT CHECK (location_accuracy IN ('exact', 'approximate', 'general_area', 'unknown')),
  location_type TEXT CHECK (location_type IN ('public_space', 'residential', 'commercial', 'institutional', 'rural', 'urban', 'other')),
  
  -- Evidence & Media
  media_urls TEXT[],
  media_types TEXT[],
  evidence_description TEXT,
  has_physical_evidence BOOLEAN DEFAULT false,
  
  -- Impact Assessment
  immediate_needs TEXT[],
  community_impact_level TEXT CHECK (community_impact_level IN ('minimal', 'moderate', 'significant', 'severe', 'catastrophic')),
  economic_impact_estimate NUMERIC(12, 2),
  infrastructure_damage TEXT[],
  services_disrupted TEXT[],
  
  -- Context & Background
  related_incidents UUID[],
  historical_context TEXT,
  recurring_issue BOOLEAN DEFAULT false,
  first_occurrence BOOLEAN DEFAULT true,
  previous_reports_filed BOOLEAN DEFAULT false,
  
  -- Perpetrators & Responsible Parties
  perpetrator_type TEXT CHECK (perpetrator_type IN ('individual', 'group', 'organization', 'government', 'military', 'police', 'unknown', 'other')),
  perpetrator_description TEXT,
  authorities_notified BOOLEAN DEFAULT false,
  authorities_responded BOOLEAN DEFAULT false,
  authority_response_details TEXT,
  
  -- Actions Taken
  immediate_actions_taken TEXT[],
  community_response TEXT,
  assistance_received BOOLEAN DEFAULT false,
  assistance_type TEXT[],
  assistance_provider TEXT,
  
  -- Follow-up & Resolution
  follow_up_required BOOLEAN DEFAULT true,
  follow_up_contact_consent BOOLEAN DEFAULT false,
  resolution_status TEXT,
  resolution_notes TEXT,
  resolution_date TIMESTAMP WITH TIME ZONE,
  
  -- Verification & Analysis
  credibility_score NUMERIC(3, 2) CHECK (credibility_score >= 0 AND credibility_score <= 1),
  ai_threat_level TEXT,
  ai_sentiment TEXT,
  ai_key_entities JSONB,
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending_verification', 'verified', 'disputed', 'false')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  
  -- Metadata & Privacy
  tags TEXT[],
  is_anonymous BOOLEAN DEFAULT false,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'restricted', 'private', 'confidential')),
  confidential_notes TEXT,
  source TEXT DEFAULT 'citizen_report' CHECK (source IN ('citizen_report', 'partner_org', 'government', 'media', 'other')),
  language TEXT DEFAULT 'en',
  translated_from TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Tracking
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_citizen_reports_reporter ON public.citizen_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_status ON public.citizen_reports(status);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_category ON public.citizen_reports(category);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_severity ON public.citizen_reports(severity_level);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_created_at ON public.citizen_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_incident_date ON public.citizen_reports(incident_date DESC);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_verification ON public.citizen_reports(verification_status);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_tags ON public.citizen_reports USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_location ON public.citizen_reports(location_latitude, location_longitude);

-- Enable Row Level Security
ALTER TABLE public.citizen_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view public reports"
  ON public.citizen_reports FOR SELECT
  USING (visibility = 'public' OR auth.uid() = reporter_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'verifier'));

CREATE POLICY "Authenticated users can create reports"
  ON public.citizen_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id OR is_anonymous = true);

CREATE POLICY "Users can update own reports"
  ON public.citizen_reports FOR UPDATE
  USING (auth.uid() = reporter_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'verifier'));

CREATE POLICY "Admins can delete reports"
  ON public.citizen_reports FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_citizen_reports_updated_at
  BEFORE UPDATE ON public.citizen_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_report_views(report_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.citizen_reports
  SET view_count = view_count + 1,
      last_activity_at = now()
  WHERE id = report_id;
END;
$$;