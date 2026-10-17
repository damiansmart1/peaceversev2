CREATE OR REPLACE FUNCTION public.update_ai_analytics_summary()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  WITH day_stats AS (
    SELECT
      COUNT(*)::integer AS total_analyses,
      jsonb_object_agg(s.t, s.c) AS analysis_type_breakdown,
      jsonb_object_agg(s.mu, s.mc) AS model_usage_stats,
      AVG(s.confidence_score)::decimal(5,2) AS average_confidence,
      AVG(s.processing_time_ms)::integer AS average_processing_time_ms,
      COUNT(*) FILTER (WHERE s.confidence_score >= 80)::integer AS high_confidence_count,
      COUNT(*) FILTER (WHERE s.confidence_score < 60)::integer AS low_confidence_count,
      COUNT(*) FILTER (WHERE s.validation_status = 'flagged')::integer AS flagged_count,
      COUNT(*) FILTER (WHERE s.output_data->>'threat_level' IN ('high', 'critical'))::integer AS critical_detections
    FROM (
      SELECT
        confidence_score,
        processing_time_ms,
        validation_status,
        output_data,
        COALESCE(analysis_type::text, 'unknown') AS t,
        COALESCE(model_used, 'unknown') AS mu,
        COUNT(*) OVER (PARTITION BY COALESCE(analysis_type::text, 'unknown')) AS c,
        COUNT(*) OVER (PARTITION BY COALESCE(model_used, 'unknown')) AS mc
      FROM public.ai_analysis_logs
      WHERE DATE(created_at) = CURRENT_DATE
    ) s
  )
  INSERT INTO public.ai_analytics_summary (
    date, total_analyses, analysis_type_breakdown, model_usage_stats,
    average_confidence, average_processing_time_ms, high_confidence_count,
    low_confidence_count, flagged_count, critical_detections
  )
  SELECT
    CURRENT_DATE, total_analyses, analysis_type_breakdown, model_usage_stats,
    average_confidence, average_processing_time_ms, high_confidence_count,
    low_confidence_count, flagged_count, critical_detections
  FROM day_stats
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
$function$;
