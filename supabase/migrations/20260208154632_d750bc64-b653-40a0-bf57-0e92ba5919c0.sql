-- Fix: Skip audit logging for DELETE operations on the elections table
-- (cascade will already remove audit_log entries, and re-inserting would violate FK)
CREATE OR REPLACE FUNCTION public.log_election_action()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_election_id uuid;
BEGIN
  -- Skip audit logging for DELETE on elections table
  -- because CASCADE will delete audit_log entries and re-inserting would violate FK
  IF TG_TABLE_NAME = 'elections' AND TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

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
