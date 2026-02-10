
-- Fix: only add tables not already in realtime publication
DO $$
BEGIN
  -- election_incidents already added, skip it
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'election_results'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.election_results;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'election_observers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.election_observers;
  END IF;
END $$;
