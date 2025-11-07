-- Create incidents table
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  incident_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'verified', 'escalated', 'in_progress', 'resolved', 'closed')),
  geo_location JSONB,
  location_name TEXT,
  country_code TEXT,
  region TEXT,
  reported_by UUID REFERENCES auth.users(id),
  is_anonymous BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  assigned_to UUID,
  escalated_to UUID,
  priority INTEGER DEFAULT 0,
  affected_population INTEGER,
  related_content_ids UUID[],
  related_proposal_ids UUID[],
  metadata JSONB DEFAULT '{}',
  sentiment_data JSONB,
  ai_analysis JSONB,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create incident_timeline table for tracking changes
CREATE TABLE IF NOT EXISTS public.incident_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  actor_id UUID,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_timeline ENABLE ROW LEVEL SECURITY;

-- RLS Policies for incidents
CREATE POLICY "Anyone can view incidents"
  ON public.incidents
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can report incidents"
  ON public.incidents
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL OR is_anonymous = true);

CREATE POLICY "Admins can update incidents"
  ON public.incidents
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY "Admins can delete incidents"
  ON public.incidents
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for incident_timeline
CREATE POLICY "Anyone can view timeline"
  ON public.incident_timeline
  FOR SELECT
  USING (true);

CREATE POLICY "System can insert timeline events"
  ON public.incident_timeline
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_incidents_status ON public.incidents(status);
CREATE INDEX idx_incidents_severity ON public.incidents(severity);
CREATE INDEX idx_incidents_country ON public.incidents(country_code);
CREATE INDEX idx_incidents_created_at ON public.incidents(created_at DESC);
CREATE INDEX idx_incident_timeline_incident_id ON public.incident_timeline(incident_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();