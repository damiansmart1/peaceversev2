import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const request: SafetyAnalysisRequest = await req.json();

    console.log('Analyzing reporter safety for incident:', request.incidentId);

    // Fetch the incident details
    const { data: incident, error: incidentError } = await supabase
      .from('citizen_reports')
      .select('*')
      .eq('id', request.incidentId)
      .single();

    if (incidentError || !incident) {
      throw new Error('Incident not found');
    }

    // Fetch related incidents in the area that might indicate danger
    const { data: nearbyThreats } = await supabase
      .from('citizen_reports')
      .select('id, category, severity_level, perpetrator_type, location_city, location_country, created_at')
      .eq('location_country', incident.location_country)
      .in('severity_level', ['critical', 'high'])
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .neq('id', request.incidentId)
      .limit(20);

    // Fetch existing safety profile if any
    let existingProfile = null;
    if (request.reporterId) {
      const { data: profile } = await supabase
        .from('reporter_safety_profiles')
        .select('*')
        .eq('reporter_id', request.reporterId)
        .single();
      existingProfile = profile;
    }

    // AI-powered safety analysis
    const systemPrompt = `You are a protection specialist AI trained in humanitarian protection protocols, witness protection standards, and conflict zone safety assessment.

Your role is to analyze potential risks to reporters of incidents and generate protection recommendations following:
- ICRC Protection Guidelines
- OHCHR Defender Protection Standards
- Witness Protection Best Practices
- Conflict Zone Journalism Safety Protocols

RISK FACTORS TO ASSESS:
1. Retaliation Risk: Likelihood of perpetrators targeting the reporter
2. Location Safety: Is the reporter in a high-risk area?
3. Identification Risk: How easily can the reporter be identified?
4. Historical Patterns: Are there precedents of witness harassment?
5. Digital Security: Communication and data vulnerabilities
6. Physical Security: Access to safe locations and exit routes

PROTECTION MEASURES:
- Communication security (encrypted channels)
- Location masking and safe house options
- Legal protection mechanisms
- Community support networks
- Emergency extraction protocols
- Witness relocation programs`;

    const analysisPrompt = `Analyze the safety situation for a reporter who submitted this incident:

INCIDENT REPORTED:
- Category: ${incident.category}
- Severity: ${incident.severity_level || 'Not specified'}
- Location: ${incident.location_city || 'Unknown'}, ${incident.location_country || 'Unknown'}
- Perpetrator Type: ${incident.perpetrator_type || 'Not specified'}
- Is Anonymous: ${incident.is_anonymous}
- Description: ${incident.description?.substring(0, 500)}

NEARBY HIGH-RISK INCIDENTS (Last 30 days):
${nearbyThreats && nearbyThreats.length > 0 
  ? nearbyThreats.map(t => `- ${t.category} (${t.severity_level}): ${t.perpetrator_type || 'Unknown actor'} in ${t.location_city || t.location_country}`).join('\n')
  : 'No recent high-risk incidents nearby'}

REPORTER CONTEXT:
- Has existing safety profile: ${existingProfile ? 'Yes' : 'No'}
- Current safety score: ${existingProfile?.safety_score || 'Not assessed'}
- Location masking enabled: ${existingProfile?.location_masking_enabled !== false}

Provide analysis in this exact JSON structure:
{
  "safety_score": <0-100, higher is safer>,
  "risk_level": "<low|medium|high|critical>",
  "is_in_danger_zone": <true|false>,
  "threat_indicators": {
    "retaliation_risk": "<none|low|medium|high|critical>",
    "identification_risk": "<none|low|medium|high|critical>",
    "location_risk": "<none|low|medium|high|critical>",
    "digital_risk": "<none|low|medium|high|critical>",
    "physical_risk": "<none|low|medium|high|critical>"
  },
  "immediate_threats": ["<threat1>", "<threat2>"],
  "protection_measures": ["<measure1>", "<measure2>", "<measure3>"],
  "safety_protocols": ["<protocol1>", "<protocol2>"],
  "recommended_actions": [
    {
      "action": "<specific action>",
      "priority": "<immediate|urgent|high|medium|low>",
      "category": "<communication|location|legal|community|digital|physical>"
    }
  ],
  "should_trigger_alert": <true|false>,
  "alert_severity": "<low|medium|high|critical|emergency>",
  "analysis_summary": "<brief summary of safety situation>"
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

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const analysis = JSON.parse(aiResult.choices[0].message.content);

    console.log('Safety analysis complete:', analysis.risk_level, 'Score:', analysis.safety_score);

    // Upsert safety profile
    const profileData = {
      reporter_id: request.reporterId || null,
      anonymous_reporter_hash: request.anonymousHash || null,
      safety_score: analysis.safety_score,
      risk_level: analysis.risk_level,
      is_in_danger_zone: analysis.is_in_danger_zone,
      threat_indicators: analysis.threat_indicators,
      protection_measures: analysis.protection_measures,
      safety_protocols_active: analysis.safety_protocols,
      last_safety_check: new Date().toISOString(),
      last_known_safe_location: request.locationData || null,
      updated_at: new Date().toISOString()
    };

    let safetyProfile;
    if (existingProfile) {
      const { data, error } = await supabase
        .from('reporter_safety_profiles')
        .update(profileData)
        .eq('id', existingProfile.id)
        .select()
        .single();
      
      if (error) throw error;
      safetyProfile = data;
    } else if (request.reporterId || request.anonymousHash) {
      const { data, error } = await supabase
        .from('reporter_safety_profiles')
        .insert(profileData)
        .select()
        .single();
      
      if (error) throw error;
      safetyProfile = data;
    }

    // Create safety alert if needed
    if (analysis.should_trigger_alert && (analysis.risk_level === 'high' || analysis.risk_level === 'critical')) {
      const { error: alertError } = await supabase
        .from('safety_alerts')
        .insert({
          alert_type: analysis.is_in_danger_zone ? 'location_compromised' : 'reporter_at_risk',
          severity: analysis.alert_severity,
          reporter_id: request.reporterId || null,
          anonymous_hash: request.anonymousHash || null,
          incident_id: request.incidentId,
          title: `Reporter Safety Alert: ${analysis.risk_level.toUpperCase()} Risk`,
          message: analysis.analysis_summary,
          threat_details: {
            threat_indicators: analysis.threat_indicators,
            immediate_threats: analysis.immediate_threats
          },
          recommended_actions: analysis.recommended_actions.map((a: any) => `[${a.priority}] ${a.action}`),
          location_data: request.locationData || null,
          status: 'active'
        });

      if (alertError) {
        console.error('Error creating safety alert:', alertError);
      } else {
        console.log('Safety alert created for reporter');
      }
    }

    // Log the analysis
    await supabase.from('ai_analysis_logs').insert({
      report_id: request.incidentId,
      analysis_type: 'reporter_safety',
      model_used: 'google/gemini-2.5-flash',
      output_data: analysis,
      confidence_score: analysis.safety_score,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown'
    });

    return new Response(
      JSON.stringify({
        success: true,
        safety_analysis: analysis,
        safety_profile: safetyProfile,
        alert_triggered: analysis.should_trigger_alert
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in analyze-reporter-safety:', error);
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
