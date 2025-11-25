import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
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
    const { incidentId } = await req.json();
    
    if (!incidentId) {
      throw new Error('Incident ID is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the primary incident
    const { data: primaryIncident, error: fetchError } = await supabase
      .from('citizen_reports')
      .select('*')
      .eq('id', incidentId)
      .single();

    if (fetchError) throw fetchError;
    if (!primaryIncident) throw new Error('Incident not found');

    // Fetch recent incidents for correlation analysis (last 90 days)
    const { data: recentIncidents, error: recentError } = await supabase
      .from('citizen_reports')
      .select('*')
      .neq('id', incidentId)
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (recentError) throw recentError;

    const correlations = [];

    if (!recentIncidents || recentIncidents.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          correlations: [],
          message: 'No recent incidents found for correlation analysis'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Analyze each potential correlation
    for (const relatedIncident of recentIncidents) {
      const sharedCharacteristics: any = {};
      let correlationStrength = 0;
      let correlationType: string | null = null;

      // Calculate geographic distance
      let geographicDistance: number | null = null;
      if (primaryIncident.location_latitude && primaryIncident.location_longitude &&
          relatedIncident.location_latitude && relatedIncident.location_longitude) {
        geographicDistance = calculateDistance(
          primaryIncident.location_latitude,
          primaryIncident.location_longitude,
          relatedIncident.location_latitude,
          relatedIncident.location_longitude
        );
      }

      // Calculate temporal distance
      const temporalDistance = Math.abs(
        new Date(primaryIncident.created_at).getTime() - 
        new Date(relatedIncident.created_at).getTime()
      ) / (1000 * 60 * 60); // in hours

      // Check for same category/type
      if (primaryIncident.category === relatedIncident.category) {
        sharedCharacteristics.category = primaryIncident.category;
        correlationStrength += 20;
        if (!correlationType) correlationType = 'same_pattern';
      }

      // Check for same location
      if (primaryIncident.location_city === relatedIncident.location_city &&
          primaryIncident.location_country === relatedIncident.location_country) {
        sharedCharacteristics.location = `${primaryIncident.location_city}, ${primaryIncident.location_country}`;
        correlationStrength += 25;
        correlationType = 'same_location';
      }

      // Check for geographic proximity (within 200km)
      if (geographicDistance && geographicDistance < 200) {
        sharedCharacteristics.geographic_proximity = `${geographicDistance.toFixed(1)} km`;
        correlationStrength += Math.max(0, 30 * (1 - geographicDistance / 200));
      }

      // Check for temporal proximity (within 7 days)
      if (temporalDistance < 168) { // 7 days in hours
        sharedCharacteristics.temporal_proximity = `${temporalDistance.toFixed(0)} hours`;
        correlationStrength += Math.max(0, 25 * (1 - temporalDistance / 168));
        if (temporalDistance < 24) {
          correlationType = 'temporal';
        }
      }

      // Check for cross-border incidents
      const crossBorder = primaryIncident.location_country !== relatedIncident.location_country;
      if (crossBorder && geographicDistance && geographicDistance < 300) {
        sharedCharacteristics.cross_border = true;
        correlationStrength += 15;
        correlationType = 'cross_border';
      }

      // Check for similar characteristics
      if (primaryIncident.severity_level === relatedIncident.severity_level) {
        sharedCharacteristics.severity = primaryIncident.severity_level;
        correlationStrength += 10;
      }

      // Check for perpetrator type match
      if (primaryIncident.perpetrator_type && 
          primaryIncident.perpetrator_type === relatedIncident.perpetrator_type) {
        sharedCharacteristics.perpetrator_type = primaryIncident.perpetrator_type;
        correlationStrength += 15;
        correlationType = 'same_actor';
      }

      // If correlation strength is significant, analyze with AI
      if (correlationStrength >= 30) {
        const systemPrompt = `You are an expert in conflict analysis and pattern detection for early warning systems.
Analyze potential correlations between security incidents to identify escalation chains and related threats.`;

        const analysisPrompt = `Analyze the correlation between these two incidents:

PRIMARY INCIDENT:
- Title: ${primaryIncident.title}
- Category: ${primaryIncident.category}
- Location: ${primaryIncident.location_city}, ${primaryIncident.location_country}
- Date: ${primaryIncident.created_at}
- Description: ${primaryIncident.description}

RELATED INCIDENT:
- Title: ${relatedIncident.title}
- Category: ${relatedIncident.category}
- Location: ${relatedIncident.location_city}, ${relatedIncident.location_country}
- Date: ${relatedIncident.created_at}
- Description: ${relatedIncident.description}

COMPUTED METRICS:
- Geographic Distance: ${geographicDistance ? `${geographicDistance.toFixed(1)} km` : 'Unknown'}
- Time Difference: ${temporalDistance.toFixed(0)} hours
- Cross-Border: ${crossBorder ? 'Yes' : 'No'}
- Initial Correlation Strength: ${correlationStrength.toFixed(0)}%

Provide analysis in this JSON format:
{
  "is_correlated": <true|false>,
  "refined_correlation_strength": <0-100>,
  "pattern_detected": "<description of pattern if any>",
  "escalation_chain": <true|false>,
  "ai_analysis": {
    "relationship": "<description of how incidents relate>",
    "significance": "<why this correlation matters>",
    "risk_assessment": "<potential risks from this correlation>"
  }
}`;

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

          if (aiResponse.ok) {
            const aiResult = await aiResponse.json();
            const analysis = JSON.parse(aiResult.choices[0].message.content);

            if (analysis.is_correlated) {
              correlationStrength = analysis.refined_correlation_strength;
              
              // Store correlation in database
              const { data: correlation, error: corrError } = await supabase
                .from('incident_correlations')
                .insert({
                  primary_incident_id: incidentId,
                  related_incident_id: relatedIncident.id,
                  correlation_type: correlationType || 'same_pattern',
                  correlation_strength: correlationStrength,
                  shared_characteristics: sharedCharacteristics,
                  geographic_distance_km: geographicDistance,
                  temporal_distance_hours: Math.round(temporalDistance),
                  cross_border: crossBorder,
                  countries_involved: crossBorder 
                    ? [primaryIncident.location_country, relatedIncident.location_country]
                    : [primaryIncident.location_country],
                  ai_analysis: analysis.ai_analysis,
                  pattern_detected: analysis.pattern_detected,
                  escalation_chain: analysis.escalation_chain,
                  detected_by: 'ai_correlation_engine'
                })
                .select()
                .single();

              if (!corrError) {
                correlations.push(correlation);
              } else {
                console.error('Error storing correlation:', corrError);
              }
            }
          }
        } catch (aiError) {
          console.error('AI analysis error for correlation:', aiError);
          // Continue with next incident
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        correlations,
        total_found: correlations.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in detect-correlations:', error);
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