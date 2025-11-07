-- Fix RLS policies for incidents table

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Authenticated users can report incidents" ON public.incidents;

-- Create corrected INSERT policy
-- Allow authenticated users to insert their own incidents, or anonymous incidents
CREATE POLICY "Users can report incidents"
ON public.incidents
FOR INSERT
WITH CHECK (
  (is_anonymous = true AND reported_by IS NULL) OR 
  (is_anonymous = false AND auth.uid() IS NOT NULL AND reported_by = auth.uid())
);

-- Update SELECT policy to be more permissive for viewing
DROP POLICY IF EXISTS "Anyone can view incidents" ON public.incidents;

CREATE POLICY "Anyone can view incidents"
ON public.incidents
FOR SELECT
USING (true);

-- Ensure incident_timeline has proper policies
DROP POLICY IF EXISTS "System can insert timeline events" ON public.incident_timeline;

CREATE POLICY "System can insert timeline events"
ON public.incident_timeline
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view timeline" ON public.incident_timeline;

CREATE POLICY "Anyone can view timeline"
ON public.incident_timeline
FOR SELECT
USING (true);