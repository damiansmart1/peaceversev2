import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const request: PatternDetectionRequest = await req.json();
    const timeframeDays = request.timeframeDays || 90;

    console.log('Detecting patterns for:', request.country || 'All countries', `(${timeframeDays} days)`);

    // Fetch incidents for analysis
    let query = supabase
      .from('citizen_reports')
      .select('*')
      .gte('created_at', new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (request.country) {
      query = query.eq('location_country', request.country);
    }

    if (request.categories && request.categories.length > 0) {
      query = query.in('category', request.categories);
    }

    const { data: incidents, error: fetchError } = await query.limit(500);

    if (fetchError) throw fetchError;

    if (!incidents || incidents.length < 5) {
      return new Response(
        JSON.stringify({
          success: true,
          patterns: [],
          message: 'Insufficient data for pattern detection'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Pre-process data for pattern detection
    const categoryGroups: Record<string, any[]> = {};
    const locationGroups: Record<string, any[]> = {};
    const perpetratorGroups: Record<string, any[]> = {};
    const temporalData: Record<string, number> = {};
    const severityTrend: any[] = [];

    incidents.forEach(inc => {
      // Group by category
      if (!categoryGroups[inc.category]) categoryGroups[inc.category] = [];
      categoryGroups[inc.category].push(inc);

      // Group by location
      const locationKey = `${inc.location_country}|${inc.location_city || 'unknown'}`;
      if (!locationGroups[locationKey]) locationGroups[locationKey] = [];
      locationGroups[locationKey].push(inc);

      // Group by perpetrator type
      if (inc.perpetrator_type) {
        if (!perpetratorGroups[inc.perpetrator_type]) perpetratorGroups[inc.perpetrator_type] = [];
        perpetratorGroups[inc.perpetrator_type].push(inc);
      }

      // Temporal grouping (by week)
      const weekKey = new Date(inc.created_at).toISOString().substring(0, 10);
      temporalData[weekKey] = (temporalData[weekKey] || 0) + 1;

      // Severity tracking
      severityTrend.push({
        date: inc.created_at,
        severity: inc.severity_level,
        category: inc.category
      });
    });

    // Prepare pattern summary for AI
    const patternSummary = {
      totalIncidents: incidents.length,
      timeframeDays,
      categoryDistribution: Object.fromEntries(
        Object.entries(categoryGroups).map(([k, v]) => [k, v.length])
      ),
      topLocations: Object.entries(locationGroups)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 10)
        .map(([loc, incs]) => ({ location: loc, count: incs.length })),
      perpetratorTypes: Object.fromEntries(
        Object.entries(perpetratorGroups).map(([k, v]) => [k, v.length])
      ),
      temporalTrend: temporalData,
      severityBreakdown: {
        critical: incidents.filter(i => i.severity_level === 'critical').length,
        high: incidents.filter(i => i.severity_level === 'high').length,
        medium: incidents.filter(i => i.severity_level === 'medium').length,
        low: incidents.filter(i => i.severity_level === 'low').length
      },
      countries: [...new Set(incidents.map(i => i.location_country).filter(Boolean))],
      categories: [...new Set(incidents.map(i => i.category))]
    };

    // AI pattern detection
    const systemPrompt = `You are an expert conflict analyst specialized in pattern detection for early warning systems.

Your role is to analyze incident data and identify significant patterns that indicate:
1. Geographic Patterns: Concentration of incidents in specific areas
2. Temporal Patterns: Time-based trends (increasing/decreasing, cyclical)
3. Actor Patterns: Consistent perpetrator types or methods
4. Escalation Patterns: Signs of conflict escalation or de-escalation
5. Cross-Border Patterns: Incidents spanning multiple countries
6. Target Patterns: Consistent targeting of specific groups
7. Method Patterns: Similar tactics or approaches
8. Seasonal Patterns: Time-of-year correlations

For each pattern detected, provide:
- Pattern type and name
- Confidence level
- Affected areas
- Trend direction
- Risk implications
- Recommended monitoring actions`;

    const analysisPrompt = `Analyze this incident data for patterns:

DATA SUMMARY:
- Total Incidents: ${patternSummary.totalIncidents}
- Timeframe: Last ${timeframeDays} days
- Countries: ${patternSummary.countries.join(', ') || 'Various'}
- Categories: ${patternSummary.categories.join(', ')}

CATEGORY DISTRIBUTION:
${Object.entries(patternSummary.categoryDistribution).map(([c, n]) => `- ${c}: ${n} incidents`).join('\n')}

TOP LOCATIONS:
${patternSummary.topLocations.map(l => `- ${l.location}: ${l.count} incidents`).join('\n')}

PERPETRATOR TYPES:
${Object.entries(patternSummary.perpetratorTypes).map(([p, n]) => `- ${p}: ${n} incidents`).join('\n')}

SEVERITY BREAKDOWN:
- Critical: ${patternSummary.severityBreakdown.critical}
- High: ${patternSummary.severityBreakdown.high}
- Medium: ${patternSummary.severityBreakdown.medium}
- Low: ${patternSummary.severityBreakdown.low}

SAMPLE INCIDENTS:
${incidents.slice(0, 10).map(i => `- [${i.category}] ${i.title} in ${i.location_country} (${i.severity_level})`).join('\n')}

Provide detected patterns in this exact JSON structure:
{
  "patterns": [
    {
      "pattern_name": "<descriptive name>",
      "pattern_type": "<geographic|temporal|actor|method|target|escalation|seasonal|cross_border>",
      "description": "<detailed description of the pattern>",
      "confidence_score": <0-100>,
      "severity_trend": "<escalating|stable|de-escalating|unknown>",
      "countries_affected": ["<country1>", "<country2>"],
      "regions_affected": ["<region1>", "<region2>"],
      "incident_count": <number>,
      "start_date": "<ISO date when pattern started>",
      "recurrence_frequency": "<daily|weekly|monthly|sporadic|one-time>",
      "risk_implications": ["<implication1>", "<implication2>"],
      "ai_analysis": {
        "key_indicators": ["<indicator1>", "<indicator2>"],
        "contributing_factors": ["<factor1>", "<factor2>"],
        "prediction": "<what might happen next>"
      },
      "recommendations": [
        {
          "action": "<specific monitoring or response action>",
          "priority": "<immediate|urgent|high|medium|low>",
          "target_stakeholder": "<who should act>"
        }
      ]
    }
  ],
  "overall_assessment": {
    "trend_direction": "<escalating|stable|de-escalating|mixed>",
    "highest_concern": "<most concerning pattern>",
    "priority_areas": ["<area1>", "<area2>"],
    "summary": "<brief overall summary>"
  }
}

Identify 3-8 significant patterns. Focus on actionable insights.`;

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

    console.log('Pattern detection complete:', analysis.patterns?.length || 0, 'patterns found');

    // Store detected patterns
    const storedPatterns = [];
    for (const pattern of analysis.patterns || []) {
      const { data: storedPattern, error: insertError } = await supabase
        .from('incident_patterns')
        .insert({
          pattern_name: pattern.pattern_name,
          pattern_type: pattern.pattern_type,
          description: pattern.description,
          detection_criteria: {
            timeframe_days: timeframeDays,
            country_filter: request.country,
            category_filter: request.categories
          },
          incident_count: pattern.incident_count,
          countries_affected: pattern.countries_affected,
          regions_affected: pattern.regions_affected,
          start_date: pattern.start_date ? new Date(pattern.start_date).toISOString() : null,
          recurrence_frequency: pattern.recurrence_frequency,
          severity_trend: pattern.severity_trend,
          confidence_score: pattern.confidence_score,
          ai_analysis: pattern.ai_analysis,
          recommendations: pattern.recommendations,
          is_active: true,
          last_occurrence: new Date().toISOString()
        })
        .select()
        .single();

      if (!insertError && storedPattern) {
        storedPatterns.push(storedPattern);
      } else if (insertError) {
        console.error('Error storing pattern:', insertError);
      }
    }

    // Log the analysis
    await supabase.from('ai_analysis_logs').insert({
      analysis_type: 'pattern_detection',
      model_used: 'google/gemini-2.5-flash',
      input_data: patternSummary,
      output_data: analysis,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown'
    });

    return new Response(
      JSON.stringify({
        success: true,
        patterns: storedPatterns,
        overall_assessment: analysis.overall_assessment,
        data_summary: patternSummary
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in detect-patterns:', error);
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
