import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, contentId, proposalId, language = 'en' } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Call Lovable AI for sentiment analysis
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
            content: `You are a peace and conflict analysis expert. Analyze the sentiment, emotions, and risk indicators in the provided text. Focus on:
1. Overall sentiment (positive, negative, neutral)
2. Sentiment score (-1 to 1)
3. Key emotions detected
4. Topics discussed
5. Risk indicators (violence, tension, displacement, grievances)
6. Urgency level (low, medium, high, critical)

Respond ONLY with a valid JSON object in this exact format:
{
  "sentiment_score": <number between -1 and 1>,
  "sentiment_label": "<positive|negative|neutral>",
  "emotions": ["<emotion1>", "<emotion2>"],
  "topics": ["<topic1>", "<topic2>"],
  "risk_indicators": {
    "violence_risk": "<none|low|medium|high>",
    "tension_level": "<none|low|medium|high>",
    "displacement_risk": "<none|low|medium|high>",
    "urgency": "<low|medium|high|critical>"
  },
  "confidence_score": <number between 0 and 1>
}`
          },
          {
            role: 'user',
            content: `Analyze this ${language} text:\n\n${text}`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('AI service credits depleted. Please contact admin.');
      }
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    // Store in cache
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const cacheData = {
      content_id: contentId || null,
      proposal_id: proposalId || null,
      text_analyzed: text.substring(0, 500), // Store snippet
      language_code: language,
      sentiment_score: analysis.sentiment_score,
      sentiment_label: analysis.sentiment_label,
      emotions: analysis.emotions,
      topics: analysis.topics,
      risk_indicators: analysis.risk_indicators,
      confidence_score: analysis.confidence_score,
      model_version: 'gemini-2.5-flash-v1',
    };

    await supabase.from('sentiment_analysis_cache').insert(cacheData);

    // Update content/proposal with sentiment
    if (contentId) {
      await supabase
        .from('content')
        .update({
          sentiment_score: analysis.sentiment_score,
          sentiment_label: analysis.sentiment_label,
          risk_level: analysis.risk_indicators.urgency,
        })
        .eq('id', contentId);
    }

    if (proposalId) {
      await supabase
        .from('proposals')
        .update({
          sentiment_score: analysis.sentiment_score,
        })
        .eq('id', proposalId);
    }

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});