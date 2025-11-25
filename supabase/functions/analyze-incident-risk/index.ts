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

    // Fetch incident details
    const { data: incident, error: fetchError } = await supabase
      .from('citizen_reports')
      .select('*')
      .eq('id', incidentId)
      .single();

    if (fetchError) throw fetchError;
    if (!incident) throw new Error('Incident not found');

    // Fetch related incidents in the area (within 50km)
    const { data: nearbyIncidents } = await supabase
      .from('citizen_reports')
      .select('id, title, category, severity_level, created_at, location_latitude, location_longitude')
      .neq('id', incidentId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(20);

    // Prepare AI analysis request
    const systemPrompt = `You are an expert conflict analyst and early warning system AI for analyzing security incidents across Africa. 
Your role is to assess incident risk levels with extreme accuracy to help prevent conflict escalation.

Analyze incidents based on:
1. Severity factors: casualties, injuries, violence level, vulnerable groups affected
2. Urgency factors: immediacy of threat, response time needed, escalation potential
3. Impact factors: population affected, infrastructure damage, economic impact
4. Escalation probability: likelihood of worsening, spread to other areas
5. Contagion risk: potential for triggering similar incidents elsewhere

Provide scores on 0-100 scale and classify threat level as: low, medium, high, critical, or imminent.`;

    const analysisPrompt = `Analyze this incident and provide a comprehensive risk assessment:

INCIDENT DETAILS:
- Title: ${incident.title}
- Category: ${incident.category}${incident.sub_category ? ` / ${incident.sub_category}` : ''}
- Severity: ${incident.severity_level || 'Not specified'}
- Urgency: ${incident.urgency_level || 'Not specified'}
- Description: ${incident.description}
- Location: ${incident.location_city || 'Unknown'}, ${incident.location_country || 'Unknown'}
- Date: ${incident.incident_date || incident.created_at}
- Casualties: ${incident.casualties_reported || 0}
- Injuries: ${incident.injuries_reported || 0}
- People Affected: ${incident.estimated_people_affected || 'Unknown'}
- Vulnerable Groups: ${incident.vulnerable_groups_affected?.join(', ') || 'None specified'}
- Children Involved: ${incident.children_involved ? 'Yes' : 'No'}
- Infrastructure Damage: ${incident.infrastructure_damage?.join(', ') || 'None reported'}
- Services Disrupted: ${incident.services_disrupted?.join(', ') || 'None'}
- Authority Response: ${incident.authorities_responded ? 'Yes' : 'No'}
- Historical Context: ${incident.historical_context || 'None provided'}
- Recurring Issue: ${incident.recurring_issue ? 'Yes' : 'No'}

NEARBY INCIDENTS (Last 30 days):
${nearbyIncidents && nearbyIncidents.length > 0 
  ? nearbyIncidents.map(ni => `- ${ni.category} incident: "${ni.title}" (${ni.severity_level || 'unknown'} severity, ${new Date(ni.created_at).toLocaleDateString()})`).join('\n')
  : 'No similar incidents reported nearby recently'}

Provide your analysis in this exact JSON structure:
{
  "overall_risk_score": <0-100>,
  "threat_level": "<low|medium|high|critical|imminent>",
  "severity_score": <0-100>,
  "urgency_score": <0-100>,
  "impact_score": <0-100>,
  "escalation_probability": <0-100>,
  "contagion_risk": <0-100>,
  "ai_confidence": <0-100>,
  "ai_reasoning": {
    "primary_concerns": ["<concern1>", "<concern2>"],
    "escalation_factors": ["<factor1>", "<factor2>"],
    "mitigation_factors": ["<factor1>", "<factor2>"]
  },
  "contributing_factors": {
    "high_risk": ["<factor1>", "<factor2>"],
    "moderate_risk": ["<factor1>"],
    "low_risk": ["<factor1>"]
  },
  "risk_indicators": {
    "violence_level": "<assessment>",
    "community_tension": "<assessment>",
    "response_capacity": "<assessment>",
    "external_factors": "<assessment>"
  },
  "escalation_timeline": "<24-48 hours|3-7 days|1-2 weeks|unlikely>",
  "predicted_impact_area": ["<region1>", "<region2>"],
  "recommended_actions": [
    {
      "action": "<action description>",
      "priority": "<immediate|urgent|high|medium>",
      "target": "<who should do it>"
    }
  ]
}`;

    // Call Lovable AI for analysis
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
        throw new Error('AI rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI credits exhausted. Please add funds to continue.');
      }
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      throw new Error('AI analysis failed');
    }

    const aiResult = await aiResponse.json();
    const analysis = JSON.parse(aiResult.choices[0].message.content);

    console.log('AI Risk Analysis:', JSON.stringify(analysis, null, 2));

    // Store risk score in database
    const { data: riskScore, error: insertError } = await supabase
      .from('incident_risk_scores')
      .insert({
        incident_id: incidentId,
        overall_risk_score: analysis.overall_risk_score,
        threat_level: analysis.threat_level,
        severity_score: analysis.severity_score,
        urgency_score: analysis.urgency_score,
        impact_score: analysis.impact_score,
        escalation_probability: analysis.escalation_probability,
        contagion_risk: analysis.contagion_risk,
        ai_confidence: analysis.ai_confidence,
        ai_reasoning: analysis.ai_reasoning,
        contributing_factors: analysis.contributing_factors,
        risk_indicators: analysis.risk_indicators,
        escalation_timeline: analysis.escalation_timeline,
        predicted_impact_area: analysis.predicted_impact_area,
        recommended_actions: analysis.recommended_actions,
        calculated_by: 'ai_risk_engine'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing risk score:', insertError);
      throw insertError;
    }

    // Check if critical alert should be triggered
    if (analysis.threat_level === 'critical' || analysis.threat_level === 'imminent') {
      // Create alert
      await supabase.from('alert_logs').insert({
        severity: analysis.threat_level === 'imminent' ? 'emergency' : 'critical',
        title: `Critical Incident: ${incident.title}`,
        message: `High-risk incident detected with ${analysis.overall_risk_score}/100 risk score. Immediate attention required.`,
        alert_type: 'risk_score',
        incident_ids: [incidentId],
        channels_sent: ['in_app'],
        context_data: {
          risk_score: analysis.overall_risk_score,
          threat_level: analysis.threat_level,
          primary_concerns: analysis.ai_reasoning.primary_concerns,
          recommended_actions: analysis.recommended_actions
        }
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        risk_score: riskScore,
        alert_triggered: analysis.threat_level === 'critical' || analysis.threat_level === 'imminent'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in analyze-incident-risk:', error);
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