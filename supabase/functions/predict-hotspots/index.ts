import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { region, country, predictionDays = 14 } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch historical incidents for the region (last 90 days)
    let query = supabase
      .from('citizen_reports')
      .select('*')
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (country) {
      query = query.eq('location_country', country);
    }

    if (region) {
      query = query.eq('location_region', region);
    }

    const { data: historicalIncidents, error: fetchError } = await query.limit(200);

    if (fetchError) throw fetchError;

    if (!historicalIncidents || historicalIncidents.length < 5) {
      return new Response(
        JSON.stringify({
          success: true,
          hotspots: [],
          message: 'Insufficient data for hotspot prediction'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Group incidents by location
    const locationGroups: any = {};
    
    for (const incident of historicalIncidents) {
      const locationKey = `${incident.location_city}-${incident.location_country}`;
      if (!locationGroups[locationKey]) {
        locationGroups[locationKey] = {
          incidents: [],
          city: incident.location_city,
          country: incident.location_country,
          latitude: incident.location_latitude,
          longitude: incident.location_longitude
        };
      }
      locationGroups[locationKey].incidents.push(incident);
    }

    const hotspots = [];

    // Analyze each location cluster
    for (const [locationKey, locationData] of Object.entries(locationGroups)) {
      const incidents: any[] = (locationData as any).incidents;
      
      // Only analyze if there are at least 3 incidents
      if (incidents.length < 3) continue;

      // Calculate recent trend
      const last30Days = incidents.filter(i => 
        new Date(i.created_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
      );
      const previous30Days = incidents.filter(i => {
        const time = new Date(i.created_at).getTime();
        return time <= Date.now() - 30 * 24 * 60 * 60 * 1000 &&
               time > Date.now() - 60 * 24 * 60 * 60 * 1000;
      });

      const trend = last30Days.length > previous30Days.length ? 'increasing' :
                    last30Days.length < previous30Days.length ? 'decreasing' : 'stable';

      // Prepare AI analysis with scientific frameworks
      const systemPrompt = `You are an expert in predictive analytics for conflict early warning systems, trained on UN OCHA Early Warning Framework, CEWARN (Conflict Early Warning and Response Mechanism) for Africa, OECD Risk Governance Guidelines, and AU Continental Early Warning System (CEWS) standards.

Analyze incident patterns to predict future hotspots where violence or conflict may escalate using:
1. Temporal Pattern Analysis (frequency, acceleration, cyclical patterns)
2. Spatial Clustering (geographic concentration, spread trajectories)
3. Severity Progression (escalation pathways, violence intensity trends)
4. Actor Dynamics (group behavior, mobilization signals)
5. Contextual Risk Factors (political, economic, environmental triggers)

Generate evidence-based interventions following the Prevention-Mitigation-Preparedness-Response framework.`;

      const analysisPrompt = `Analyze this location for hotspot prediction:

LOCATION: ${(locationData as any).city}, ${(locationData as any).country}

INCIDENT HISTORY (Last 90 days):
- Total Incidents: ${incidents.length}
- Last 30 Days: ${last30Days.length}
- Previous 30 Days: ${previous30Days.length}
- Trend: ${trend}

INCIDENT DETAILS:
${incidents.slice(0, 10).map(i => `- ${i.title} (${i.category}, ${i.severity_level || 'unknown'} severity) - ${new Date(i.created_at).toLocaleDateString()}`).join('\n')}

${incidents.length > 10 ? `... and ${incidents.length - 10} more incidents` : ''}

CATEGORIES BREAKDOWN:
${Object.entries(incidents.reduce((acc: any, i: any) => {
  acc[i.category] = (acc[i.category] || 0) + 1;
  return acc;
}, {})).map(([cat, count]) => `- ${cat}: ${count}`).join('\n')}

Predict the likelihood of this becoming a conflict hotspot in the next ${predictionDays} days.

Provide analysis in this JSON format:
{
  "hotspot_score": <0-100>,
  "risk_level": "<low|moderate|high|severe|critical>",
  "confidence_level": <0-100>,
  "prediction_factors": {
    "incident_frequency": "<assessment>",
    "escalation_trend": "<assessment>",
    "severity_progression": "<assessment>",
    "geographic_spread": "<assessment>"
  },
  "historical_patterns": {
    "recurring_violence": <true|false>,
    "seasonal_factors": "<description if any>",
    "similar_past_escalations": "<description if any>"
  },
  "recommended_interventions": [
    {
      "action": "<specific, actionable intervention based on OCHA/CEWARN standards>",
      "priority": "<immediate|urgent|high|medium|low>",
      "target": "<Government Authorities|Security Forces|Humanitarian Organizations|Community Leaders|UN Agencies|Regional Bodies|Civil Society>",
      "category": "<security|humanitarian|government|community|communication|logistics>",
      "timeframe": "<Within 24 hours|Within 72 hours|Within 1 week|Within 2 weeks>",
      "rationale": "<evidence basis from early warning best practices>",
      "resources": ["<resource1>", "<resource2>"],
      "kpis": ["<measurable indicator 1>", "<measurable indicator 2>"]
    }
  ],
  "monitoring_priority": "<low|medium|high|urgent>"
}

IMPORTANT: Generate 6-10 recommended interventions across ALL priority levels (immediate, urgent, high, medium, low) covering prevention, mitigation, preparedness, and response actions. Each intervention must be specific to this location's risk profile and grounded in CEWARN, AU CEWS, or UN early warning standards.`;

      try {
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
          if (aiResponse.status === 429) {
            throw new Error('AI rate limit exceeded');
          }
          if (aiResponse.status === 402) {
            throw new Error('AI credits exhausted');
          }
          console.error('AI error:', aiResponse.status);
          continue;
        }

        const aiResult = await aiResponse.json();
        const analysis = JSON.parse(aiResult.choices[0].message.content);

        // Only store if hotspot score is significant
        if (analysis.hotspot_score >= 40) {
          const { data: hotspot, error: insertError } = await supabase
            .from('predictive_hotspots')
            .insert({
              region_name: (locationData as any).city || 'Unknown',
              country: (locationData as any).country,
              latitude: (locationData as any).latitude || 0,
              longitude: (locationData as any).longitude || 0,
              radius_km: 25, // 25km radius
              hotspot_score: analysis.hotspot_score,
              risk_level: analysis.risk_level,
              prediction_window: `${predictionDays}_days`,
              confidence_level: analysis.confidence_level,
              incident_count_30d: last30Days.length,
              incident_trend: trend,
              historical_patterns: analysis.historical_patterns,
              ai_model_used: 'google/gemini-2.5-flash',
              prediction_factors: analysis.prediction_factors,
              recommended_interventions: analysis.recommended_interventions,
              monitoring_priority: analysis.monitoring_priority,
              valid_until: new Date(Date.now() + predictionDays * 24 * 60 * 60 * 1000).toISOString(),
              status: 'active'
            })
            .select()
            .single();

          if (!insertError && hotspot) {
            hotspots.push(hotspot);
          } else {
            console.error('Error storing hotspot:', insertError);
          }
        }
      } catch (aiError) {
        console.error('AI analysis error for location:', locationKey, aiError);
      }
    }

    // Sort hotspots by score
    hotspots.sort((a, b) => b.hotspot_score - a.hotspot_score);

    return new Response(
      JSON.stringify({
        success: true,
        hotspots,
        total_analyzed: Object.keys(locationGroups).length,
        hotspots_detected: hotspots.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in predict-hotspots:', error);
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