import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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

    const { incidentId } = await req.json();
    if (!incidentId) throw new Error('Incident ID is required');

    // Fetch target incident
    const { data: incident, error: fetchError } = await supabase
      .from('citizen_reports').select('*').eq('id', incidentId).single();

    if (fetchError || !incident) throw new Error('Incident not found');

    // Find potentially correlated incidents
    const { data: candidates } = await supabase
      .from('citizen_reports')
      .select('*')
      .neq('id', incidentId)
      .gte('created_at', new Date(new Date(incident.created_at).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .lte('created_at', new Date(new Date(incident.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(100);

    if (!candidates || candidates.length === 0) {
      return new Response(JSON.stringify({ success: true, correlations: [], message: 'No candidates found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Pre-filter: geographic and temporal proximity
    const nearCandidates = candidates.filter(c => {
      if (incident.location_latitude && incident.location_longitude && c.location_latitude && c.location_longitude) {
        const dist = calculateDistance(incident.location_latitude, incident.location_longitude, c.location_latitude, c.location_longitude);
        if (dist <= 200) return true;
      }
      if (incident.location_country === c.location_country) return true;
      if (incident.category === c.category) return true;
      return false;
    }).slice(0, 20);

    if (nearCandidates.length === 0) {
      return new Response(JSON.stringify({ success: true, correlations: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // AI correlation analysis
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${lovableApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a conflict correlation analyst. Identify meaningful connections between incidents.' },
          { role: 'user', content: `Primary incident: "${incident.title}" (${incident.category}, ${incident.location_country}, ${incident.created_at})\n\nCandidates:\n${nearCandidates.map((c, i) => `${i}: "${c.title}" (${c.category}, ${c.location_country}, ${c.created_at})`).join('\n')}\n\nProvide JSON: { "correlations": [{ "candidate_index": 0, "correlation_strength": 0-1, "correlation_type": "geographic|temporal|thematic|actor|causal|escalation", "shared_characteristics": [], "cross_border": false, "escalation_chain": false, "pattern_detected": "" }] }` }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!aiResponse.ok) throw new Error(`AI analysis failed: ${aiResponse.status}`);

    const aiResult = await aiResponse.json();
    const analysis = JSON.parse(aiResult.choices[0].message.content);

    // Store correlations
    const storedCorrelations = [];
    for (const corr of analysis.correlations || []) {
      const candidate = nearCandidates[corr.candidate_index];
      if (!candidate || corr.correlation_strength < 0.3) continue;

      let geoDist: number | null = null;
      if (incident.location_latitude && candidate.location_latitude) {
        geoDist = calculateDistance(incident.location_latitude, incident.location_longitude, candidate.location_latitude, candidate.location_longitude);
      }

      const tempDist = Math.abs(new Date(incident.created_at).getTime() - new Date(candidate.created_at).getTime()) / (1000 * 60 * 60);

      const { data: stored, error } = await supabase.from('incident_correlations').insert({
        primary_incident_id: incidentId,
        related_incident_id: candidate.id,
        correlation_type: corr.correlation_type,
        correlation_strength: corr.correlation_strength,
        shared_characteristics: corr.shared_characteristics,
        geographic_distance_km: geoDist,
        temporal_distance_hours: Math.round(tempDist),
        cross_border: corr.cross_border,
        escalation_chain: corr.escalation_chain,
        pattern_detected: corr.pattern_detected,
        countries_involved: [...new Set([incident.location_country, candidate.location_country].filter(Boolean))],
        detected_by: 'ai_correlation_engine'
      }).select().single();

      if (!error && stored) storedCorrelations.push(stored);
    }

    return new Response(
      JSON.stringify({ success: true, correlations: storedCorrelations, candidates_analyzed: nearCandidates.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in detect-correlations:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
