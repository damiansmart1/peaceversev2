import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ComprehensiveAnalysisRequest {
  incidentId: string;
  analyzeReporterSafety?: boolean;
  detectPatterns?: boolean;
  analyzeDataQuality?: boolean;
  detectCorrelations?: boolean;
  analyzeRisk?: boolean;
}

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
    const request: ComprehensiveAnalysisRequest = await req.json();

    if (!request.incidentId) {
      throw new Error('Incident ID is required');
    }

    console.log('Starting comprehensive analysis for incident:', request.incidentId);

    // Fetch the incident
    const { data: incident, error: fetchError } = await supabase
      .from('citizen_reports')
      .select('*')
      .eq('id', request.incidentId)
      .single();

    if (fetchError || !incident) {
      throw new Error('Incident not found');
    }

    const results: any = {
      incident_id: request.incidentId,
      incident_title: incident.title,
      analyses_performed: [],
      timestamp: new Date().toISOString()
    };

    // 1. Basic AI Analysis (always run)
    console.log('Running basic analysis...');
    const basicAnalysis = await runBasicAnalysis(incident, lovableApiKey);
    results.basic_analysis = basicAnalysis;
    results.analyses_performed.push('basic_analysis');

    // 2. Risk Analysis (default: true)
    if (request.analyzeRisk !== false) {
      console.log('Running risk analysis...');
      try {
        const riskResponse = await fetch(`${supabaseUrl}/functions/v1/analyze-incident-risk`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ incidentId: request.incidentId }),
        });
        if (riskResponse.ok) {
          results.risk_analysis = await riskResponse.json();
          results.analyses_performed.push('risk_analysis');
        }
      } catch (e) {
        console.error('Risk analysis failed:', e);
      }
    }

    // 3. Reporter Safety Analysis (default: true)
    if (request.analyzeReporterSafety !== false) {
      console.log('Running reporter safety analysis...');
      try {
        const safetyResponse = await fetch(`${supabaseUrl}/functions/v1/analyze-reporter-safety`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            incidentId: request.incidentId,
            reporterId: incident.reporter_id,
            locationData: incident.location_latitude && incident.location_longitude ? {
              latitude: incident.location_latitude,
              longitude: incident.location_longitude,
              country: incident.location_country,
              city: incident.location_city
            } : null
          }),
        });
        if (safetyResponse.ok) {
          results.safety_analysis = await safetyResponse.json();
          results.analyses_performed.push('safety_analysis');
        }
      } catch (e) {
        console.error('Safety analysis failed:', e);
      }
    }

    // 4. Data Quality Analysis (default: true)
    if (request.analyzeDataQuality !== false) {
      console.log('Running data quality analysis...');
      try {
        const qualityResponse = await fetch(`${supabaseUrl}/functions/v1/analyze-data-quality`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reportId: request.incidentId }),
        });
        if (qualityResponse.ok) {
          results.data_quality = await qualityResponse.json();
          results.analyses_performed.push('data_quality');
        }
      } catch (e) {
        console.error('Data quality analysis failed:', e);
      }
    }

    // 5. Correlation Detection (default: true)
    if (request.detectCorrelations !== false) {
      console.log('Running correlation detection...');
      try {
        const correlationResponse = await fetch(`${supabaseUrl}/functions/v1/detect-correlations`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ incidentId: request.incidentId }),
        });
        if (correlationResponse.ok) {
          results.correlations = await correlationResponse.json();
          results.analyses_performed.push('correlations');
        }
      } catch (e) {
        console.error('Correlation detection failed:', e);
      }
    }

    // Generate overall summary
    results.summary = generateSummary(results);

    // Update incident with analysis flags
    await supabase
      .from('citizen_reports')
      .update({
        last_activity_at: new Date().toISOString(),
        status: determineStatus(results)
      })
      .eq('id', request.incidentId);

    // Log comprehensive analysis
    await supabase.from('ai_analysis_logs').insert({
      report_id: request.incidentId,
      analysis_type: 'comprehensive',
      model_used: 'multiple',
      output_data: results,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown'
    });

    console.log('Comprehensive analysis complete. Analyses performed:', results.analyses_performed.length);

    return new Response(
      JSON.stringify({
        success: true,
        ...results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in comprehensive-incident-analysis:', error);
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

async function runBasicAnalysis(incident: any, apiKey: string) {
  const systemPrompt = `You are an AI analyst for a humanitarian early warning system. 
Provide a concise analysis of incident reports focusing on:
1. Key threat indicators
2. Immediate action requirements
3. Potential escalation factors
4. Protection needs`;

  const analysisPrompt = `Analyze this incident:
Title: ${incident.title}
Category: ${incident.category}
Severity: ${incident.severity_level || 'Not specified'}
Location: ${incident.location_city || 'Unknown'}, ${incident.location_country || 'Unknown'}
Description: ${incident.description?.substring(0, 800)}
Casualties: ${incident.casualties_reported || 0}
Injuries: ${incident.injuries_reported || 0}
Perpetrator: ${incident.perpetrator_type || 'Not specified'}

Provide analysis in JSON format:
{
  "threat_level": "<low|medium|high|critical>",
  "key_concerns": ["<concern1>", "<concern2>"],
  "immediate_actions": ["<action1>", "<action2>"],
  "escalation_risk": "<low|medium|high>",
  "protection_priority": "<low|medium|high|urgent>",
  "summary": "<brief 2-3 sentence summary>"
}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
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

  if (!response.ok) {
    throw new Error('Basic analysis failed');
  }

  const result = await response.json();
  return JSON.parse(result.choices[0].message.content);
}

function generateSummary(results: any) {
  const threatLevel = results.basic_analysis?.threat_level || 'unknown';
  const riskScore = results.risk_analysis?.risk_score?.overall_risk_score;
  const safetyScore = results.safety_analysis?.safety_analysis?.safety_score;
  const qualityScore = results.data_quality?.quality_metrics?.overall_quality_score;
  const correlationCount = results.correlations?.total_found || 0;

  return {
    overall_threat_level: threatLevel,
    risk_score: riskScore,
    reporter_safety_score: safetyScore,
    data_quality_score: qualityScore,
    related_incidents: correlationCount,
    requires_immediate_attention: threatLevel === 'critical' || threatLevel === 'high' || (riskScore && riskScore >= 70),
    key_findings: [
      ...(results.basic_analysis?.key_concerns || []),
      ...(results.risk_analysis?.risk_score?.ai_reasoning?.primary_concerns || [])
    ].slice(0, 5),
    recommended_priority: determinePriority(results)
  };
}

function determinePriority(results: any): string {
  const threatLevel = results.basic_analysis?.threat_level;
  const riskScore = results.risk_analysis?.risk_score?.overall_risk_score || 0;
  const safetyRisk = results.safety_analysis?.safety_analysis?.risk_level;

  if (threatLevel === 'critical' || riskScore >= 80 || safetyRisk === 'critical') {
    return 'critical';
  }
  if (threatLevel === 'high' || riskScore >= 60 || safetyRisk === 'high') {
    return 'high';
  }
  if (threatLevel === 'medium' || riskScore >= 40) {
    return 'medium';
  }
  return 'normal';
}

function determineStatus(results: any): string {
  const priority = determinePriority(results);
  
  if (priority === 'critical') {
    return 'escalated';
  }
  if (priority === 'high') {
    return 'under_review';
  }
  return 'pending';
}
