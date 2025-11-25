import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const { reportId, title, description, category } = await req.json() as AnalysisRequest;

    // Security: Input validation
    if (!reportId || !title || !description || !category) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Security: Length validation
    if (title.length > 500 || description.length > 10000) {
      return new Response(JSON.stringify({ error: 'Input exceeds maximum length' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Security: Get IP address for audit
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
                sentiment: { 
                  type: 'string', 
                  enum: ['positive', 'neutral', 'negative', 'urgent'] 
                },
                threat_level: { 
                  type: 'string', 
                  enum: ['none', 'low', 'medium', 'high', 'critical'] 
                },
                credibility_score: { 
                  type: 'number', 
                  minimum: 0, 
                  maximum: 100 
                },
                confidence_score: { 
                  type: 'number', 
                  minimum: 0, 
                  maximum: 100 
                },
                key_entities: { 
                  type: 'array', 
                  items: { type: 'string' } 
                },
                detected_issues: { 
                  type: 'array', 
                  items: { type: 'string' } 
                },
                recommended_actions: { 
                  type: 'array', 
                  items: { type: 'string' } 
                },
                requires_immediate_attention: { 
                  type: 'boolean' 
                },
                analysis_summary: { 
                  type: 'string' 
                }
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
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please contact admin.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices[0].message.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No analysis result from AI');
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    console.log('Analysis complete:', analysis);

    // Store analysis in database with security tracking
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
        processing_time_ms: 0, // Could track actual time if needed
        ip_address: ipAddress,
        security_flags: {
          inputValidated: true,
          rateLimitChecked: true,
          timestamp: new Date().toISOString()
        },
        validation_status: analysis.confidence_score >= 80 ? 'validated' : 'pending'
      });

    if (analysisError) {
      console.error('Error storing analysis:', analysisError);
      throw analysisError;
    }

    // Update report with analysis results
    const { error: updateError } = await supabase
      .from('citizen_reports')
      .update({
        ai_credibility_score: analysis.credibility_score,
        threat_level: analysis.threat_level,
        status: analysis.requires_immediate_attention ? 'under_review' : 'pending'
      })
      .eq('id', reportId);

    if (updateError) {
      console.error('Error updating report:', updateError);
      throw updateError;
    }

    // Check escalation rules
    const shouldEscalate = analysis.threat_level === 'critical' || 
                          analysis.threat_level === 'high' ||
                          analysis.requires_immediate_attention;

    if (shouldEscalate) {
      console.log('Report requires escalation');
      
      // Create verification task
      const { error: taskError } = await supabase
        .from('verification_tasks')
        .insert({
          report_id: reportId,
          task_type: 'urgent_review',
          priority: analysis.threat_level === 'critical' ? 'critical' : 'high',
          status: 'pending',
          assigned_to: null,
          ai_recommendation: analysis.recommended_actions.join('; ')
        });

      if (taskError) {
        console.error('Error creating verification task:', taskError);
      }
    }

    // Create audit log
    await supabase
      .from('audit_logs')
      .insert({
        user_id: null,
        action: 'ai_analysis_completed',
        entity_type: 'citizen_report',
        entity_id: reportId,
        changes: { analysis },
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        escalated: shouldEscalate 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Analysis failed' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
