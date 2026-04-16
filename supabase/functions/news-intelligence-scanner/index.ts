import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// GDELT API endpoints
const GDELT_DOC_API = 'https://api.gdeltproject.org/api/v2/doc/doc';
const GDELT_GEO_API = 'https://api.gdeltproject.org/api/v2/geo/geo';

// African country codes for priority scanning
const AFRICA_PRIORITY_COUNTRIES = [
  'Kenya', 'Nigeria', 'Ethiopia', 'Somalia', 'DRC', 'Sudan', 'South Sudan',
  'Uganda', 'Tanzania', 'Mozambique', 'Mali', 'Burkina Faso', 'Niger',
  'Cameroon', 'Chad', 'Central African Republic', 'Libya', 'Egypt',
  'Rwanda', 'Burundi', 'Zimbabwe', 'South Africa', 'Ghana', 'Senegal'
];

// Conflict/crisis search queries
const SCAN_QUERIES = [
  'conflict violence attack',
  'protest demonstration unrest',
  'humanitarian crisis displacement',
  'election violence political',
  'terrorism bombing explosion',
  'ethnic violence communal clash',
  'human rights violation',
  'refugee crisis migration',
  'natural disaster flood drought',
  'peace agreement ceasefire negotiation'
];

// Known credible source tiers
const SOURCE_CREDIBILITY_TIERS: Record<string, { score: number; tier: string }> = {
  'reuters.com': { score: 95, tier: 'tier_1' },
  'apnews.com': { score: 95, tier: 'tier_1' },
  'bbc.com': { score: 90, tier: 'tier_1' },
  'bbc.co.uk': { score: 90, tier: 'tier_1' },
  'aljazeera.com': { score: 85, tier: 'tier_1' },
  'france24.com': { score: 85, tier: 'tier_1' },
  'theguardian.com': { score: 85, tier: 'tier_1' },
  'nytimes.com': { score: 88, tier: 'tier_1' },
  'washingtonpost.com': { score: 85, tier: 'tier_1' },
  'dw.com': { score: 85, tier: 'tier_1' },
  'voanews.com': { score: 80, tier: 'tier_2' },
  'africanews.com': { score: 80, tier: 'tier_2' },
  'nation.africa': { score: 78, tier: 'tier_2' },
  'thecitizen.co.tz': { score: 75, tier: 'tier_2' },
  'dailymonitor.co.ug': { score: 75, tier: 'tier_2' },
  'theeastafrican.co.ke': { score: 78, tier: 'tier_2' },
  'standardmedia.co.ke': { score: 72, tier: 'tier_2' },
  'premiumtimesng.com': { score: 75, tier: 'tier_2' },
  'punchng.com': { score: 72, tier: 'tier_2' },
  'citizen.digital': { score: 72, tier: 'tier_2' },
};

function getDomainFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function getSourceCredibility(domain: string): { score: number; tier: string } {
  const known = SOURCE_CREDIBILITY_TIERS[domain];
  if (known) return known;
  // Heuristic for unknown sources
  if (domain.endsWith('.gov') || domain.endsWith('.int') || domain.endsWith('.org')) {
    return { score: 65, tier: 'tier_3' };
  }
  return { score: 40, tier: 'unrated' };
}

interface GdeltArticle {
  url: string;
  title: string;
  seendate: string;
  socialimage: string;
  domain: string;
  language: string;
  sourcecountry: string;
  tone: number;
}

async function fetchGdeltArticles(query: string, mode: string = 'artlist', maxRecords: number = 50): Promise<GdeltArticle[]> {
  try {
    const params = new URLSearchParams({
      query: query,
      mode: mode,
      maxrecords: String(maxRecords),
      format: 'json',
      timespan: '24h',
      sort: 'datedesc',
    });

    const response = await fetch(`${GDELT_DOC_API}?${params.toString()}`);
    if (!response.ok) {
      if (response.status === 429) {
        console.warn('GDELT rate limited, waiting 3s...');
        await new Promise(r => setTimeout(r, 3000));
        // Retry once
        const retry = await fetch(`${GDELT_DOC_API}?${params.toString()}`);
        if (retry.ok) {
          const data = await retry.json();
          return data?.articles || [];
        }
      }
      console.error(`GDELT API error: ${response.status}`);
      await response.text(); // consume body
      return [];
    }

    const data = await response.json();
    return data?.articles || [];
  } catch (error) {
    console.error('GDELT fetch error:', error);
    return [];
  }
}

