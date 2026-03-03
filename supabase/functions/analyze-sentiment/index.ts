import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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
    // --- END AUTH CHECK ---

    const { text, contentId, proposalId, language = 'en' } = await req.json();

    if (!text) throw new Error('Text is required');
    if (text.length > 10000) throw new Error('Text exceeds maximum length');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a peace and conflict analysis expert. Analyze sentiment, emotions, and risk indicators. Respond ONLY with valid JSON: { "sentiment_score": -1 to 1, "sentiment_label": "positive|negative|neutral", "emotions": [], "topics": [], "risk_indicators": { "violence_risk": "none|low|medium|high", "tension_level": "none|low|medium|high", "displacement_risk": "none|low|medium|high", "urgency": "low|medium|high|critical" }, "confidence_score": 0 to 1 }`
          },
          { role: 'user', content: `Analyze this ${language} text:\n\n${text}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) throw new Error('Rate limit exceeded.');
      if (response.status === 402) throw new Error('AI credits depleted.');
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    await supabase.from('sentiment_analysis_cache').insert({
      content_id: contentId || null,
      proposal_id: proposalId || null,
      text_analyzed: text.substring(0, 500),
      language_code: language,
      sentiment_score: analysis.sentiment_score,
      sentiment_label: analysis.sentiment_label,
      emotions: analysis.emotions,
      topics: analysis.topics,
      risk_indicators: analysis.risk_indicators,
      confidence_score: analysis.confidence_score,
      model_version: 'gemini-2.5-flash-v1',
    });

    if (contentId) {
      await supabase.from('content').update({
        sentiment_score: analysis.sentiment_score,
        sentiment_label: analysis.sentiment_label,
        risk_level: analysis.risk_indicators.urgency,
      }).eq('id', contentId);
    }

    if (proposalId) {
      await supabase.from('proposals').update({
        sentiment_score: analysis.sentiment_score,
      }).eq('id', proposalId);
    }

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
