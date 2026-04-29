import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AI_GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';
const MODEL = 'google/gemini-3-flash-preview';

function getSupabase() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { briefingId } = await req.json();
    if (!briefingId) throw new Error('briefingId required');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const supabase = getSupabase();

    // Verify caller owns briefing
    let userId: string | null = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id || null;
    }
    if (!userId) throw new Error('Authentication required');

    const { data: briefing, error: bErr } = await supabase
      .from('nuru_briefings')
      .select('*')
      .eq('id', briefingId)
      .eq('user_id', userId)
      .single();
    if (bErr || !briefing) throw new Error('Briefing not found');

    // Gather source documents matching topics/countries/explicit IDs
    let docsQuery = supabase
      .from('civic_documents')
      .select('id, title, document_type, country, topics, summary, ai_summary, publish_date')
      .eq('status', 'published')
      .order('publish_date', { ascending: false, nullsFirst: false })
      .limit(15);

    const filters: string[] = [];
    if (briefing.document_ids?.length) {
      const ids = briefing.document_ids.map((id: string) => `id.eq.${id}`).join(',');
      filters.push(ids);
    }
    if (briefing.countries?.length) {
      filters.push(briefing.countries.map((c: string) => `country.eq.${c}`).join(','));
    }
    if (filters.length) docsQuery = docsQuery.or(filters.join(','));

    const { data: docs } = await docsQuery;

    const filteredDocs = (docs || []).filter((d: any) => {
      if (!briefing.topics?.length) return true;
      const docTopics = (d.topics || []).map((t: string) => t.toLowerCase());
      return briefing.topics.some((t: string) => docTopics.includes(t.toLowerCase()));
    }).slice(0, 8);

    if (filteredDocs.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No matching documents found for this briefing'
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const corpus = filteredDocs.map((d: any, i: number) =>
      `[${i + 1}] ${d.title} (${d.document_type}, ${d.country || 'regional'})\nSummary: ${d.summary || JSON.stringify(d.ai_summary || {}).slice(0, 600)}`
    ).join('\n\n');

    const systemPrompt = `You are NuruAI's Briefing Engine. Generate a concise executive briefing for a civic stakeholder. Format the output as markdown with these sections:

# ${briefing.title}
**Period**: ${briefing.frequency} digest · ${new Date().toLocaleDateString()}

## 🎯 Top 3 Insights
Numbered list of the most consequential developments across the documents.

## 📌 Key Findings by Theme
Group related findings under bold theme headings. Each finding cites its source as [1], [2] etc.

## 📊 Numbers That Matter
Bullet list of critical figures, percentages, allocations.

## ⚠️ Watch Items
Risks, gaps, or unresolved issues.

## ✅ Recommended Actions
Practical next steps for civic actors.

## 📚 Sources
Numbered list of source titles.

Keep total length under 800 words. Be evidence-based and cite every claim.`;

    const aiResp = await fetch(AI_GATEWAY, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate the ${briefing.frequency} briefing from these source documents:\n\n${corpus}` },
        ],
        temperature: 0.2,
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again shortly.' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: 'AI credits depleted. Add credits in Settings → Workspace → Usage.' }), {
        status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      throw new Error(`AI error: ${aiResp.status} ${t.slice(0, 200)}`);
    }

    const aiData = await aiResp.json();
    const content = aiData.choices?.[0]?.message?.content || '';

    // Extract a 2-line summary from first non-heading paragraph
    const summary = content
      .split('\n')
      .filter((l: string) => l.trim() && !l.startsWith('#'))
      .slice(0, 2)
      .join(' ')
      .substring(0, 280);

    const sourceDocuments = filteredDocs.map((d: any, i: number) => ({
      ref: i + 1,
      id: d.id,
      title: d.title,
      type: d.document_type,
      country: d.country,
    }));

    const { data: digest, error: dErr } = await supabase
      .from('nuru_briefing_digests')
      .insert({
        briefing_id: briefingId,
        user_id: userId,
        content,
        summary,
        source_documents: sourceDocuments,
      })
      .select()
      .single();
    if (dErr) throw dErr;

    await supabase
      .from('nuru_briefings')
      .update({ last_generated_at: new Date().toISOString() })
      .eq('id', briefingId);

    return new Response(JSON.stringify({ success: true, digest }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('Briefing error:', e);
    return new Response(JSON.stringify({ error: e.message || 'Briefing generation failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
