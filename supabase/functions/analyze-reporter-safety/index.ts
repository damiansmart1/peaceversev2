import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface SafetyAnalysisRequest {
  reporterId?: string;
  anonymousHash?: string;
  incidentId: string;
  locationData?: {
    latitude: number;
    longitude: number;
    country: string;
    city?: string;
  };
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

    const request: SafetyAnalysisRequest = await req.json();

    console.log('Analyzing reporter safety for incident:', request.incidentId);

    // Fetch incident
    const { data: incident, error: fetchError } = await supabase
      .from('citizen_reports').select('*').eq('id', request.incidentId).single();

    if (fetchError || !incident) throw new Error('Incident not found');

    // Fetch reporter history if available
    let reporterHistory: any[] = [];
    if (request.reporterId) {
      const { data } = await supabase
        .from('citizen_reports')
        .select('id, category, severity_level, location_country, location_city, created_at, perpetrator_type')
        .eq('reporter_id', request.reporterId)
        .order('created_at', { ascending: false })
        .limit(20);
      reporterHistory = data || [];
    }

    // Fetch area risk context
    const { data: areaIncidents } = await supabase
      .from('citizen_reports')
      .select('category, severity_level, perpetrator_type, created_at')
      .eq('location_country', incident.location_country)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(50);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${lovableApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a protection specialist analyzing reporter safety in conflict zones. Follow ICRC and CPJ protection guidelines.' },
          { role: 'user', content: `Assess reporter safety:\nIncident: ${incident.title} (${incident.category}, ${incident.severity_level})\nLocation: ${incident.location_city || 'Unknown'}, ${incident.location_country}\nPerpetrator: ${incident.perpetrator_type || 'Unknown'}\nReporter history: ${reporterHistory.length} reports\nArea incidents (30d): ${areaIncidents?.length || 0}\nHigh severity nearby: ${areaIncidents?.filter(i => i.severity_level === 'high' || i.severity_level === 'critical').length || 0}\n\nProvide JSON: { "overall_safety_score": 0-100, "risk_level": "low|moderate|elevated|high|critical", "immediate_threats": [], "protective_factors": [], "recommendations": [{ "action": "", "priority": "immediate|urgent|standard", "category": "digital_security|physical_safety|legal_protection|psychosocial|relocation" }], "digital_safety_tips": [], "reporting_safety_tips": [], "assessment_summary": "" }` }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!aiResponse.ok) throw new Error(`AI analysis failed: ${aiResponse.status}`);

    const aiResult = await aiResponse.json();
    const analysis = JSON.parse(aiResult.choices[0].message.content);

    // Store safety assessment
    await supabase.from('reporter_safety_assessments').insert({
      reporter_id: request.reporterId || null,
      incident_id: request.incidentId,
      overall_safety_score: analysis.overall_safety_score,
      risk_level: analysis.risk_level,
      immediate_threats: analysis.immediate_threats,
      protective_factors: analysis.protective_factors,
      recommendations: analysis.recommendations,
      assessed_by: user.id,
    }).catch(e => console.error('Failed to store safety assessment:', e));

    return new Response(
      JSON.stringify({ success: true, safety_assessment: analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-reporter-safety:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
