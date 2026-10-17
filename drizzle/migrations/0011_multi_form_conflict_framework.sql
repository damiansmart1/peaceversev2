-- Feature One: multi-form conflict early warning
ALTER TABLE public.citizen_reports
  ADD COLUMN IF NOT EXISTS conflict_forms text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.citizen_reports.conflict_forms IS 'Plain-language situation types selected by the reporter: physical_violence, threats_intimidation, community_distress, political_hostility, identity_tension, online_harm, discrimination_exclusion, institutional_trust, unsure';

ALTER TABLE public.citizen_reports
  ADD COLUMN IF NOT EXISTS ai_conflict_forms text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.citizen_reports.ai_conflict_forms IS 'Conflict forms detected by AI analysis (provisional indicators).';

ALTER TABLE public.incident_risk_scores
  ADD COLUMN IF NOT EXISTS pattern_signal text;

COMMENT ON COLUMN public.incident_risk_scores.pattern_signal IS 'isolated | recurring | escalating — provisional signal distinguishing isolated disputes from potentially escalating patterns.';

ALTER TABLE public.incident_risk_scores
  ADD COLUMN IF NOT EXISTS human_review_required boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.incident_risk_scores.human_review_required IS 'AI risk scores are provisional indicators; this flag marks whether human review is still required.';

CREATE INDEX IF NOT EXISTS idx_citizen_reports_conflict_forms
  ON public.citizen_reports USING gin (conflict_forms);