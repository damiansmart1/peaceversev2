import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);

    if (id) {
      const [{ data: proposal }, { data: responses }, { data: args }, { data: sponsors }] = await Promise.all([
        supabase.from('proposals').select('*').eq('id', id).maybeSingle(),
        supabase.from('proposal_responses').select('*').eq('proposal_id', id),
        supabase.from('proposal_arguments').select('*').eq('proposal_id', id),
        supabase.from('proposal_sponsorships').select('*').eq('proposal_id', id).eq('is_active', true),
      ]);

      if (!proposal) {
        return new Response(JSON.stringify({ error: 'not_found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        meta: { standard: 'OGP', spectrum: 'IAP2', sdg: 'UN-SDG-16', generated_at: new Date().toISOString() },
        proposal,
        official_responses: responses || [],
        arguments: args || [],
        sponsorships: sponsors || [],
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: list } = await supabase
      .from('proposals')
      .select('id, title, description, category, status, response_status, iap2_level, votes_for, votes_against, votes_abstain, created_at, embed_token')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit);

    return new Response(JSON.stringify({
      meta: { standard: 'OGP', count: list?.length || 0, generated_at: new Date().toISOString() },
      proposals: list || [],
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
