-- Fix function search path security
DROP FUNCTION IF EXISTS increment_report_views(UUID);
CREATE OR REPLACE FUNCTION increment_report_views(report_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.citizen_reports
  SET view_count = view_count + 1,
      last_activity_at = now()
  WHERE id = report_id;
END;
$$;