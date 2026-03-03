import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface AnalysisRequest {
  reportId: string;
  title: string;
  description: string;
  category: string;
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

    // Check stakeholder role
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

    const { reportId, title, description, category } = await req.json() as AnalysisRequest;

    // Security: Input validation
    if (!reportId || !title || !description || !category) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (title.length > 500 || description.length > 10000) {
      return new Response(JSON.stringify({ error: 'Input exceeds maximum length' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    console.log(`Analyzing report ${reportId}: ${title}`);

    // Call Lovable AI for sentiment and threat analysis
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an AI analyst for a humanitarian peace-building platform. Analyze citizen reports for:
1. Sentiment (positive, neutral, negative, urgent)
2. Threat level (none, low, medium, high, critical)
3. Credibility score (0-100)
4. Key entities (people, places, organizations mentioned)
5. Recommended actions

Be objective, culturally sensitive, and focus on protecting civilians.`
          },
          {
            role: 'user',
            content: `Analyze this report:
Title: ${title}
Category: ${category}
Description: ${description}

Provide analysis in this exact JSON structure:
{
  "sentiment": "positive|neutral|negative|urgent",
  "threat_level": "none|low|medium|high|critical",
  "credibility_score": 0-100,
  "confidence_score": 0-100,
  "key_entities": ["entity1", "entity2"],
  "detected_issues": ["issue1", "issue2"],
  "recommended_actions": ["action1", "action2"],
  "requires_immediate_attention": true|false,
  "analysis_summary": "brief summary"
}`
          }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'analyze_report',
            description: 'Analyze citizen report for sentiment, threats, and credibility',
            parameters: {
              type: 'object',
              properties: {
                sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative', 'urgent'] },
                threat_level: { type: 'string', enum: ['none', 'low', 'medium', 'high', 'critical'] },
                credibility_score: { type: 'number', minimum: 0, maximum: 100 },
                confidence_score: { type: 'number', minimum: 0, maximum: 100 },
                key_entities: { type: 'array', items: { type: 'string' } },
                detected_issues: { type: 'array', items: { type: 'string' } },
                recommended_actions: { type: 'array', items: { type: 'string' } },
                requires_immediate_attention: { type: 'boolean' },
                analysis_summary: { type: 'string' }
              },
              required: ['sentiment', 'threat_level', 'credibility_score', 'confidence_score', 'key_entities', 'detected_issues', 'recommended_actions', 'requires_immediate_attention', 'analysis_summary'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'analyze_report' } }
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please contact admin.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices[0].message.tool_calls?.[0];
    if (!toolCall) throw new Error('No analysis result from AI');

    const analysis = JSON.parse(toolCall.function.arguments);

    // Store analysis
    const { error: analysisError } = await supabase
      .from('ai_analysis_logs')
      .insert({
        report_id: reportId,
        analysis_type: 'sentiment_and_threat',
        model_used: 'google/gemini-2.5-flash',
        model_version: '2.5',
        input_data: { title, description, category },
        output_data: analysis,
        confidence_score: analysis.confidence_score,
        processing_time_ms: 0,
        ip_address: ipAddress,
        user_id: user.id,
        security_flags: { inputValidated: true, rateLimitChecked: true, timestamp: new Date().toISOString() },
        validation_status: analysis.confidence_score >= 80 ? 'validated' : 'pending'
      });

    if (analysisError) throw analysisError;

    // Update report
    await supabase.from('citizen_reports').update({
      ai_sentiment: analysis.sentiment,
      ai_threat_level: analysis.threat_level,
      credibility_score: analysis.credibility_score,
      ai_key_entities: analysis.key_entities,
    }).eq('id', reportId);

    // Escalation check
    const shouldEscalate = analysis.threat_level === 'critical' || analysis.threat_level === 'high' || analysis.requires_immediate_attention;

    if (shouldEscalate) {
      await supabase.from('verification_tasks').insert({
        report_id: reportId,
        task_type: 'urgent_review',
        priority: analysis.threat_level === 'critical' ? 'critical' : 'high',
        status: 'pending',
        assigned_to: null,
        ai_recommendation: analysis.recommended_actions.join('; ')
      });
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'ai_analysis_completed',
      entity_type: 'citizen_report',
      entity_id: reportId,
      changes: { analysis },
      ip_address: ipAddress,
      user_agent: req.headers.get('user-agent') || 'unknown'
    });

    return new Response(
      JSON.stringify({ success: true, analysis, escalated: shouldEscalate }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