function clusterArticlesByTopic(articles: GdeltArticle[]): Map<string, GdeltArticle[]> {
  const clusters = new Map<string, GdeltArticle[]>();

  for (const article of articles) {
    // Simple clustering by keyword similarity in title
    const titleWords = article.title.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    let assigned = false;

    for (const [key, cluster] of clusters) {
      const keyWords = key.toLowerCase().split(/\s+/);
      const overlap = titleWords.filter(w => keyWords.some(kw => kw.includes(w) || w.includes(kw)));
      if (overlap.length >= 2) {
        cluster.push(article);
        assigned = true;
        break;
      }
    }

    if (!assigned) {
      clusters.set(article.title, [article]);
    }
  }

  return clusters;
}

function calculateClusterCredibility(articles: GdeltArticle[]): {
  score: number;
  methodology: any;
} {
  const sourceScores = articles.map(a => {
    const domain = getDomainFromUrl(a.url);
    return getSourceCredibility(domain);
  });

  // Scientific credibility scoring methodology:
  // 1. Source Authority (40%): Average credibility of reporting sources
  const avgSourceScore = sourceScores.reduce((sum, s) => sum + s.score, 0) / sourceScores.length;

  // 2. Cross-Reference Factor (30%): How many independent sources report it
  const uniqueDomains = new Set(articles.map(a => getDomainFromUrl(a.url)));
  const crossRefScore = Math.min(100, uniqueDomains.size * 15); // 15pts per unique source, max 100

  // 3. Tier-1 Source Presence (20%): Whether major wire services cover it
  const tier1Count = sourceScores.filter(s => s.tier === 'tier_1').length;
  const tier1Score = Math.min(100, tier1Count * 25);

  // 4. Consistency Factor (10%): How consistent the tone is across sources
  const tones = articles.map(a => a.tone || 0);
  const avgTone = tones.reduce((s, t) => s + t, 0) / tones.length;
  const toneVariance = tones.reduce((s, t) => s + Math.pow(t - avgTone, 2), 0) / tones.length;
  const consistencyScore = Math.max(0, 100 - toneVariance * 5);

  const finalScore = Math.round(
    avgSourceScore * 0.4 +
    crossRefScore * 0.3 +
    tier1Score * 0.2 +
    consistencyScore * 0.1
  );

  return {
    score: Math.min(100, finalScore),
    methodology: {
      source_authority: { weight: '40%', score: Math.round(avgSourceScore), sources_evaluated: sourceScores.length },
      cross_reference: { weight: '30%', score: crossRefScore, unique_sources: uniqueDomains.size },
      tier1_presence: { weight: '20%', score: tier1Score, tier1_sources: tier1Count },
      consistency: { weight: '10%', score: Math.round(consistencyScore), tone_variance: Math.round(toneVariance * 100) / 100 },
      final_score: finalScore,
    },
  };
}

function determineSeverity(articles: GdeltArticle[], credScore: number): string {
  const avgTone = articles.reduce((s, a) => s + (a.tone || 0), 0) / articles.length;
  const sourceCount = new Set(articles.map(a => getDomainFromUrl(a.url))).size;

  // Highly negative tone + many sources = critical
  if (avgTone < -8 && sourceCount >= 5) return 'critical';
  if (avgTone < -5 && sourceCount >= 3) return 'high';
  if (avgTone < -2 || sourceCount >= 3) return 'medium';
  return 'low';
}

function categorizeIncident(title: string, articles: GdeltArticle[]): string {
  const text = (title + ' ' + articles.map(a => a.title).join(' ')).toLowerCase();

  if (/terror|bomb|explos|attack|shoot|kill|massacre/i.test(text)) return 'terrorism_and_armed_attacks';
  if (/election|vote|ballot|poll|campaign/i.test(text)) return 'election_violence';
  if (/protest|demonstrat|rally|unrest|riot/i.test(text)) return 'civil_unrest';
  if (/ethnic|tribal|communal|sectarian/i.test(text)) return 'ethnic_conflict';
  if (/refugee|displac|migrat|asylum/i.test(text)) return 'displacement';
  if (/human rights|abuse|torture|detain/i.test(text)) return 'human_rights_violation';
  if (/flood|drought|earthquake|cyclone|disaster/i.test(text)) return 'natural_disaster';
  if (/peace|ceasefire|negotiat|agreement|treaty/i.test(text)) return 'peace_process';
  if (/coup|military|junta|takeover/i.test(text)) return 'political_instability';
  return 'general_security';
}

