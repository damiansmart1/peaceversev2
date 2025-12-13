import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClusterAnalysisRequest {
  country?: string;
  radiusKm?: number;
  minIncidents?: number;
  timeframeDays?: number;
}

// Haversine formula to calculate distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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
    const request: ClusterAnalysisRequest = await req.json();
    
    const radiusKm = request.radiusKm || 50;
    const minIncidents = request.minIncidents || 3;
    const timeframeDays = request.timeframeDays || 90;

    console.log('Analyzing geographic clusters:', { radiusKm, minIncidents, timeframeDays });

    // Fetch incidents with coordinates
    let query = supabase
      .from('citizen_reports')
      .select('id, title, category, severity_level, location_latitude, location_longitude, location_country, location_city, created_at, estimated_people_affected')
      .not('location_latitude', 'is', null)
      .not('location_longitude', 'is', null)
      .gte('created_at', new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000).toISOString());

    if (request.country) {
      query = query.eq('location_country', request.country);
    }

    const { data: incidents, error: fetchError } = await query.limit(1000);

    if (fetchError) throw fetchError;

    if (!incidents || incidents.length < minIncidents) {
      return new Response(
        JSON.stringify({
          success: true,
          clusters: [],
          message: 'Insufficient geo-located incidents for cluster analysis'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simple clustering algorithm (DBSCAN-like approach)
    const clusters: any[] = [];
    const visited = new Set<string>();

    for (const incident of incidents) {
      if (visited.has(incident.id)) continue;

      const clusterIncidents = [incident];
      visited.add(incident.id);

      // Find all incidents within radius
      for (const other of incidents) {
        if (visited.has(other.id)) continue;
        
        const distance = calculateDistance(
          incident.location_latitude,
          incident.location_longitude,
          other.location_latitude,
          other.location_longitude
        );

        if (distance <= radiusKm) {
          clusterIncidents.push(other);
          visited.add(other.id);
        }
      }

      // Only keep clusters with minimum incidents
      if (clusterIncidents.length >= minIncidents) {
        // Calculate cluster center (centroid)
        const centerLat = clusterIncidents.reduce((sum, i) => sum + i.location_latitude, 0) / clusterIncidents.length;
        const centerLon = clusterIncidents.reduce((sum, i) => sum + i.location_longitude, 0) / clusterIncidents.length;

        // Calculate actual radius of cluster
        let maxDistance = 0;
        for (const inc of clusterIncidents) {
          const dist = calculateDistance(centerLat, centerLon, inc.location_latitude, inc.location_longitude);
          if (dist > maxDistance) maxDistance = dist;
        }

        // Category distribution
        const categories: Record<string, number> = {};
        const severities: Record<string, number> = {};
        let totalAffected = 0;

        clusterIncidents.forEach(i => {
          categories[i.category] = (categories[i.category] || 0) + 1;
          if (i.severity_level) {
            severities[i.severity_level] = (severities[i.severity_level] || 0) + 1;
          }
          totalAffected += i.estimated_people_affected || 0;
        });

        const primaryCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0];
        const countries = [...new Set(clusterIncidents.map(i => i.location_country).filter(Boolean))];
        const cities = [...new Set(clusterIncidents.map(i => i.location_city).filter(Boolean))];

        // Calculate severity score
        const severityWeights: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        const avgSeverity = clusterIncidents.reduce((sum, i) => sum + (severityWeights[i.severity_level] || 1), 0) / clusterIncidents.length;

        clusters.push({
          center_latitude: centerLat,
          center_longitude: centerLon,
          radius_km: Math.max(maxDistance, 1),
          incidents: clusterIncidents,
          incident_count: clusterIncidents.length,
          categories,
          severities,
          primary_category: primaryCategory,
          countries,
          cities,
          average_severity: avgSeverity,
          affected_population: totalAffected,
          first_incident_date: clusterIncidents.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0].created_at,
          last_incident_date: clusterIncidents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
        });
      }
    }

    // Sort clusters by incident count
    clusters.sort((a, b) => b.incident_count - a.incident_count);

    // AI analysis for top clusters
    const topClusters = clusters.slice(0, 10);
    const storedClusters = [];

    if (topClusters.length > 0) {
      const systemPrompt = `You are a geographic conflict analyst specialized in spatial pattern analysis for early warning systems.
Analyze geographic clusters of incidents to identify hotspots, assess risks, and predict expansion.`;

      const analysisPrompt = `Analyze these ${topClusters.length} geographic incident clusters:

${topClusters.map((c, i) => `
CLUSTER ${i + 1}:
- Location: ${c.cities.join(', ') || 'Unknown'}, ${c.countries.join(', ') || 'Unknown'}
- Coordinates: ${c.center_latitude.toFixed(4)}, ${c.center_longitude.toFixed(4)}
- Radius: ${c.radius_km.toFixed(1)} km
- Incidents: ${c.incident_count}
- Primary Category: ${c.primary_category}
- Categories: ${Object.entries(c.categories).map(([k, v]) => `${k}:${v}`).join(', ')}
- Avg Severity: ${c.average_severity.toFixed(2)}/4
- Population Affected: ${c.affected_population}
- First Incident: ${c.first_incident_date}
- Last Incident: ${c.last_incident_date}
`).join('\n')}

For each cluster, provide analysis in this JSON format:
{
  "clusters": [
    {
      "cluster_index": <0-based index>,
      "cluster_name": "<descriptive name based on location>",
      "risk_score": <0-100>,
      "growth_rate": <incidents per week>,
      "is_expanding": <true|false>,
      "ai_analysis": {
        "threat_assessment": "<brief threat description>",
        "contributing_factors": ["<factor1>", "<factor2>"],
        "affected_communities": ["<community1>", "<community2>"],
        "prediction": "<what might happen>",
        "confidence": <0-100>
      },
      "recommendations": ["<action1>", "<action2>"]
    }
  ],
  "overall_hotspot_assessment": "<brief summary of most critical areas>"
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

      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        const analysis = JSON.parse(aiResult.choices[0].message.content);

        // Store clusters with AI analysis
        for (const aiCluster of analysis.clusters || []) {
          const originalCluster = topClusters[aiCluster.cluster_index];
          if (!originalCluster) continue;

          const { data: stored, error: insertError } = await supabase
            .from('geographic_clusters')
            .insert({
              cluster_name: aiCluster.cluster_name,
              center_latitude: originalCluster.center_latitude,
              center_longitude: originalCluster.center_longitude,
              radius_km: originalCluster.radius_km,
              incident_count: originalCluster.incident_count,
              incident_ids: originalCluster.incidents.map((i: any) => i.id),
              primary_category: originalCluster.primary_category,
              categories: originalCluster.categories,
              severity_distribution: originalCluster.severities,
              average_severity: originalCluster.average_severity,
              cluster_risk_score: aiCluster.risk_score,
              affected_population: originalCluster.affected_population,
              countries: originalCluster.countries,
              cities: originalCluster.cities,
              first_incident_date: originalCluster.first_incident_date,
              last_incident_date: originalCluster.last_incident_date,
              growth_rate: aiCluster.growth_rate,
              is_expanding: aiCluster.is_expanding,
              ai_analysis: aiCluster.ai_analysis
            })
            .select()
            .single();

          if (!insertError && stored) {
            storedClusters.push(stored);
          }
        }

        console.log('Cluster analysis complete:', storedClusters.length, 'clusters stored');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        clusters: storedClusters.length > 0 ? storedClusters : topClusters.map(c => ({
          ...c,
          incidents: undefined,
          incident_ids: c.incidents.map((i: any) => i.id)
        })),
        total_clusters: clusters.length,
        total_incidents_analyzed: incidents.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in analyze-geographic-clusters:', error);
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
