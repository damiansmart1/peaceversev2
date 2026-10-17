ALTER TABLE public.citizen_reports ADD COLUMN IF NOT EXISTS ai_credibility_score integer;

COMMENT ON COLUMN public.citizen_reports.ai_credibility_score IS 'AI credibility score on a 0-100 scale. Replaces credibility_score, whose numeric(3,2) type cannot hold 0-100 values.';

COMMENT ON COLUMN public.citizen_reports.credibility_score IS 'DEPRECATED for 0-100 AI credibility values — use ai_credibility_score. The legacy column cannot store values above 9.99.';

CREATE INDEX IF NOT EXISTS idx_citizen_reports_ai_credibility
  ON public.citizen_reports (ai_credibility_score);