function extractCountries(articles: GdeltArticle[]): string[] {
  const countries = new Set<string>();
  for (const a of articles) {
    if (a.sourcecountry) countries.add(a.sourcecountry);
    // Also check title for African country names
    for (const c of AFRICA_PRIORITY_COUNTRIES) {
      if (a.title.toLowerCase().includes(c.toLowerCase())) {
        countries.add(c);
      }
    }
  }
  return Array.from(countries);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) throw new Error('LOVABLE_API_KEY not configured');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Auth check (optional for scheduled runs)
    let userId: string | null = null;
    let scanType = 'scheduled';

    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        userId = user.id;
        scanType = 'manual';
      }
    }

    const body = await req.json().catch(() => ({}));
    const customQueries = body.queries as string[] | undefined;
    const focusRegion = body.focus_region as string | undefined;

    console.log(`Starting ${scanType} news intelligence scan...`);

    // Create scan batch
    const { data: batch, error: batchError } = await supabase
      .from('news_scan_batches')
      .insert({
        scan_type: scanType,
        trigger_user_id: userId,
        search_queries: customQueries || SCAN_QUERIES,
        geographic_focus: focusRegion ? [focusRegion] : ['Africa', 'Global'],
        status: 'running',
      })
      .select()
      .single();

    if (batchError) throw batchError;

    const batchId = batch.id;
    let totalArticlesFound = 0;
    let allArticles: GdeltArticle[] = [];

    // Phase 1: Fetch articles from GDELT for each query
    const queries = customQueries || SCAN_QUERIES;
    const africaQueries = queries.map(q => `${q} (${AFRICA_PRIORITY_COUNTRIES.slice(0, 8).join(' OR ')})`);
    const globalQueries = queries.slice(0, 5); // Fewer global queries

    console.log(`Scanning ${africaQueries.length} Africa-priority + ${globalQueries.length} global queries...`);

    // Fetch Africa-priority articles
    for (const query of africaQueries) {
      const articles = await fetchGdeltArticles(query, 'artlist', 30);
      allArticles.push(...articles);
      totalArticlesFound += articles.length;
    }

    // Fetch global articles
    for (const query of globalQueries) {
      const articles = await fetchGdeltArticles(query, 'artlist', 20);
      allArticles.push(...articles);
      totalArticlesFound += articles.length;
    }

    console.log(`Found ${totalArticlesFound} total articles. Deduplicating...`);

    // Deduplicate by URL
    const uniqueArticles = new Map<string, GdeltArticle>();
    for (const article of allArticles) {
      if (!uniqueArticles.has(article.url)) {
        uniqueArticles.set(article.url, article);
      }
    }

    const dedupedArticles = Array.from(uniqueArticles.values());
    console.log(`${dedupedArticles.length} unique articles after dedup.`);

    // Phase 2: Store articles
    const articleInserts = dedupedArticles.map(a => ({
      source_name: a.domain || getDomainFromUrl(a.url),
      source_url: a.url,
      source_domain: getDomainFromUrl(a.url),
      title: a.title,
      published_at: a.seendate ? new Date(a.seendate.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, '$1-$2-$3T$4:$5:$6Z')).toISOString() : new Date().toISOString(),
      language: a.language || 'en',
      country_codes: extractCountries([a]),
      tone_score: a.tone || 0,
      image_url: a.socialimage || null,
      credibility_tier: getSourceCredibility(getDomainFromUrl(a.url)).tier,
      scan_batch_id: batchId,
    }));

    if (articleInserts.length > 0) {
      // Insert in batches of 50
      for (let i = 0; i < articleInserts.length; i += 50) {
        const chunk = articleInserts.slice(i, i + 50);
        await supabase.from('news_intelligence_articles').insert(chunk);
      }
    }

    // Phase 3: Cluster articles by topic
    const clusters = clusterArticlesByTopic(dedupedArticles);
    console.log(`Identified ${clusters.size} topic clusters.`);

    // Filter clusters with 2+ sources (more credible)
    const significantClusters = Array.from(clusters.entries())
      .filter(([_, articles]) => {
        const uniqueSources = new Set(articles.map(a => getDomainFromUrl(a.url)));
        return uniqueSources.size >= 2;
      })
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 15); // Top 15 clusters

    console.log(`${significantClusters.length} significant clusters (2+ independent sources).`);

    // Phase 4: AI analysis for each significant cluster
    let reportsGenerated = 0;

    for (const [clusterTitle, clusterArticles] of significantClusters) {
      const credibility = calculateClusterCredibility(clusterArticles);
      const severity = determineSeverity(clusterArticles, credibility.score);
      const category = categorizeIncident(clusterTitle, clusterArticles);
      const countries = extractCountries(clusterArticles);

      const sourceSummary = clusterArticles.map(a => {
        const domain = getDomainFromUrl(a.url);
        const cred = getSourceCredibility(domain);
        return `- [${domain}] (credibility: ${cred.score}/100, tier: ${cred.tier}): "${a.title}"`;
      }).join('\n');

      // Use Lovable AI to generate comprehensive incident report
      try {
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
                content: `You are an expert conflict analyst and news intelligence officer for a peacebuilding platform. Your job is to synthesize multiple news sources into a clear, actionable incident report. Focus on:
1. Verified facts that appear across multiple sources
2. Discrepancies between source accounts
3. Potential impact on civilian populations
4. Recommended humanitarian response actions

Be factual, neutral, and cite which sources support each claim.`
              },
              {
                role: 'user',
                content: `Analyze these ${clusterArticles.length} news articles about the same event and create a structured incident report.

ARTICLES FROM ${clusterArticles.length} DIFFERENT SOURCES:
${sourceSummary}

Countries mentioned: ${countries.join(', ')}
Category: ${category}
Average tone: ${(clusterArticles.reduce((s, a) => s + (a.tone || 0), 0) / clusterArticles.length).toFixed(2)}

Return JSON with:
{
  "title": "Clear, factual incident title",
  "summary": "2-3 sentence executive summary of verified facts",
  "detailed_analysis": "Paragraph analysis comparing source accounts, noting agreements and discrepancies",
  "cross_reference_summary": "How sources corroborate or contradict each other",
  "key_facts": [{"fact": "...", "sources_confirming": 0, "confidence": "high|medium|low"}],
  "actors_involved": [{"name": "...", "role": "...", "type": "government|military|civilian|armed_group|ngo"}],
  "timeline_events": [{"time": "...", "event": "...", "source": "..."}],
  "estimated_people_affected": 0,
  "location_name": "Primary location",
  "recommended_actions": [{"action": "...", "priority": "immediate|urgent|high|medium", "target": "government|ngo|un|public"}],
  "tags": ["tag1", "tag2"]
}`
              }
            ],
            response_format: { type: 'json_object' },
          }),
        });

        if (!aiResponse.ok) {
          if (aiResponse.status === 429) {
            console.warn('Rate limited by AI gateway, pausing...');
            await new Promise(r => setTimeout(r, 5000));
            continue;
          }
          console.error(`AI analysis failed: ${aiResponse.status}`);
          continue;
        }

        const aiResult = await aiResponse.json();
        const analysis = JSON.parse(aiResult.choices[0].message.content);

        // Store the intelligence report
        const { error: reportError } = await supabase
          .from('news_intelligence_reports')
          .insert({
            scan_batch_id: batchId,
            title: analysis.title || clusterTitle,
            summary: analysis.summary || 'Analysis pending',
            detailed_analysis: analysis.detailed_analysis,
            category,
            severity_level: severity,
            credibility_score: credibility.score,
            credibility_methodology: credibility.methodology,
            source_count: new Set(clusterArticles.map(a => getDomainFromUrl(a.url))).size,
            source_urls: clusterArticles.map(a => a.url),
            source_names: [...new Set(clusterArticles.map(a => getDomainFromUrl(a.url)))],
            cross_reference_summary: analysis.cross_reference_summary,
            affected_countries: countries,
            estimated_people_affected: analysis.estimated_people_affected || null,
            location_name: analysis.location_name,
            actors_involved: analysis.actors_involved || [],
            key_facts: analysis.key_facts || [],
            timeline_events: analysis.timeline_events || [],
            recommended_actions: analysis.recommended_actions || [],
            review_status: 'pending_review',
            ai_model_used: 'google/gemini-2.5-flash',
            ai_confidence: credibility.score / 100,
            tags: analysis.tags || [],
          });

        if (reportError) {
          console.error('Report insert error:', reportError);
        } else {
          reportsGenerated++;
        }

        // Brief pause between AI calls to avoid rate limiting
        await new Promise(r => setTimeout(r, 1000));

      } catch (err) {
        console.error('AI analysis error for cluster:', err);
      }
    }

    // Update source registry
    const domainStats = new Map<string, number>();
    for (const article of dedupedArticles) {
      const domain = getDomainFromUrl(article.url);
      domainStats.set(domain, (domainStats.get(domain) || 0) + 1);
    }

    for (const [domain, count] of domainStats) {
      const cred = getSourceCredibility(domain);
      await supabase
        .from('news_source_registry')
        .upsert({
          domain,
          name: domain,
          credibility_score: cred.score,
          total_articles_scanned: count,
          is_primary_source: cred.tier === 'tier_1',
          source_type: 'news',
          last_scanned_at: new Date().toISOString(),
        }, { onConflict: 'domain' });
    }

    // Complete the batch
    await supabase
      .from('news_scan_batches')
      .update({
        status: 'completed',
        articles_found: totalArticlesFound,
        articles_processed: dedupedArticles.length,
        clusters_identified: clusters.size,
        reports_generated: reportsGenerated,
        completed_at: new Date().toISOString(),
      })
      .eq('id', batchId);

    console.log(`Scan complete: ${dedupedArticles.length} articles → ${significantClusters.length} clusters → ${reportsGenerated} reports`);

    return new Response(
      JSON.stringify({
        success: true,
        batch_id: batchId,
        scan_type: scanType,
        articles_found: totalArticlesFound,
        articles_processed: dedupedArticles.length,
        clusters_identified: clusters.size,
        reports_generated: reportsGenerated,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('News intelligence scanner error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
