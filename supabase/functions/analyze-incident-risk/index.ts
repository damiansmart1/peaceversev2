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

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

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
    const hasAccess = roles?.some(r =>
      ['admin', 'verifier', 'government', 'partner'].includes(r.role)
    );
    if (!hasAccess) {
      return new Response(JSON.stringify({ error: 'Forbidden: Insufficient role' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // --- END AUTH CHECK ---

    const { incidentId } = await req.json();
    
    if (!incidentId) {
      throw new Error('Incident ID is required');
    }

    // Fetch incident details
    const { data: incident, error: fetchError } = await supabase
      .from('citizen_reports')
      .select('*')
      .eq('id', incidentId)
      .single();

    if (fetchError) throw fetchError;
    if (!incident) throw new Error('Incident not found');

    // Fetch related incidents
    const { data: nearbyIncidents } = await supabase
      .from('citizen_reports')
      .select('id, title, category, severity_level, created_at, location_latitude, location_longitude')
      .neq('id', incidentId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(20);

    // AI analysis (multi-form conflict framework)
    const systemPrompt = `You are an expert conflict analyst and early warning system AI for a multi-form conflict framework. Assess incidents across BOTH traditional and non-traditional conflict forms: physical violence and security incidents; psychological intimidation, fear and coercion; emotional distress tied to rising community tension; political polarization and election-related hostility; intercommunal, ethnic, religious or identity-based tension; online harassment, inflammatory narratives and misinformation; discrimination, exclusion and disputes over public services or resources; and deteriorating relationships between communities and institutions. Assess risk levels with scientific precision following UN OCHA, Sphere Standards, ICRC guidelines. Provide scores on 0-100 scale and classify threat level as: low, medium, high, critical, or imminent.

CRITICAL GUARDRAILS:
- Every output is a PROVISIONAL indicator requiring contextual interpretation and, where necessary, human review. Set human_review_required true unless a human reviewer has already confirmed the assessment.
- Never treat sentiment, emotional language, or an unverified allegation as proof that violence will occur.
- Avoid political profiling, collective blame of communities, and unsupported predictions about individuals or groups. Describe risks in terms of behaviours, situations and dynamics — never identity groups as inherently dangerous.
- Classify the pattern signal: "isolated" (single dispute unlikely to spread), "recurring" (similar reports repeating over time/place), or "escalating" (rising frequency, severity or spread).`;

    const conflictFormsText = (incident.conflict_forms || []).join(', ') || 'not specified';

    const analysisPrompt = `Analyze this incident risk:\nTitle: ${incident.title}\nCategory: ${incident.category}${incident.sub_category ? ` / ${incident.sub_category}` : ''}\nReporter-described situation types: ${conflictFormsText}\nSeverity: ${incident.severity_level || 'Not specified'}\nDescription: ${incident.description}\nLocation: ${incident.location_city || 'Unknown'}, ${incident.location_country || 'Unknown'}\nCasualties: ${incident.casualties_reported || 0}, Injuries: ${incident.injuries_reported || 0}\nPeople Affected: ${incident.estimated_people_affected || 'Unknown'}\nVulnerable Groups: ${incident.vulnerable_groups_affected?.join(', ') || 'None'}\nChildren Involved: ${incident.children_involved ? 'Yes' : 'No'}\nRecurring: ${incident.recurring_issue ? 'Yes' : 'No'}\nNearby incidents (30d): ${nearbyIncidents?.length || 0}\nNearby incident categories: ${nearbyIncidents?.map(i => i.category).join(', ') || 'none'}\n\nAssess all applicable conflict forms (physical, psychological, emotional, political, identity-based, online harms, discrimination/exclusion, institutional trust deterioration). Identify whether this looks isolated, recurring, or escalating.\n\nProvide JSON: { "overall_risk_score": 0-100, "threat_level": "low|medium|high|critical|imminent", "severity_score": 0-100, "urgency_score": 0-100, "impact_score": 0-100, "escalation_probability": 0-100, "contagion_risk": 0-100, "ai_confidence": 0-100, "pattern_signal": "isolated|recurring|escalating", "human_review_required": true, "ai_reasoning": { "primary_concerns": [], "escalation_factors": [], "mitigation_factors": [] }, "contributing_factors": { "high_risk": [], "moderate_risk": [], "low_risk": [] }, "risk_indicators": { "violence_level": "", "community_tension": "", "response_capacity": "", "external_factors": "" }, "escalation_timeline": "", "predicted_impact_area": [], "recommended_actions": [{ "action": "", "priority": "", "target": "", "category": "", "timeframe": "", "rationale": "", "resources": [], "kpis": [] }] }`;

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
      if (aiResponse.status === 429) throw new Error('AI rate limit exceeded.');
      if (aiResponse.status === 402) throw new Error('AI credits exhausted.');
      throw new Error('AI analysis failed');
    }

    const aiResult = await aiResponse.json();
    const analysis = JSON.parse(aiResult.choices[0].message.content);

    // Store risk score (AI assessments are provisional indicators requiring human review)
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
        pattern_signal: analysis.pattern_signal || null,
        human_review_required: analysis.human_review_required !== false,
        calculated_by: 'ai_risk_engine'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Critical alert
    if (analysis.threat_level === 'critical' || analysis.threat_level === 'imminent') {
      await supabase.from('alert_logs').insert({
        severity: analysis.threat_level === 'imminent' ? 'emergency' : 'critical',
        title: `Critical Incident: ${incident.title}`,
        message: `High-risk incident detected with ${analysis.overall_risk_score}/100 risk score.`,
        alert_type: 'risk_score',
        incident_ids: [incidentId],
        channels_sent: ['in_app'],
        context_data: {
          risk_score: analysis.overall_risk_score,
          threat_level: analysis.threat_level,
          primary_concerns: analysis.ai_reasoning.primary_concerns,
        }
      });
    }

    return new Response(
      JSON.stringify({ success: true, risk_score: riskScore, alert_triggered: analysis.threat_level === 'critical' || analysis.threat_level === 'imminent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-incident-risk:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
