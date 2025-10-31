import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPPORTED_LANGUAGES = {
  en: 'English',
  sw: 'Swahili',
  ar: 'Arabic',
  am: 'Amharic',
  so: 'Somali',
  fr: 'French',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, fromLang, toLang, contentId, proposalId } = await req.json();

    if (!text || !toLang) {
      throw new Error('Text and target language are required');
    }

    if (!SUPPORTED_LANGUAGES[toLang]) {
      throw new Error(`Unsupported language: ${toLang}`);
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

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
            content: `You are a professional translator specializing in peace and conflict contexts. Translate the following text to ${SUPPORTED_LANGUAGES[toLang]}. Preserve the tone, cultural nuances, and meaning. Respond ONLY with the translated text, no explanations.`
          },
          {
            role: 'user',
            content: text
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
      throw new Error(`Translation service error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.choices[0].message.content;

    // Store translation
    if (contentId || proposalId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const table = contentId ? 'content' : 'proposals';
      const id = contentId || proposalId;

      // Get existing translations
      const { data: existing } = await supabase
        .from(table)
        .select('translations')
        .eq('id', id)
        .single();

      const translations = existing?.translations || {};
      translations[toLang] = translatedText;

      await supabase
        .from(table)
        .update({ translations })
        .eq('id', id);
    }

    return new Response(
      JSON.stringify({ success: true, translatedText, language: toLang }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});