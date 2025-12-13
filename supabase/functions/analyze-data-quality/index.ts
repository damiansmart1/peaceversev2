import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DataQualityRequest {
  reportId: string;
}

// Field weights for completeness calculation
const FIELD_WEIGHTS: Record<string, number> = {
  title: 10,
  description: 15,
  category: 10,
  severity_level: 8,
  location_country: 10,
  location_city: 5,
  location_latitude: 5,
  location_longitude: 5,
  incident_date: 8,
  incident_time: 3,
  perpetrator_type: 5,
  perpetrator_description: 3,
  estimated_people_affected: 4,
  casualties_reported: 4,
  injuries_reported: 4,
  has_witnesses: 2,
  witness_count: 2,
  media_urls: 5,
  evidence_description: 3,
  reporter_contact_email: 2,
  reporter_contact_phone: 2,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { reportId }: DataQualityRequest = await req.json();

    if (!reportId) {
      throw new Error('Report ID is required');
    }

    console.log('Analyzing data quality for report:', reportId);

    // Fetch the report
    const { data: report, error: fetchError } = await supabase
      .from('citizen_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (fetchError || !report) {
      throw new Error('Report not found');
    }

    // Calculate completeness score
    let completenessPoints = 0;
    let totalWeight = 0;
    const dataGaps: string[] = [];
    const accuracyIndicators: Record<string, any> = {};

    for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
      totalWeight += weight;
      const value = report[field];
      
      if (value !== null && value !== undefined && value !== '' && 
          !(Array.isArray(value) && value.length === 0)) {
        completenessPoints += weight;
      } else {
        if (weight >= 5) {
          dataGaps.push(field);
        }
      }
    }

    const completenessScore = Math.round((completenessPoints / totalWeight) * 100);

    // Check for potential duplicates
    const { data: potentialDuplicates } = await supabase
      .from('citizen_reports')
      .select('id, title, description, location_country, location_city, created_at')
      .neq('id', reportId)
      .eq('category', report.category)
      .eq('location_country', report.location_country)
      .gte('created_at', new Date(new Date(report.created_at).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .lte('created_at', new Date(new Date(report.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(10);

    // Calculate timeliness score
    const reportDate = new Date(report.created_at);
    const incidentDate = report.incident_date ? new Date(report.incident_date) : null;
    let timelinessScore = 100;
    
    if (incidentDate) {
      const daysDifference = Math.abs(reportDate.getTime() - incidentDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDifference <= 1) timelinessScore = 100;
      else if (daysDifference <= 3) timelinessScore = 90;
      else if (daysDifference <= 7) timelinessScore = 75;
      else if (daysDifference <= 14) timelinessScore = 60;
      else if (daysDifference <= 30) timelinessScore = 40;
      else timelinessScore = 20;
    } else {
      timelinessScore = 50; // Unknown timeliness
    }

    // Check source reliability based on reporter history
    let sourceReliability = 'unknown';
    if (report.reporter_id) {
      const { count } = await supabase
        .from('citizen_reports')
        .select('*', { count: 'exact', head: true })
        .eq('reporter_id', report.reporter_id)
        .eq('verification_status', 'verified');

      if (count === 0) sourceReliability = 'new_source';
      else if (count && count <= 2) sourceReliability = 'occasional';
      else if (count && count <= 5) sourceReliability = 'regular';
      else if (count && count <= 10) sourceReliability = 'established';
      else sourceReliability = 'trusted';
    }

    // AI-powered quality analysis
    const systemPrompt = `You are a data quality analyst for a humanitarian incident reporting system.
Analyze reports for accuracy indicators, anomalies, and enhancement suggestions.
Focus on identifying data quality issues that could affect analysis reliability.`;

    const analysisPrompt = `Analyze the data quality of this incident report:

REPORT DETAILS:
- Title: ${report.title}
- Category: ${report.category}
- Description: ${report.description?.substring(0, 1000)}
- Location: ${report.location_city || 'Unknown'}, ${report.location_country || 'Unknown'}
- Coordinates: ${report.location_latitude || 'N/A'}, ${report.location_longitude || 'N/A'}
- Date: ${report.incident_date || 'Not specified'}
- Severity: ${report.severity_level || 'Not specified'}
- Perpetrator: ${report.perpetrator_type || 'Not specified'}
- Casualties: ${report.casualties_reported || 0}
- Injuries: ${report.injuries_reported || 0}
- People Affected: ${report.estimated_people_affected || 'Not specified'}
- Has Witnesses: ${report.has_witnesses}
- Has Media: ${report.media_urls?.length > 0}
- Is Anonymous: ${report.is_anonymous}

COMPUTED METRICS:
- Completeness Score: ${completenessScore}%
- Timeliness Score: ${timelinessScore}%
- Source Reliability: ${sourceReliability}
- Data Gaps: ${dataGaps.join(', ') || 'None'}
- Potential Duplicates Found: ${potentialDuplicates?.length || 0}

Analyze and provide in this JSON format:
{
  "accuracy_indicators": {
    "description_coherence": "<high|medium|low>",
    "location_validity": "<valid|uncertain|invalid>",
    "temporal_consistency": "<consistent|minor_issues|major_issues>",
    "numerical_plausibility": "<plausible|uncertain|implausible>",
    "category_match": "<strong|moderate|weak>"
  },
  "consistency_score": <0-100>,
  "anomaly_flags": ["<flag1>", "<flag2>"],
  "duplicate_probability": <0-1>,
  "enhancement_suggestions": [
    {
      "field": "<field name>",
      "issue": "<what's wrong>",
      "suggestion": "<how to improve>"
    }
  ],
  "verification_recommendation": "<auto_approve|standard_review|enhanced_review|expert_required>",
  "overall_assessment": "<brief quality summary>"
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: analysisPrompt }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const analysis = JSON.parse(aiResult.choices[0].message.content);

    // Calculate overall quality score
    const overallQualityScore = Math.round(
      (completenessScore * 0.35) +
      (analysis.consistency_score * 0.25) +
      (timelinessScore * 0.20) +
      ((1 - analysis.duplicate_probability) * 100 * 0.10) +
      (sourceReliability === 'trusted' ? 100 : 
       sourceReliability === 'established' ? 80 :
       sourceReliability === 'regular' ? 60 :
       sourceReliability === 'occasional' ? 40 :
       sourceReliability === 'new_source' ? 30 : 20) * 0.10
    );

    // Determine verification level
    let verificationLevel = 'unverified';
    if (report.verification_status === 'verified') {
      verificationLevel = report.verified_by ? 'verified' : 'partially_verified';
    } else if (overallQualityScore >= 80 && analysis.anomaly_flags.length === 0) {
      verificationLevel = 'cross_referenced';
    }

    // Store data quality metrics
    const { data: qualityMetrics, error: insertError } = await supabase
      .from('data_quality_metrics')
      .upsert({
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
      }, { onConflict: 'report_id' })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing quality metrics:', insertError);
    }

    console.log('Data quality analysis complete. Score:', overallQualityScore);

    return new Response(
      JSON.stringify({
        success: true,
        quality_metrics: {
          completeness_score: completenessScore,
          consistency_score: analysis.consistency_score,
          timeliness_score: timelinessScore,
          overall_quality_score: overallQualityScore,
          verification_level: verificationLevel,
          source_reliability: sourceReliability
        },
        accuracy_indicators: analysis.accuracy_indicators,
        anomaly_flags: analysis.anomaly_flags,
        data_gaps: dataGaps,
        enhancement_suggestions: analysis.enhancement_suggestions,
        duplicate_probability: analysis.duplicate_probability,
        potential_duplicates: potentialDuplicates?.map(d => ({ id: d.id, title: d.title })) || [],
        verification_recommendation: analysis.verification_recommendation,
        overall_assessment: analysis.overall_assessment
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in analyze-data-quality:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
