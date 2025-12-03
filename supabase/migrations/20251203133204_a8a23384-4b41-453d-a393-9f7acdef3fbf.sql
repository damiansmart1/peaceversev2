-- Enable realtime for alert_logs table (using IF NOT EXISTS pattern)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'alert_logs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.alert_logs;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'incident_risk_scores'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.incident_risk_scores;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'predictive_hotspots'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.predictive_hotspots;
    END IF;
END $$;

-- Set REPLICA IDENTITY FULL for complete row data
ALTER TABLE public.alert_logs REPLICA IDENTITY FULL;
ALTER TABLE public.incident_risk_scores REPLICA IDENTITY FULL;
ALTER TABLE public.predictive_hotspots REPLICA IDENTITY FULL;
ALTER TABLE public.citizen_reports REPLICA IDENTITY FULL;