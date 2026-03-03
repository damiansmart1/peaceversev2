import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    const { region, country, predictionDays = 14 } = await req.json();

    // Fetch historical incidents (last 90 days)
    let query = supabase
      .from('citizen_reports').select('*')
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (country) query = query.eq('location_country', country);
    if (region) query = query.eq('location_region', region);

    const { data: incidents, error: fetchError } = await query.limit(500);
    if (fetchError) throw fetchError;

    if (!incidents || incidents.length < 5) {
      return new Response(JSON.stringify({ success: true, hotspots: [], message: 'Insufficient data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Aggregate data for AI
    const locationGroups: Record<string, any[]> = {};
    incidents.forEach(inc => {
      const key = `${inc.location_country}|${inc.location_region || 'unknown'}|${inc.location_city || 'unknown'}`;
      if (!locationGroups[key]) locationGroups[key] = [];
      locationGroups[key].push(inc);
    });

    const hotAreas = Object.entries(locationGroups)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 15)
      .map(([loc, incs]) => {
        const [c, r, city] = loc.split('|');
        return {
          location: loc, country: c, region: r, city,
          count: incs.length,
          avgLat: incs.filter(i => i.location_latitude).reduce((s, i) => s + (i.location_latitude || 0), 0) / (incs.filter(i => i.location_latitude).length || 1),
          avgLon: incs.filter(i => i.location_longitude).reduce((s, i) => s + (i.location_longitude || 0), 0) / (incs.filter(i => i.location_longitude).length || 1),
          categories: [...new Set(incs.map(i => i.category))],
          severity: { critical: incs.filter(i => i.severity_level === 'critical').length, high: incs.filter(i => i.severity_level === 'high').length },
        };
      });

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${lovableApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a predictive analytics expert for conflict early warning systems.' },
          { role: 'user', content: `Predict hotspots for next ${predictionDays} days based on:\n${hotAreas.map(a => `${a.city}, ${a.region}, ${a.country}: ${a.count} incidents, categories: ${a.categories.join(',')}, critical: ${a.severity.critical}, high: ${a.severity.high}`).join('\n')}\n\nProvide JSON: { "hotspots": [{ "region_name": "", "country": "", "latitude": 0, "longitude": 0, "radius_km": 0, "hotspot_score": 0-100, "confidence_level": 0-100, "risk_level": "low|medium|high|critical", "prediction_window": "${predictionDays}_days", "incident_trend": "increasing|stable|decreasing", "monitoring_priority": "routine|elevated|high|critical", "prediction_factors": [], "recommended_interventions": [] }] }` }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!aiResponse.ok) throw new Error(`AI analysis failed: ${aiResponse.status}`);

    const aiResult = await aiResponse.json();
    const analysis = JSON.parse(aiResult.choices[0].message.content);

    // Store hotspots
    const storedHotspots = [];
    for (const hotspot of analysis.hotspots || []) {
      const { data: stored, error: insertError } = await supabase
        .from('predictive_hotspots').insert({
          region_name: hotspot.region_name, country: hotspot.country,
          latitude: hotspot.latitude, longitude: hotspot.longitude,
          radius_km: hotspot.radius_km || 25, hotspot_score: hotspot.hotspot_score,
          confidence_level: hotspot.confidence_level, risk_level: hotspot.risk_level,
          prediction_window: hotspot.prediction_window, incident_trend: hotspot.incident_trend,
          monitoring_priority: hotspot.monitoring_priority,
          prediction_factors: hotspot.prediction_factors,
          recommended_interventions: hotspot.recommended_interventions,
          valid_until: new Date(Date.now() + predictionDays * 24 * 60 * 60 * 1000).toISOString(),
          ai_model_used: 'google/gemini-2.5-flash',
          incident_count_30d: hotAreas.find(a => a.region === hotspot.region_name)?.count || 0,
        }).select().single();

      if (!insertError && stored) storedHotspots.push(stored);
    }

    return new Response(
      JSON.stringify({ success: true, hotspots: storedHotspots, total_incidents_analyzed: incidents.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in predict-hotspots:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
