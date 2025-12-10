-- Create incident_timeline table to track all status changes and events for each incident
CREATE TABLE public.incident_timeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID NOT NULL REFERENCES public.citizen_reports(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'submitted', 'assigned', 'under_review', 'verified', 'rejected', 'escalated', 'resolved', 'action_taken', 'comment'
  event_title TEXT NOT NULL,
  event_description TEXT,
  actor_id UUID REFERENCES auth.users(id),
  actor_name TEXT,
  actor_role TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_incident_timeline_incident_id ON public.incident_timeline(incident_id);
CREATE INDEX idx_incident_timeline_created_at ON public.incident_timeline(created_at);
CREATE INDEX idx_incident_timeline_event_type ON public.incident_timeline(event_type);

-- Enable RLS
ALTER TABLE public.incident_timeline ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view incident timelines for public reports"
ON public.incident_timeline
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.citizen_reports cr 
    WHERE cr.id = incident_id 
    AND (cr.visibility = 'public' OR cr.reporter_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'verifier'::app_role))
  )
);

CREATE POLICY "System can insert timeline events"
ON public.incident_timeline
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage timeline"
ON public.incident_timeline
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to automatically add timeline entry when report is created
CREATE OR REPLACE FUNCTION public.add_initial_timeline_entry()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.incident_timeline (incident_id, event_type, event_title, event_description, metadata)
  VALUES (
    NEW.id,
    'submitted',
    'Report Submitted',
    'Incident report was submitted and logged in the system',
    jsonb_build_object('category', NEW.category, 'severity', NEW.severity_level, 'source', NEW.source)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new reports
CREATE TRIGGER trigger_add_initial_timeline
AFTER INSERT ON public.citizen_reports
FOR EACH ROW
EXECUTE FUNCTION public.add_initial_timeline_entry();

-- Create function to track status changes
CREATE OR REPLACE FUNCTION public.track_incident_status_change()
RETURNS TRIGGER AS $$
DECLARE
  event_title_text TEXT;
  event_desc_text TEXT;
BEGIN
  -- Track status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    CASE NEW.status
      WHEN 'under_review' THEN
        event_title_text := 'Under Review';
        event_desc_text := 'Report is now being reviewed by the verification team';
      WHEN 'verified' THEN
        event_title_text := 'Report Verified';
        event_desc_text := 'Report has been verified and confirmed';
      WHEN 'escalated' THEN
        event_title_text := 'Report Escalated';
        event_desc_text := 'Report has been escalated for urgent attention';
      WHEN 'resolved' THEN
        event_title_text := 'Report Resolved';
        event_desc_text := 'Incident has been resolved and closed';
      ELSE
        event_title_text := 'Status Updated';
        event_desc_text := 'Report status changed to ' || NEW.status;
    END CASE;
    
    INSERT INTO public.incident_timeline (incident_id, event_type, event_title, event_description, metadata)
    VALUES (NEW.id, NEW.status, event_title_text, event_desc_text, jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status));
  END IF;
  
  -- Track verification status changes
  IF OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN
    CASE NEW.verification_status
      WHEN 'pending_verification' THEN
        event_title_text := 'Verification Pending';
        event_desc_text := 'Report is pending verification';
      WHEN 'verified' THEN
        event_title_text := 'Verification Complete';
        event_desc_text := 'Report has been verified by the verification team';
      WHEN 'rejected' THEN
        event_title_text := 'Verification Rejected';
        event_desc_text := 'Report could not be verified';
      ELSE
        event_title_text := 'Verification Status Updated';
        event_desc_text := 'Verification status changed to ' || NEW.verification_status;
    END CASE;
    
    INSERT INTO public.incident_timeline (incident_id, event_type, event_title, event_description, actor_id, metadata)
    VALUES (NEW.id, 'verification_' || NEW.verification_status, event_title_text, event_desc_text, NEW.verified_by, 
      jsonb_build_object('old_status', OLD.verification_status, 'new_status', NEW.verification_status));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for status changes
CREATE TRIGGER trigger_track_incident_status
AFTER UPDATE ON public.citizen_reports
FOR EACH ROW
EXECUTE FUNCTION public.track_incident_status_change();

-- Backfill existing reports with initial timeline entries
INSERT INTO public.incident_timeline (incident_id, event_type, event_title, event_description, created_at, metadata)
SELECT 
  id,
  'submitted',
  'Report Submitted',
  'Incident report was submitted and logged in the system',
  created_at,
  jsonb_build_object('category', category, 'severity', severity_level, 'source', source)
FROM public.citizen_reports
WHERE id NOT IN (SELECT DISTINCT incident_id FROM public.incident_timeline WHERE event_type = 'submitted');

-- Add timeline entries for existing status changes based on current status
INSERT INTO public.incident_timeline (incident_id, event_type, event_title, event_description, created_at, metadata)
SELECT 
  id,
  status,
  CASE status
    WHEN 'under_review' THEN 'Under Review'
    WHEN 'verified' THEN 'Report Verified'
    WHEN 'escalated' THEN 'Report Escalated'
    WHEN 'resolved' THEN 'Report Resolved'
    ELSE 'Status Updated'
  END,
  CASE status
    WHEN 'under_review' THEN 'Report is being reviewed by the verification team'
    WHEN 'verified' THEN 'Report has been verified and confirmed'
    WHEN 'escalated' THEN 'Report has been escalated for urgent attention'
    WHEN 'resolved' THEN 'Incident has been resolved and closed'
    ELSE 'Report status changed'
  END,
  COALESCE(updated_at, created_at),
  jsonb_build_object('status', status)
FROM public.citizen_reports
WHERE status != 'pending'
AND id NOT IN (SELECT DISTINCT incident_id FROM public.incident_timeline WHERE event_type = status);

-- Add timeline entries for verification status
INSERT INTO public.incident_timeline (incident_id, event_type, event_title, event_description, created_at, actor_id, metadata)
SELECT 
  id,
  'verification_' || verification_status,
  CASE verification_status
    WHEN 'verified' THEN 'Verification Complete'
    WHEN 'pending_verification' THEN 'Verification Pending'
    WHEN 'rejected' THEN 'Verification Rejected'
    ELSE 'Verification Status Updated'
  END,
  CASE verification_status
    WHEN 'verified' THEN 'Report has been verified by the verification team'
    WHEN 'pending_verification' THEN 'Report is pending verification'
    WHEN 'rejected' THEN 'Report could not be verified'
    ELSE 'Verification status changed'
  END,
  COALESCE(verified_at, updated_at, created_at),
  verified_by,
  jsonb_build_object('verification_status', verification_status)
FROM public.citizen_reports
WHERE verification_status NOT IN ('unverified', 'pending')
AND id NOT IN (SELECT DISTINCT incident_id FROM public.incident_timeline WHERE event_type = 'verification_' || verification_status);

-- Enable realtime for timeline
ALTER PUBLICATION supabase_realtime ADD TABLE public.incident_timeline;