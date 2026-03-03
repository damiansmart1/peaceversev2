import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface PatternDetectionRequest {
  country?: string;
  timeframeDays?: number;
  categories?: string[];
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

    const request: PatternDetectionRequest = await req.json();
    const timeframeDays = request.timeframeDays || 90;

    let query = supabase
      .from('citizen_reports').select('*')
      .gte('created_at', new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (request.country) query = query.eq('location_country', request.country);
    if (request.categories?.length) query = query.in('category', request.categories);

    const { data: incidents, error: fetchError } = await query.limit(500);
    if (fetchError) throw fetchError;

    if (!incidents || incidents.length < 5) {
      return new Response(JSON.stringify({ success: true, patterns: [], message: 'Insufficient data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Pre-process data
    const categoryGroups: Record<string, any[]> = {};
    const locationGroups: Record<string, any[]> = {};
    const perpetratorGroups: Record<string, any[]> = {};
    const temporalData: Record<string, number> = {};

    incidents.forEach(inc => {
      if (!categoryGroups[inc.category]) categoryGroups[inc.category] = [];
      categoryGroups[inc.category].push(inc);
      const locationKey = `${inc.location_country}|${inc.location_city || 'unknown'}`;
      if (!locationGroups[locationKey]) locationGroups[locationKey] = [];
      locationGroups[locationKey].push(inc);
      if (inc.perpetrator_type) {
        if (!perpetratorGroups[inc.perpetrator_type]) perpetratorGroups[inc.perpetrator_type] = [];
        perpetratorGroups[inc.perpetrator_type].push(inc);
      }
      const weekKey = new Date(inc.created_at).toISOString().substring(0, 10);
      temporalData[weekKey] = (temporalData[weekKey] || 0) + 1;
    });

    const patternSummary = {
      totalIncidents: incidents.length, timeframeDays,
      categoryDistribution: Object.fromEntries(Object.entries(categoryGroups).map(([k, v]) => [k, v.length])),
      topLocations: Object.entries(locationGroups).sort((a, b) => b[1].length - a[1].length).slice(0, 10).map(([loc, incs]) => ({ location: loc, count: incs.length })),
      perpetratorTypes: Object.fromEntries(Object.entries(perpetratorGroups).map(([k, v]) => [k, v.length])),
      severityBreakdown: {
        critical: incidents.filter(i => i.severity_level === 'critical').length,
        high: incidents.filter(i => i.severity_level === 'high').length,
        medium: incidents.filter(i => i.severity_level === 'medium').length,
        low: incidents.filter(i => i.severity_level === 'low').length
      },
      countries: [...new Set(incidents.map(i => i.location_country).filter(Boolean))],
      categories: [...new Set(incidents.map(i => i.category))]
    };

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${lovableApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert conflict analyst for early warning systems. Identify geographic, temporal, actor, escalation, and cross-border patterns.' },
          { role: 'user', content: `Analyze ${patternSummary.totalIncidents} incidents over ${timeframeDays} days. Categories: ${Object.entries(patternSummary.categoryDistribution).map(([c, n]) => `${c}:${n}`).join(', ')}. Top locations: ${patternSummary.topLocations.map(l => `${l.location}:${l.count}`).join(', ')}. Severity: critical:${patternSummary.severityBreakdown.critical}, high:${patternSummary.severityBreakdown.high}. Provide JSON: { "patterns": [{ "pattern_name": "", "pattern_type": "", "description": "", "confidence_score": 0-100, "severity_trend": "", "countries_affected": [], "regions_affected": [], "incident_count": 0, "start_date": "", "recurrence_frequency": "", "risk_implications": [], "ai_analysis": { "key_indicators": [], "contributing_factors": [], "prediction": "" }, "recommendations": [{ "action": "", "priority": "", "target_stakeholder": "" }] }], "overall_assessment": { "trend_direction": "", "highest_concern": "", "priority_areas": [], "summary": "" } }` }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!aiResponse.ok) throw new Error(`AI analysis failed: ${aiResponse.status}`);

    const aiResult = await aiResponse.json();
    const analysis = JSON.parse(aiResult.choices[0].message.content);

    const storedPatterns = [];
    for (const pattern of analysis.patterns || []) {
      const { data: storedPattern, error: insertError } = await supabase
        .from('incident_patterns').insert({
          pattern_name: pattern.pattern_name, pattern_type: pattern.pattern_type,
          description: pattern.description,
          detection_criteria: { timeframe_days: timeframeDays, country_filter: request.country, category_filter: request.categories },
          incident_count: pattern.incident_count, countries_affected: pattern.countries_affected,
          regions_affected: pattern.regions_affected,
          start_date: pattern.start_date ? new Date(pattern.start_date).toISOString() : null,
          recurrence_frequency: pattern.recurrence_frequency, severity_trend: pattern.severity_trend,
          confidence_score: pattern.confidence_score, ai_analysis: pattern.ai_analysis,
          recommendations: pattern.recommendations, is_active: true,
          last_occurrence: new Date().toISOString()
        }).select().single();

      if (!insertError && storedPattern) storedPatterns.push(storedPattern);
    }

    await supabase.from('ai_analysis_logs').insert({
      analysis_type: 'pattern_detection', model_used: 'google/gemini-2.5-flash',
      input_data: patternSummary, output_data: analysis, user_id: user.id,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown'
    });

    return new Response(
      JSON.stringify({ success: true, patterns: storedPatterns, overall_assessment: analysis.overall_assessment, data_summary: patternSummary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in detect-patterns:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
