// Partner Intelligence Briefing - AI-generated SITREP / Flash / Exec summary
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

type BriefingType = 'sitrep' | 'flash' | 'exec_summary' | '3w_matrix';

interface ReqBody {
  type: BriefingType;
  context: {
    overview?: Record<string, any>;
    topCategories?: Array<{ category: string; count: number }>;
    topCountries?: Array<{ country: string; incidentCount: number; criticalCount: number; riskLevel: string }>;
    hotspots?: Array<{ region: string; country: string; riskLevel: string; primaryCategory: string }>;
    riskAssessment?: { riskScore: number; riskLevel: string; factors: string[] };
    dateRange?: { from?: string; to?: string };
    countryFilter?: string;
  };
}

const SYSTEM_PROMPTS: Record<BriefingType, string> = {
  sitrep: `You are a senior humanitarian analyst writing an OCHA-aligned Situation Report (SITREP).
Produce a concise, professional SITREP in markdown with these sections:
**1. Situation Overview**, **2. Key Developments**, **3. Humanitarian Impact**, **4. Response & Coordination**, **5. Priority Needs**, **6. Outlook (72h)**.
Use specific figures from the data. Neutral, factual tone. ~500 words.`,
  flash: `You are an early-warning analyst writing a Flash Update.
Produce a short, urgent markdown alert with sections: **Headline**, **What's Happening**, **Why It Matters**, **Immediate Recommendations**.
Tight, action-oriented, <250 words.`,
  exec_summary: `You are briefing executive leadership.
Write a 1-page markdown executive summary: **TL;DR (2 lines)**, **Key Metrics**, **Top 3 Risks**, **Strategic Recommendations**, **Decisions Required**.
Plain English, decision-grade.`,
  '3w_matrix': `You are coordinating humanitarian response.
Produce a 3W (Who / What / Where) coordination matrix in markdown as a table, inferring plausible partner activities from the incident hotspots. Include a short narrative of coordination gaps below the table.`,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI gateway not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { type, context }: ReqBody = await req.json();
    if (!type || !SYSTEM_PROMPTS[type]) {
      return new Response(JSON.stringify({ error: 'Invalid briefing type' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userPrompt = `Generate a ${type} briefing using this analytics snapshot:\n\n` +
      `Date range: ${context.dateRange?.from || 'all'} -> ${context.dateRange?.to || 'now'}\n` +
      `Country filter: ${context.countryFilter || 'All Africa'}\n\n` +
      `OVERVIEW: ${JSON.stringify(context.overview ?? {}, null, 2)}\n\n` +
      `TOP CATEGORIES: ${JSON.stringify(context.topCategories ?? [], null, 2)}\n\n` +
      `TOP COUNTRIES: ${JSON.stringify(context.topCountries ?? [], null, 2)}\n\n` +
      `HOTSPOTS: ${JSON.stringify(context.hotspots ?? [], null, 2)}\n\n` +
      `RISK: ${JSON.stringify(context.riskAssessment ?? {}, null, 2)}`;

    const aiRes = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPTS[type] },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit reached. Please try again shortly.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please top up Lovable AI credits.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: `AI gateway error: ${aiRes.status} ${errText}` }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await aiRes.json();
    const content = data?.choices?.[0]?.message?.content ?? '';

    return new Response(JSON.stringify({
      type,
      content,
      generated_at: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
