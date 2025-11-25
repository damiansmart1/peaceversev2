-- =====================================================
-- COMPREHENSIVE AI ANALYTICS SYSTEM
-- =====================================================

-- Create AI analysis type enum if not exists
DO $$ BEGIN
  CREATE TYPE public.ai_analysis_type AS ENUM (
    'sentiment',
    'threat_detection',
    'credibility',
    'entity_extraction',
    'tone_classification',
    'anomaly_detection',
    'sentiment_and_threat'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create comprehensive AI analysis logs table
CREATE TABLE IF NOT EXISTS public.ai_analysis_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES public.citizen_reports(id) ON DELETE CASCADE,
  analysis_type ai_analysis_type NOT NULL,
  model_used text NOT NULL,
  model_version text,
  input_data jsonb,
  output_data jsonb NOT NULL,
  confidence_score decimal(5,2),
  processing_time_ms integer,
  detected_entities jsonb,
  sentiment_breakdown jsonb,
  risk_indicators jsonb,
  user_id uuid REFERENCES auth.users(id),
  ip_address text,
  security_flags jsonb DEFAULT '{}',
  validation_status text DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'flagged', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_analysis_logs ENABLE ROW LEVEL SECURITY;

-- Create AI analytics summary table for admin dashboard
CREATE TABLE IF NOT EXISTS public.ai_analytics_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  total_analyses integer DEFAULT 0,
  analysis_type_breakdown jsonb DEFAULT '{}',
  model_usage_stats jsonb DEFAULT '{}',
  average_confidence decimal(5,2),
  average_processing_time_ms integer,
  high_confidence_count integer DEFAULT 0,
  low_confidence_count integer DEFAULT 0,
  flagged_count integer DEFAULT 0,
  critical_detections integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(date)
);

ALTER TABLE public.ai_analytics_summary ENABLE ROW LEVEL SECURITY;

-- Create AI report exports table
CREATE TABLE IF NOT EXISTS public.ai_report_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_by uuid REFERENCES auth.users(id) NOT NULL,
  report_type text NOT NULL,
  filters jsonb DEFAULT '{}',
  date_range jsonb NOT NULL,
  file_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  record_count integer DEFAULT 0,
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

ALTER TABLE public.ai_report_exports ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_logs_report ON public.ai_analysis_logs(report_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_type ON public.ai_analysis_logs(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON public.ai_analysis_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user ON public.ai_analysis_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_confidence ON public.ai_analysis_logs(confidence_score);
CREATE INDEX IF NOT EXISTS idx_ai_summary_date ON public.ai_analytics_summary(date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_exports_user ON public.ai_report_exports(generated_by);
CREATE INDEX IF NOT EXISTS idx_ai_exports_status ON public.ai_report_exports(status);

-- RLS Policies
CREATE POLICY "Admins have full access to AI logs"
  ON public.ai_analysis_logs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view AI analytics summary"
  ON public.ai_analytics_summary FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage AI report exports"
  ON public.ai_report_exports FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = generated_by)
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() = generated_by);

-- Function to update AI analytics summary
CREATE OR REPLACE FUNCTION public.update_ai_analytics_summary()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.ai_analytics_summary (
    date,
    total_analyses,
    analysis_type_breakdown,
    model_usage_stats,
    average_confidence,
    average_processing_time_ms,
    high_confidence_count,
    low_confidence_count,
    flagged_count,
    critical_detections
  )
  SELECT
    CURRENT_DATE as date,
    COUNT(*)::integer as total_analyses,
    jsonb_object_agg(
      COALESCE(analysis_type::text, 'unknown'),
      COUNT(*)::integer
    ) as analysis_type_breakdown,
    jsonb_object_agg(
      COALESCE(model_used, 'unknown'),
      COUNT(*)::integer
    ) as model_usage_stats,
    AVG(confidence_score)::decimal(5,2) as average_confidence,
    AVG(processing_time_ms)::integer as average_processing_time_ms,
    COUNT(*) FILTER (WHERE confidence_score >= 80)::integer as high_confidence_count,
    COUNT(*) FILTER (WHERE confidence_score < 60)::integer as low_confidence_count,
    COUNT(*) FILTER (WHERE validation_status = 'flagged')::integer as flagged_count,
    COUNT(*) FILTER (WHERE output_data->>'threat_level' IN ('high', 'critical'))::integer as critical_detections
  FROM public.ai_analysis_logs
  WHERE DATE(created_at) = CURRENT_DATE
  GROUP BY CURRENT_DATE
  ON CONFLICT (date) DO UPDATE SET
    total_analyses = EXCLUDED.total_analyses,
    analysis_type_breakdown = EXCLUDED.analysis_type_breakdown,
    model_usage_stats = EXCLUDED.model_usage_stats,
    average_confidence = EXCLUDED.average_confidence,
    average_processing_time_ms = EXCLUDED.average_processing_time_ms,
    high_confidence_count = EXCLUDED.high_confidence_count,
    low_confidence_count = EXCLUDED.low_confidence_count,
    flagged_count = EXCLUDED.flagged_count,
    critical_detections = EXCLUDED.critical_detections,
    updated_at = now();
END;
$$;

-- Trigger to update summary after each analysis
CREATE OR REPLACE FUNCTION public.trigger_update_ai_summary()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.update_ai_analytics_summary();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_ai_summary_trigger ON public.ai_analysis_logs;
CREATE TRIGGER update_ai_summary_trigger
  AFTER INSERT ON public.ai_analysis_logs
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_update_ai_summary();

-- Comments for documentation
COMMENT ON TABLE public.ai_analysis_logs IS 'Comprehensive AI analysis logs with security tracking';
COMMENT ON TABLE public.ai_analytics_summary IS 'Daily aggregated AI analytics for admin dashboard';
COMMENT ON TABLE public.ai_report_exports IS 'Tracks AI analysis report exports with expiration';