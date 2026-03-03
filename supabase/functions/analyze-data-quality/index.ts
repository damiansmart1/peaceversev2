import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface DataQualityRequest {
  reportId: string;
}

const FIELD_WEIGHTS: Record<string, number> = {
  title: 10, description: 15, category: 10, severity_level: 8,
  location_country: 10, location_city: 5, location_latitude: 5, location_longitude: 5,
  incident_date: 8, incident_time: 3, perpetrator_type: 5, perpetrator_description: 3,
  estimated_people_affected: 4, casualties_reported: 4, injuries_reported: 4,
  has_witnesses: 2, witness_count: 2, media_urls: 5, evidence_description: 3,
  reporter_contact_email: 2, reporter_contact_phone: 2,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) throw new Error('LOVABLE_API_KEY not configured');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // --- AUTH CHECK ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: roles } = await supabase
      .from('user_roles').select('role').eq('user_id', user.id).eq('is_active', true);
    const hasAccess = roles?.some(r => ['admin', 'verifier', 'government', 'partner'].includes(r.role));
    if (!hasAccess) {
      return new Response(JSON.stringify({ error: 'Forbidden: Insufficient role' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // --- END AUTH CHECK ---

    const { reportId }: DataQualityRequest = await req.json();
    if (!reportId) throw new Error('Report ID is required');

    const { data: report, error: fetchError } = await supabase
      .from('citizen_reports').select('*').eq('id', reportId).single();

    if (fetchError || !report) throw new Error('Report not found');

    // Calculate completeness
    let completenessPoints = 0;
    let totalWeight = 0;
    const dataGaps: string[] = [];

    for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
      totalWeight += weight;
      const value = (report as any)[field];
      if (value !== null && value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)) {
        completenessPoints += weight;
      } else if (weight >= 5) {
        dataGaps.push(field);
      }
    }

    const completenessScore = Math.round((completenessPoints / totalWeight) * 100);

    // Check duplicates
    const { data: potentialDuplicates } = await supabase
      .from('citizen_reports')
      .select('id, title, description, location_country, location_city, created_at')
      .neq('id', reportId)
      .eq('category', report.category)
      .eq('location_country', report.location_country)
      .gte('created_at', new Date(new Date(report.created_at).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .lte('created_at', new Date(new Date(report.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(10);

    // Timeliness
    const reportDate = new Date(report.created_at);
    const incidentDate = report.incident_date ? new Date(report.incident_date) : null;
    let timelinessScore = 50;
    if (incidentDate) {
      const daysDiff = Math.abs(reportDate.getTime() - incidentDate.getTime()) / (1000 * 60 * 60 * 24);
      timelinessScore = daysDiff <= 1 ? 100 : daysDiff <= 3 ? 90 : daysDiff <= 7 ? 75 : daysDiff <= 14 ? 60 : daysDiff <= 30 ? 40 : 20;
    }

    // Source reliability
    let sourceReliability = 'unknown';
    if (report.reporter_id) {
      const { count } = await supabase
        .from('citizen_reports').select('*', { count: 'exact', head: true })
        .eq('reporter_id', report.reporter_id).eq('verification_status', 'verified');
      if (count === 0) sourceReliability = 'new_source';
      else if (count && count <= 2) sourceReliability = 'occasional';
      else if (count && count <= 5) sourceReliability = 'regular';
      else if (count && count <= 10) sourceReliability = 'established';
      else sourceReliability = 'trusted';
    }

    // AI quality analysis
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${lovableApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a data quality analyst for a humanitarian incident reporting system.' },
          { role: 'user', content: `Analyze data quality: Title: ${report.title}, Category: ${report.category}, Description: ${report.description?.substring(0, 1000)}, Completeness: ${completenessScore}%, Timeliness: ${timelinessScore}%, Gaps: ${dataGaps.join(', ') || 'None'}, Duplicates: ${potentialDuplicates?.length || 0}. Provide JSON: { "accuracy_indicators": { "description_coherence": "", "location_validity": "", "temporal_consistency": "", "numerical_plausibility": "", "category_match": "" }, "consistency_score": 0-100, "anomaly_flags": [], "duplicate_probability": 0-1, "enhancement_suggestions": [{ "field": "", "issue": "", "suggestion": "" }], "verification_recommendation": "", "overall_assessment": "" }` }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!aiResponse.ok) throw new Error(`AI analysis failed: ${aiResponse.status}`);

    const aiResult = await aiResponse.json();
    const analysis = JSON.parse(aiResult.choices[0].message.content);

    const overallQualityScore = Math.round(
      (completenessScore * 0.35) + (analysis.consistency_score * 0.25) + (timelinessScore * 0.20) +
      ((1 - analysis.duplicate_probability) * 100 * 0.10) +
      (sourceReliability === 'trusted' ? 100 : sourceReliability === 'established' ? 80 : sourceReliability === 'regular' ? 60 : sourceReliability === 'occasional' ? 40 : 30) * 0.10
    );

    let verificationLevel = 'unverified';
    if (report.verification_status === 'verified') verificationLevel = report.verified_by ? 'verified' : 'partially_verified';
    else if (overallQualityScore >= 80 && analysis.anomaly_flags.length === 0) verificationLevel = 'cross_referenced';

    await supabase.from('data_quality_metrics').upsert({
      report_id: reportId,
      completeness_score: completenessScore,
      accuracy_indicators: analysis.accuracy_indicators,
      consistency_score: analysis.consistency_score,
      timeliness_score: timelinessScore,
      verification_level: verificationLevel,
      source_reliability: sourceReliability,
      duplicate_probability: analysis.duplicate_probability,
      potential_duplicates: potentialDuplicates?.map(d => d.id) || [],
      anomaly_flags: analysis.anomaly_flags,
      data_gaps: dataGaps,
      enhancement_suggestions: analysis.enhancement_suggestions.map((s: any) => `${s.field}: ${s.suggestion}`),
      overall_quality_score: overallQualityScore,
      updated_at: new Date().toISOString()
    }, { onConflict: 'report_id' });

    return new Response(
      JSON.stringify({
        success: true,
        quality_metrics: { completeness_score: completenessScore, consistency_score: analysis.consistency_score, timeliness_score: timelinessScore, overall_quality_score: overallQualityScore, verification_level: verificationLevel, source_reliability: sourceReliability },
        accuracy_indicators: analysis.accuracy_indicators,
        anomaly_flags: analysis.anomaly_flags,
        data_gaps: dataGaps,
        enhancement_suggestions: analysis.enhancement_suggestions,
        duplicate_probability: analysis.duplicate_probability,
        potential_duplicates: potentialDuplicates?.map(d => ({ id: d.id, title: d.title })) || [],
        verification_recommendation: analysis.verification_recommendation,
        overall_assessment: analysis.overall_assessment
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-data-quality:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
