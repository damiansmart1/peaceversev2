import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ClusterAnalysisRequest {
  country?: string;
  radiusKm?: number;
  minIncidents?: number;
  timeframeDays?: number;
}

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

    const request: ClusterAnalysisRequest = await req.json();
    const radiusKm = request.radiusKm || 50;
    const minIncidents = request.minIncidents || 3;
    const timeframeDays = request.timeframeDays || 90;

    let query = supabase
      .from('citizen_reports')
      .select('id, title, category, severity_level, location_latitude, location_longitude, location_country, location_city, created_at, estimated_people_affected')
      .not('location_latitude', 'is', null)
      .not('location_longitude', 'is', null)
      .gte('created_at', new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000).toISOString());

    if (request.country) query = query.eq('location_country', request.country);

    const { data: incidents, error: fetchError } = await query.limit(1000);
    if (fetchError) throw fetchError;

    if (!incidents || incidents.length < minIncidents) {
      return new Response(JSON.stringify({ success: true, clusters: [], message: 'Insufficient data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // DBSCAN-like clustering
    const clusters: any[] = [];
    const visited = new Set<string>();

    for (const incident of incidents) {
      if (visited.has(incident.id)) continue;
      const clusterIncidents = [incident];
      visited.add(incident.id);

      for (const other of incidents) {
        if (visited.has(other.id)) continue;
        if (calculateDistance(incident.location_latitude, incident.location_longitude, other.location_latitude, other.location_longitude) <= radiusKm) {
          clusterIncidents.push(other);
          visited.add(other.id);
        }
      }

      if (clusterIncidents.length >= minIncidents) {
        const centerLat = clusterIncidents.reduce((s, i) => s + i.location_latitude, 0) / clusterIncidents.length;
        const centerLon = clusterIncidents.reduce((s, i) => s + i.location_longitude, 0) / clusterIncidents.length;
        let maxDist = 0;
        for (const inc of clusterIncidents) {
          const d = calculateDistance(centerLat, centerLon, inc.location_latitude, inc.location_longitude);
          if (d > maxDist) maxDist = d;
        }

        const categories: Record<string, number> = {};
        const severities: Record<string, number> = {};
        let totalAffected = 0;
        clusterIncidents.forEach(i => {
          categories[i.category] = (categories[i.category] || 0) + 1;
          if (i.severity_level) severities[i.severity_level] = (severities[i.severity_level] || 0) + 1;
          totalAffected += i.estimated_people_affected || 0;
        });

        const severityWeights: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        clusters.push({
          center_latitude: centerLat, center_longitude: centerLon, radius_km: Math.max(maxDist, 1),
          incidents: clusterIncidents, incident_count: clusterIncidents.length, categories, severities,
          primary_category: Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0],
          countries: [...new Set(clusterIncidents.map(i => i.location_country).filter(Boolean))],
          cities: [...new Set(clusterIncidents.map(i => i.location_city).filter(Boolean))],
          average_severity: clusterIncidents.reduce((s, i) => s + (severityWeights[i.severity_level] || 1), 0) / clusterIncidents.length,
          affected_population: totalAffected,
          first_incident_date: clusterIncidents.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0].created_at,
          last_incident_date: clusterIncidents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
        });
      }
    }

    clusters.sort((a, b) => b.incident_count - a.incident_count);
    const topClusters = clusters.slice(0, 10);
    const storedClusters = [];

    if (topClusters.length > 0) {
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${lovableApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are a geographic conflict analyst for early warning systems.' },
            { role: 'user', content: `Analyze ${topClusters.length} clusters:\n${topClusters.map((c, i) => `Cluster ${i}: ${c.cities.join(',')||'Unknown'}, ${c.countries.join(',')}, ${c.incident_count} incidents, primary: ${c.primary_category}, severity: ${c.average_severity.toFixed(1)}/4`).join('\n')}\nProvide JSON: { "clusters": [{ "cluster_index": 0, "cluster_name": "", "risk_score": 0-100, "growth_rate": 0, "is_expanding": false, "ai_analysis": { "threat_assessment": "", "contributing_factors": [], "affected_communities": [], "prediction": "", "confidence": 0-100 }, "recommendations": [] }], "overall_hotspot_assessment": "" }` }
          ],
          response_format: { type: 'json_object' }
        }),
      });

      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        const analysis = JSON.parse(aiResult.choices[0].message.content);

        for (const aiCluster of analysis.clusters || []) {
          const original = topClusters[aiCluster.cluster_index];
          if (!original) continue;
          const { data: stored, error: insertError } = await supabase.from('geographic_clusters').insert({
            cluster_name: aiCluster.cluster_name, center_latitude: original.center_latitude,
            center_longitude: original.center_longitude, radius_km: original.radius_km,
            incident_count: original.incident_count, incident_ids: original.incidents.map((i: any) => i.id),
            primary_category: original.primary_category, categories: original.categories,
            severity_distribution: original.severities, average_severity: original.average_severity,
            cluster_risk_score: aiCluster.risk_score, affected_population: original.affected_population,
            countries: original.countries, cities: original.cities,
            first_incident_date: original.first_incident_date, last_incident_date: original.last_incident_date,
            growth_rate: aiCluster.growth_rate, is_expanding: aiCluster.is_expanding,
            ai_analysis: aiCluster.ai_analysis
          }).select().single();
          if (!insertError && stored) storedClusters.push(stored);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        clusters: storedClusters.length > 0 ? storedClusters : topClusters.map(c => ({ ...c, incidents: undefined, incident_ids: c.incidents.map((i: any) => i.id) })),
        total_clusters: clusters.length, total_incidents_analyzed: incidents.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-geographic-clusters:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
