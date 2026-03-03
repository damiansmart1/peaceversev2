import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    const request: ComprehensiveAnalysisRequest = await req.json();
    if (!request.incidentId) throw new Error('Incident ID is required');

    console.log('Starting comprehensive analysis for incident:', request.incidentId);

    // Fetch incident
    const { data: incident, error: fetchError } = await supabase
      .from('citizen_reports').select('*').eq('id', request.incidentId).single();

    if (fetchError || !incident) throw new Error('Incident not found');

    const results: Record<string, any> = {};

    // Run analyses in parallel using internal supabase function calls
    const analysisPromises: Promise<any>[] = [];

    // Core AI analysis
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${lovableApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert conflict analyst. Provide comprehensive incident analysis covering sentiment, risk, patterns, and recommendations.' },
          { role: 'user', content: `Comprehensive analysis for: "${incident.title}" (${incident.category}, ${incident.severity_level || 'unknown severity'}) in ${incident.location_city || 'Unknown'}, ${incident.location_country || 'Unknown'}. Description: ${incident.description?.substring(0, 2000)}. Casualties: ${incident.casualties_reported || 0}, Injuries: ${incident.injuries_reported || 0}. Provide JSON: { "sentiment": { "score": -1 to 1, "label": "", "emotions": [] }, "risk_assessment": { "overall_score": 0-100, "threat_level": "low|medium|high|critical", "escalation_probability": 0-100 }, "key_entities": [], "pattern_indicators": [], "recommended_actions": [{ "action": "", "priority": "immediate|urgent|high|medium|low", "target": "" }], "summary": "" }` }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (aiResponse.ok) {
      const aiResult = await aiResponse.json();
      results.comprehensive = JSON.parse(aiResult.choices[0].message.content);
    }

    // Update report with analysis
    if (results.comprehensive) {
      await supabase.from('citizen_reports').update({
        ai_sentiment: results.comprehensive.sentiment?.label,
        ai_threat_level: results.comprehensive.risk_assessment?.threat_level,
        credibility_score: results.comprehensive.risk_assessment?.overall_score,
        ai_key_entities: results.comprehensive.key_entities,
      }).eq('id', request.incidentId);
    }

    // Store in analysis logs
    await supabase.from('ai_analysis_logs').insert({
      report_id: request.incidentId,
      analysis_type: 'comprehensive',
      model_used: 'google/gemini-2.5-flash',
      output_data: results,
      user_id: user.id,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown'
    });

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'comprehensive_analysis_completed',
      entity_type: 'citizen_report',
      entity_id: request.incidentId,
      changes: { analysis_types: Object.keys(results) },
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown'
    });

    return new Response(
      JSON.stringify({ success: true, results, incident_id: request.incidentId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in comprehensive-incident-analysis:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
