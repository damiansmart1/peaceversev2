-- Fix the audit trigger function to handle the elections table correctly
-- The elections table uses 'id' directly, not 'election_id'
CREATE OR REPLACE FUNCTION public.log_election_action()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_election_id uuid;
BEGIN
  -- For the elections table, use the id directly
  -- For other tables, use election_id
  IF TG_TABLE_NAME = 'elections' THEN
    v_election_id := COALESCE(NEW.id, OLD.id);
  ELSE
    v_election_id := COALESCE(NEW.election_id, OLD.election_id);
  END IF;

  INSERT INTO public.election_audit_log (
    election_id,
    action_type,
    action_details,
    entity_type,
    entity_id,
    performed_by
  ) VALUES (
    v_election_id,
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
$$;
