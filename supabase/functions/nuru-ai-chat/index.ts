import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const AI_GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';

// ===== MODEL TIER SYSTEM =====
// Tier 1: Deep analysis (document summarization, fact-checking, constitution processing)
const DEEP_MODEL = 'google/gemini-3.1-pro-preview';
// Tier 2: Conversational chat (streaming, Q&A, comparisons)
const CHAT_MODEL = 'google/gemini-3-flash-preview';
// Tier 3: Lightweight tasks (simple lookups, formatting)
const FAST_MODEL = 'google/gemini-2.5-flash-lite';

// Fallback chains per tier
const FALLBACK_CHAINS: Record<string, string[]> = {
  deep: [DEEP_MODEL, 'google/gemini-2.5-pro', CHAT_MODEL],
  chat: [CHAT_MODEL, 'google/gemini-2.5-flash', FAST_MODEL],
  fast: [FAST_MODEL, 'google/gemini-2.5-flash-lite', CHAT_MODEL],
};

// Simple in-memory cache for document summaries (per-instance, lasts until cold start)
const summaryCache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCached(key: string): any | null {
  const entry = summaryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    summaryCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: any) {
  // Keep cache bounded
  if (summaryCache.size > 100) {
    const oldest = summaryCache.keys().next().value;
    if (oldest) summaryCache.delete(oldest);
  }
  summaryCache.set(key, { data, ts: Date.now() });
}

function getSupabase() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

// ===== AI CALL WITH AUTOMATIC FALLBACK =====
async function callAI(apiKey: string, messages: any[], temperature = 0.1, tier: 'deep' | 'chat' | 'fast' = 'chat') {
  const models = FALLBACK_CHAINS[tier];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const response = await fetch(AI_GATEWAY, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, messages, temperature }),
      });

      if (response.status === 429) {
        console.warn(`Rate limited on ${model}, trying next...`);
        await response.text(); // consume body
        lastError = new Error('Rate limit exceeded');
        // Brief backoff before trying next model
        await new Promise(r => setTimeout(r, 500));
        continue;
      }

      if (response.status === 402) {
        throw new Error('AI credits depleted. Please add credits under Settings → Workspace → Usage.');
      }

      if (!response.ok) {
        const t = await response.text();
        console.error(`AI error on ${model}:`, response.status, t);
        lastError = new Error(`AI service error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      console.log(`✅ Used model: ${model} (tier: ${tier})`);
      return { content: data.choices[0].message.content, modelUsed: model };
    } catch (e: any) {
      if (e.message?.includes('credits')) throw e; // Don't retry payment errors
      lastError = e;
      console.warn(`Model ${model} failed:`, e.message);
    }
  }

  throw lastError || new Error('All AI models failed');
}

// ===== STREAMING AI WITH FALLBACK =====
async function streamAI(apiKey: string, messages: any[], temperature = 0.1, tier: 'deep' | 'chat' | 'fast' = 'chat') {
  const models = FALLBACK_CHAINS[tier];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const response = await fetch(AI_GATEWAY, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, messages, temperature, stream: true }),
      });

      if (response.status === 429) {
        console.warn(`Rate limited on ${model} (stream), trying next...`);
        await response.text();
        lastError = new Error('Rate limit exceeded. Please try again later.');
        await new Promise(r => setTimeout(r, 500));
        continue;
      }

      if (response.status === 402) {
        throw new Error('AI credits depleted. Please add credits under Settings → Workspace → Usage.');
      }

      if (!response.ok) {
        const t = await response.text();
        console.error(`Stream error on ${model}:`, response.status, t);
        lastError = new Error(`AI service error: ${response.status}`);
        continue;
      }

      console.log(`✅ Streaming with model: ${model} (tier: ${tier})`);
      return { response, modelUsed: model };
    } catch (e: any) {
      if (e.message?.includes('credits')) throw e;
      lastError = e;
      console.warn(`Stream model ${model} failed:`, e.message);
    }
  }

  throw lastError || new Error('All AI models failed for streaming');
}

function parseJSON(content: string) {
  try {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)```/) || content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
    return JSON.parse(jsonStr.trim());
  } catch {
    return null;
  }
}

async function logAudit(supabase: any, userId: string | null, action: string, entityType: string, entityId?: string, details?: any) {
  try {
    const { error } = await supabase.from('nuru_audit_log').insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: details || {},
    });
    if (error) console.error('Audit log error:', error);
  } catch (e) {
    console.error('Audit log exception:', e);
  }
}

// Fetch constitution for a country (for cross-referencing)
async function fetchConstitution(supabase: any, countryName: string | null): Promise<{ text: string; title: string; country: string } | null> {
  if (!countryName) return null;
  
  // Check cache first
  const cacheKey = `constitution:${countryName}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;
  
  try {
    const { data } = await supabase
      .from('country_constitutions')
      .select('original_text, constitution_title, country_name, ai_summary, key_provisions, fundamental_rights')
      .eq('country_name', countryName)
      .eq('is_active', true)
      .single();
    if (!data) return null;
    let constitutionContext = '';
    if (data.ai_summary?.summary) constitutionContext += `CONSTITUTIONAL SUMMARY:\n${data.ai_summary.summary}\n\n`;
    if (data.key_provisions) constitutionContext += `KEY PROVISIONS:\n${JSON.stringify(data.key_provisions)}\n\n`;
    if (data.fundamental_rights) constitutionContext += `FUNDAMENTAL RIGHTS:\n${JSON.stringify(data.fundamental_rights)}\n\n`;
    constitutionContext += `FULL CONSTITUTIONAL TEXT:\n${(data.original_text || '').substring(0, 15000)}`;
    const result = { text: constitutionContext, title: data.constitution_title, country: data.country_name };
    setCache(cacheKey, result);
    return result;
  } catch (e) {
    console.error('Error fetching constitution:', e);
    return null;
  }
}

function buildConstitutionalInstructions(constitution: { text: string; title: string; country: string } | null): string {
  if (!constitution) return '';
  return `

## 🏛️ CONSTITUTIONAL CROSS-REFERENCE
You have access to the **${constitution.title}** (${constitution.country}). You MUST use it to:
1. **Verify constitutional compliance**: Check if document provisions align with or violate constitutional guarantees
2. **Flag constitutional conflicts**: Identify any policy that contradicts fundamental rights, governance structures, or constitutional principles
3. **Cite constitutional authority**: When relevant, quote specific constitutional articles/sections that apply
4. **Sovereignty check**: Ensure proposals respect constitutional sovereignty and territorial integrity
5. **Rights assessment**: Cross-reference any citizen impact against constitutionally guaranteed rights

In your response, include a **Constitutional Alignment** section when applicable:
- ✅ Aligned: provisions consistent with constitutional framework
- ⚠️ Concern: potential tension with constitutional principles
- ❌ Conflict: direct contradiction of constitutional provisions

**CONSTITUTIONAL REFERENCE:**
${constitution.text}
`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action: rawAction, documentId, question, claimText, conversationId, messages: chatMessages, stream: useStream, message } = body;
    const action = rawAction || (message ? 'simple_chat' : (question ? 'ask' : undefined));
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const supabase = getSupabase();

    let userId: string | null = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const startTime = Date.now();

    // ===== ACTION: STREAMING CHAT (uses CHAT tier for speed) =====
    if (action === 'chat_stream') {
      if (!conversationId) throw new Error('Conversation ID required');

      const { data: conv } = await supabase
        .from('nuru_conversations')
        .select('*, civic_documents(*)')
        .eq('id', conversationId)
        .single();

      if (!conv) throw new Error('Conversation not found');

      const doc = conv.civic_documents;
      const documentContext = doc ? (doc.original_text || doc.summary || doc.description || '') : '';

      const constitution = await fetchConstitution(supabase, doc?.country || null);

      const { data: history } = await supabase
        .from('nuru_messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(30);

      const userQuestion = chatMessages?.[chatMessages.length - 1]?.content || '';

      // Save user message first
      await supabase.from('nuru_messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: userQuestion,
      });

      const systemPrompt = buildChatSystemPrompt(doc, documentContext, constitution);

      const aiMessages = [
        { role: 'system', content: systemPrompt },
        ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
        { role: 'user', content: userQuestion },
      ];

      // Use CHAT tier for streaming — faster response
      const { response: streamResponse, modelUsed } = await streamAI(LOVABLE_API_KEY, aiMessages, 0.1, 'chat');

      let fullContent = '';
      const { readable, writable } = new TransformStream({
        transform(chunk, controller) {
          const text = new TextDecoder().decode(chunk);
          const lines = text.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const parsed = JSON.parse(line.slice(6));
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) fullContent += delta;
              } catch {}
            }
          }
          controller.enqueue(chunk);
        },
        async flush() {
          const processingTime = Date.now() - startTime;
          await supabase.from('nuru_messages').insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: fullContent,
            model_used: modelUsed,
            processing_time_ms: processingTime,
          });
          await supabase.from('nuru_conversations').update({
            message_count: (conv.message_count || 0) + 2,
            last_message_at: new Date().toISOString(),
            title: conv.title === 'New Conversation' ? userQuestion.substring(0, 60) : conv.title,
          }).eq('id', conversationId);

          if (doc) {
            await supabase.from('civic_documents').update({
              question_count: (doc.question_count || 0) + 1,
            }).eq('id', doc.id);
          }

          await logAudit(supabase, userId, 'chat_streamed', 'nuru_conversation', conversationId, { processingTime, modelUsed, documentId: doc?.id });
        }
      });

      streamResponse.body!.pipeTo(writable);

      return new Response(readable, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
      });
    }

    // ===== ACTION: SUMMARIZE DOCUMENT (uses DEEP tier for thorough analysis) =====
    if (action === 'summarize') {
      const { data: doc, error } = await supabase
        .from('civic_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error || !doc) throw new Error('Document not found');

      const textToSummarize = doc.original_text || doc.description || '';
      if (!textToSummarize) throw new Error('No text content to summarize');

      // Check cache
      const cacheKey = `summary:${documentId}:${textToSummarize.length}`;
      const cached = getCached(cacheKey);
      if (cached) {
        return new Response(JSON.stringify({ success: true, summary: cached, processingTime: 0, fromCache: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const constitution = await fetchConstitution(supabase, doc.country || null);
      const constitutionalContext = buildConstitutionalInstructions(constitution);

      await supabase.from('civic_documents').update({ processing_status: 'processing' }).eq('id', documentId);

      // Use DEEP tier for document analysis — maximum reasoning capability
      const { content, modelUsed } = await callAI(LOVABLE_API_KEY, [
        {
          role: 'system',
          content: `You are NuruAI, a world-class civic intelligence analyst and policy decoder. You operate as critical public infrastructure for democratic participation across Africa.
${constitutionalContext}
Your task: Perform an exhaustive, multi-dimensional analysis of the provided policy document using the following rigorous methodology. Every claim must be traceable to the source text.

## ANALYSIS FRAMEWORK

### 1. Executive Summary
- Write 3-4 paragraphs in plain, accessible language
- Open with the document's primary purpose and issuing authority
- Highlight the 3 most consequential provisions for ordinary citizens
- Close with the document's overall significance in the policy landscape

### 2. Key Topics & Policy Areas
- Extract all distinct policy domains covered (as JSON array)
- Categorize each: governance, finance, health, education, infrastructure, security, environment, trade, rights, etc.

### 3. Institutional Mapping
- List every institution, agency, ministry, or body mentioned
- For each: state its role, responsibilities, and relationship to other entities in the document

### 4. Financial Intelligence
- Extract ALL monetary figures with exact amounts, currencies, and percentages
- Map budget allocations by sector/program with year-over-year comparisons if available
- Calculate per-capita impact where population data is referenced
- Flag any discrepancies between stated totals and itemized amounts
- Note funding sources, conditionalities, and disbursement timelines

### 5. Citizen Impact Assessment (Stratified)
- Analyze impact across demographics: urban vs rural, youth, women, elderly, persons with disabilities
- Identify direct benefits (subsidies, services) vs indirect effects (market changes, policy shifts)
- Assess accessibility of proposed programs/services
- Rate impact severity: transformative / significant / moderate / minimal / uncertain

### 6. Policy Timeline & Implementation Roadmap
- Extract every date, deadline, phase, milestone
- Map dependencies between implementation stages
- Identify potential bottlenecks or unrealistic timelines
- Note accountability mechanisms and review periods

### 7. Stakeholder Power Analysis
- Map beneficiaries vs obligation-bearers
- Identify winners and losers from policy implementation
- Note consultation processes mentioned
- Flag any groups excluded from consideration

### 8. Statistical Deep Dive
- Extract ALL numerical data: statistics, projections, targets, baselines
- Provide context for each figure (what it measures, its significance)
- Compare targets against known baselines where referenced
- Note methodology citations or data source references

### 9. Legal & Regulatory Framework
- Identify laws, regulations, standards, or treaties referenced
- Note compliance requirements and penalties
- Flag potential conflicts with existing legislation mentioned

### 10. Risk & Gap Analysis
- Identify what the document does NOT address that would be expected
- Flag vague commitments without measurable targets
- Note missing accountability or oversight mechanisms
- Identify implementation risks based on stated resource constraints

### 11. Strategic Follow-Up Questions
- Generate 5-7 high-impact questions a citizen, journalist, or civil society actor should ask
- Each question should target a specific gap, ambiguity, or accountability mechanism
- Frame questions to demand evidence-based answers from institutions

### 12. Cross-Reference Indicators
- Note references to other policies, frameworks, or international obligations
- Identify alignment with SDGs, AU Agenda 2063, or regional frameworks mentioned in text

CRITICAL RULES:
- ONLY cite information explicitly stated in the document. NEVER fabricate.
- Use "[Not addressed in document]" for expected but missing information
- Use "[Requires clarification - see page/section X]" for ambiguous sections
- Preserve exact figures, names, and dates as written in the source
- Use plain language suitable for citizens with varying education levels
- When a figure seems implausible, flag it: "[Verify: unusually high/low figure]"

Format response as JSON:
{
  "summary": "comprehensive plain language summary (3-4 paragraphs)",
  "documentMetadata": {"type": "type", "issuingAuthority": "authority", "effectiveDate": "date", "jurisdiction": "scope"},
  "topics": ["topic1", "topic2"],
  "topicCategories": [{"topic": "name", "category": "domain", "significance": "high/medium/low"}],
  "institutions": [{"name": "institution", "role": "role description", "accountabilities": ["accountability1"]}],
  "financialAllocations": {"totalBudget": "amount", "currency": "currency", "items": [{"item": "name", "amount": "figure", "percentage": "% of total", "sector": "sector"}]},
  "citizenImpact": {"overall": "summary", "byDemographic": [{"group": "group name", "impact": "description", "severity": "level"}], "directBenefits": ["benefit1"], "indirectEffects": ["effect1"]},
  "policyTimeline": [{"date": "date", "event": "milestone", "responsible": "entity", "dependencies": ["dep1"]}],
  "stakeholders": [{"name": "stakeholder", "role": "beneficiary/implementer/oversight", "interest": "description"}],
  "keyFindings": ["finding1", "finding2"],
  "keyStatistics": [{"metric": "what is measured", "value": "exact figure", "context": "significance", "source": "section reference"}],
  "legalReferences": [{"reference": "law/regulation", "relevance": "how it applies"}],
  "riskAnalysis": [{"risk": "description", "likelihood": "high/medium/low", "mitigation": "stated mitigation or [None stated]"}],
  "gaps": ["gap1", "gap2"],
  "strategicQuestions": [{"question": "high-impact question", "target": "institution/entity to ask", "rationale": "why this matters"}],
  "crossReferences": [{"framework": "name", "alignment": "description"}],
  "complexityScore": 0.0,
  "readabilityGrade": "grade level",
  "confidenceScore": 0.0,
  "analysisLimitations": ["limitation1"]
}`
        },
        { role: 'user', content: textToSummarize.substring(0, 50000) }
      ], 0.12, 'deep');

      const parsed = parseJSON(content) || { summary: content };
      const processingTime = Date.now() - startTime;

      // Cache the result
      setCache(cacheKey, parsed);

      await supabase.from('civic_documents').update({
        summary: parsed.summary,
        ai_summary: parsed,
        topics: parsed.topics || [],
        institutions: parsed.institutions || [],
        financial_allocations: parsed.financialAllocations || null,
        status: 'ready',
        processing_status: 'completed',
        updated_at: new Date().toISOString(),
      }).eq('id', documentId);

      try {
        await supabase.from('nuru_document_versions').insert({
          document_id: documentId,
          version_number: 1,
          original_text: textToSummarize.substring(0, 50000),
          uploaded_by: userId,
        });
      } catch (_e) {
        // Non-critical
      }

      await logAudit(supabase, userId, 'document_summarized', 'civic_document', documentId, { processingTime, modelUsed, topicCount: parsed.topics?.length });

      return new Response(JSON.stringify({ success: true, summary: parsed, processingTime, modelUsed }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ===== ACTION: CONVERSATIONAL Q&A (non-streaming fallback, CHAT tier) =====
    if (action === 'chat') {
      if (!conversationId) throw new Error('Conversation ID required');

      const { data: conv } = await supabase
        .from('nuru_conversations')
        .select('*, civic_documents(*)')
        .eq('id', conversationId)
        .single();

      if (!conv) throw new Error('Conversation not found');

      const doc = conv.civic_documents;
      const documentContext = doc ? (doc.original_text || doc.summary || doc.description || '') : '';

      const constitution = await fetchConstitution(supabase, doc?.country || null);

      const { data: history } = await supabase
        .from('nuru_messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(30);

      const userQuestion = chatMessages?.[chatMessages.length - 1]?.content || '';
      const systemPrompt = buildChatSystemPrompt(doc, documentContext, constitution);

      const aiMessages = [
        { role: 'system', content: systemPrompt },
        ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
        { role: 'user', content: userQuestion },
      ];

      const { content, modelUsed } = await callAI(LOVABLE_API_KEY, aiMessages, 0.1, 'chat');
      const processingTime = Date.now() - startTime;

      // Save user message
      await supabase.from('nuru_messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: userQuestion,
      });

      // Save AI response
      await supabase.from('nuru_messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: content,
        model_used: modelUsed,
        processing_time_ms: processingTime,
      });

      await supabase.from('nuru_conversations').update({
        message_count: (conv.message_count || 0) + 2,
        last_message_at: new Date().toISOString(),
        title: conv.title === 'New Conversation' ? userQuestion.substring(0, 60) : conv.title,
      }).eq('id', conversationId);

      if (doc) {
        await supabase.from('civic_documents').update({
          question_count: (doc.question_count || 0) + 1,
        }).eq('id', doc.id);
      }

      await logAudit(supabase, userId, 'question_asked', 'nuru_conversation', conversationId, {
        processingTime, modelUsed, documentId: doc?.id,
      });

      return new Response(JSON.stringify({ success: true, answer: content, processingTime, modelUsed }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ===== ACTION: SINGLE QUESTION (CHAT tier) =====
    if (action === 'ask') {
      if (!question || !documentId) throw new Error('Question and document ID required');

      const { data: doc } = await supabase
        .from('civic_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (!doc) throw new Error('Document not found');
      const documentContext = doc.original_text || doc.summary || doc.description || '';

      const constitution = await fetchConstitution(supabase, doc.country || null);
      const constitutionalContext = buildConstitutionalInstructions(constitution);

      const { content, modelUsed } = await callAI(LOVABLE_API_KEY, [
        {
          role: 'system',
          content: `You are NuruAI, a world-class civic intelligence analyst. Answer the citizen's question using ONLY the provided document content. You must be thorough, evidence-based, and strategic.
${constitutionalContext}
## RESPONSE METHODOLOGY

1. **Direct Answer**: Address the question comprehensively with structured analysis
2. **Evidence Trail**: Quote exact passages from the document using > blockquote format. Cite section/page when identifiable
3. **Contextual Analysis**: Explain WHY this matters — connect the answer to broader implications for citizens
4. **Data Points**: Include every relevant statistic, figure, date, or metric from the document
5. **Confidence Assessment**: Rate your confidence (0.0-1.0) based on how directly the document addresses the question
6. **Limitations**: State clearly what the document does NOT address regarding this question

## STRATEGIC FOLLOW-UP QUESTIONS
Generate 4-6 advanced, targeted follow-up questions that:
- Probe deeper into accountability gaps revealed by the answer
- Challenge assumptions in the document's claims
- Connect to practical citizen action (e.g., "What recourse exists if...")
- Explore cross-sectoral implications
- Demand measurable evidence for vague commitments
- Are framed to hold institutions accountable

Each follow-up should be a complete, polished question a journalist or civic leader would ask.

## CRITICAL RULES
- ONLY use information from the document. NEVER fabricate or infer beyond the text.
- If the document doesn't address the question: state "This document does not contain information about [topic]" and suggest what document type might contain the answer.
- Present exact figures — never round or approximate document numbers.
- When data seems inconsistent, flag it: "[Note: Figures in sections X and Y appear inconsistent]"

Format as JSON: {
  "answer": "comprehensive markdown-formatted answer with headers, bullets, blockquotes",
  "confidence": 0.85,
  "sourcePassages": ["exact quote 1", "exact quote 2"],
  "documentReferences": [{"section": "name", "relevance": "why cited"}],
  "dataPoints": [{"metric": "what", "value": "figure", "context": "significance"}],
  "suggestedFollowUps": ["polished strategic question 1", "polished strategic question 2", "polished strategic question 3", "polished strategic question 4"],
  "keyTakeaway": "one powerful sentence summary",
  "limitations": ["what the document doesn't address"],
  "actionableInsights": ["what citizens can do with this information"]
}`
        },
        {
          role: 'user',
          content: `Document: "${doc.title}"\n\nContent:\n${documentContext.substring(0, 40000)}\n\nQuestion: ${question}`
        }
      ], 0.1, 'chat');

      const parsed = parseJSON(content) || { answer: content, confidence: 0.5 };
      const processingTime = Date.now() - startTime;

      await logAudit(supabase, userId, 'civic_question_asked', 'civic_document', documentId, {
        processingTime, modelUsed, confidence: parsed.confidence,
      });

      return new Response(JSON.stringify({ success: true, ...parsed, processingTime, modelUsed }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ===== ACTION: REVIEW CLAIM (DEEP tier for thorough fact-checking) =====
    if (action === 'review_claim') {
      if (!claimText) throw new Error('Claim text required');
      const { batchId, batchIndex, claimSource, claimSourceUrl } = body;

      let documentContextParts: { id: string; title: string; type: string; excerpt: string }[] = [];

      if (documentId) {
        const { data: doc } = await supabase.from('civic_documents').select('id, title, document_type, original_text, summary').eq('id', documentId).single();
        if (doc) {
          documentContextParts.push({ id: doc.id, title: doc.title, type: doc.document_type, excerpt: (doc.original_text || doc.summary || '').substring(0, 15000) });
        }
      }

      const keywords = claimText.split(/\s+/).filter((w: string) => w.length > 4).slice(0, 5).join(' | ');
      if (keywords) {
        const { data: relatedDocs } = await supabase.from('civic_documents').select('id, title, document_type, summary').textSearch('title', keywords, { type: 'websearch', config: 'english' }).limit(3);
        if (relatedDocs) {
          for (const rd of relatedDocs) {
            if (!documentContextParts.find(d => d.id === rd.id)) {
              documentContextParts.push({ id: rd.id, title: rd.title, type: rd.document_type, excerpt: (rd.summary || '').substring(0, 3000) });
            }
          }
        }
      }

      const { data: constitutions } = await supabase.from('country_constitutions').select('country_name, constitution_title, summary, key_provisions').eq('is_active', true).limit(3);

      const fullContext = [
        ...documentContextParts.map((d, i) => `--- SOURCE ${i + 1}: "${d.title}" (${d.type}) ---\n${d.excerpt}`),
        ...(constitutions || []).map((c: any) => `--- CONSTITUTIONAL REFERENCE: ${c.constitution_title} (${c.country_name}) ---\nSummary: ${c.summary || 'N/A'}\nKey Provisions: ${JSON.stringify(c.key_provisions || []).substring(0, 2000)}`),
      ].join('\n\n');

      // Use DEEP tier for fact-checking — accuracy is critical
      const { content, modelUsed } = await callAI(LOVABLE_API_KEY, [
        {
          role: 'system',
          content: `You are NuruAI's Fact-Check Engine — an IFCN-standard verification system that produces evidence-grounded verdicts comparable to Africa Check, PolitiFact, and Full Fact.

## METHODOLOGY (5-Step Protocol)
1. **CLAIM DECOMPOSITION**: Break compound claims into individual verifiable assertions
2. **EVIDENCE MATCHING**: Search ALL provided sources for supporting/contradicting data
3. **CROSS-REFERENCE**: Check against constitutional provisions where relevant
4. **CONTEXTUAL ANALYSIS**: Evaluate if the claim omits critical context or misrepresents data
5. **VERDICT SYNTHESIS**: Issue a clear, evidence-based ruling

## VERDICT SCALE (Strict Criteria)
- "supported" — Source documents explicitly confirm with matching data/quotes
- "misleading" — Contains truth but omits critical context or distorts meaning
- "unsupported" — No evidence found OR source documents contradict the claim
- "needs_context" — Claim addresses topic not covered by available sources

## RESPONSE FORMAT (Strict JSON)
{
  "status": "supported|unsupported|misleading|needs_context",
  "confidence": 0.0-1.0,
  "verdictLabel": "Human-readable verdict (e.g., 'Mostly Supported', 'Missing Context', 'Contradicted by Budget Data')",
  "evidenceSummary": "3-5 sentence detailed analysis with specific citations from source documents",
  "factCheckDetails": [
    {
      "claim": "Individual sub-claim extracted",
      "verdict": "supported|unsupported|misleading|needs_context",
      "evidence": "Specific evidence with document references and quotes",
      "sourceDocument": "Document title referenced"
    }
  ],
  "supportingPassages": ["Direct quotes from documents that support the claim"],
  "contradictingEvidence": ["Direct quotes from documents that contradict the claim"],
  "sourcesUsed": [{"title": "Document title", "type": "Document type", "relevance": "How this source relates"}],
  "recommendation": "Actionable citizen guidance — what should the reader do with this information",
  "constitutionalRelevance": "If applicable, relevant constitutional provisions"
}

## CRITICAL RULES
- NEVER fabricate evidence. If no source addresses the claim, say so clearly.
- ALWAYS cite specific document titles and sections.
- Confidence score reflects evidence quality: 0.9+ only with exact matching quotes.
- Each factCheckDetail must reference the specific source document used.`
        },
        {
          role: 'user',
          content: `CLAIM TO VERIFY: "${claimText}"${claimSource ? `\nCLAIM SOURCE: ${claimSource}` : ''}${claimSourceUrl ? `\nSOURCE URL: ${claimSourceUrl}` : ''}\n\nAVAILABLE EVIDENCE:\n${fullContext || 'No specific documents referenced. Evaluate based on general knowledge and clearly state limitations.'}`
        }
      ], 0.1, 'deep');

      const parsed = parseJSON(content) || { status: 'needs_context', evidenceSummary: content, confidence: 0.3 };
      const processingTime = Date.now() - startTime;

      const claimReviewSchema = {
        "@context": "https://schema.org",
        "@type": "ClaimReview",
        "datePublished": new Date().toISOString(),
        "url": "",
        "claimReviewed": claimText,
        "author": {
          "@type": "Organization",
          "name": "NuruAI Civic Intelligence",
          "url": "https://peaceversev2.lovable.app"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": parsed.status === 'supported' ? 5 : parsed.status === 'misleading' ? 2 : parsed.status === 'unsupported' ? 1 : 3,
          "bestRating": 5,
          "worstRating": 1,
          "alternateName": parsed.verdictLabel || parsed.status
        },
        "itemReviewed": {
          "@type": "Claim",
          "author": claimSource ? { "@type": "Person", "name": claimSource } : undefined,
          "datePublished": new Date().toISOString(),
          "appearance": claimSourceUrl ? { "@type": "CreativeWork", "url": claimSourceUrl } : undefined
        }
      };

      let savedId: string | null = null;
      try {
        const { data: saved } = await supabase.from('civic_claim_reviews').insert({
          claim_text: claimText,
          source_document_id: documentId || null,
          flagged_by: userId,
          evidence_summary: parsed.evidenceSummary,
          supporting_passages: parsed.supportingPassages || [],
          review_status: parsed.status,
          confidence_score: parsed.confidence || null,
          verdict_label: parsed.verdictLabel || null,
          claim_source: claimSource || null,
          claim_source_url: claimSourceUrl || null,
          source_documents: documentContextParts.map(d => ({ id: d.id, title: d.title, type: d.type })),
          claimreview_schema: claimReviewSchema,
          fact_check_details: parsed.factCheckDetails || [],
          recommendation: parsed.recommendation || null,
          contradicting_evidence: parsed.contradictingEvidence || [],
          batch_id: batchId || null,
          batch_index: batchIndex ?? null,
          processing_time_ms: processingTime,
          is_public: false,
        }).select('id, share_token').single();
        savedId = saved?.id || null;
        if (saved?.share_token) {
          claimReviewSchema.url = `https://peaceversev2.lovable.app/fact-check/${saved.share_token}`;
        }
      } catch (_e) {
        console.error('Claim save error:', _e);
      }

      await logAudit(supabase, userId, 'claim_reviewed', 'civic_claim', savedId || undefined, {
        processingTime, modelUsed, status: parsed.status, confidence: parsed.confidence, sourcesCount: documentContextParts.length,
      });

      return new Response(JSON.stringify({
        success: true,
        ...parsed,
        claimReviewSchema,
        sourcesUsed: parsed.sourcesUsed || documentContextParts.map(d => ({ title: d.title, type: d.type })),
        processingTime,
        modelUsed,
        reviewId: savedId,
        shareToken: savedId ? claimReviewSchema.url?.split('/').pop() : null,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ===== ACTION: BATCH REVIEW CLAIMS =====
    if (action === 'batch_review_claims') {
      const { claims } = body;
      if (!claims || !Array.isArray(claims) || claims.length === 0) throw new Error('Claims array required');
      if (claims.length > 10) throw new Error('Maximum 10 claims per batch');

      const batchId = crypto.randomUUID();
      const results: any[] = [];

      for (let i = 0; i < claims.length; i++) {
        const claim = claims[i];
        try {
          const url = `${Deno.env.get('SUPABASE_URL')}/functions/v1/nuru-ai-chat`;
          const resp = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': authHeader || `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'review_claim',
              claimText: claim.text || claim,
              documentId: claim.documentId || documentId || null,
              claimSource: claim.source || null,
              claimSourceUrl: claim.sourceUrl || null,
              batchId,
              batchIndex: i,
            }),
          });
          const data = await resp.json();
          results.push({ index: i, claim: claim.text || claim, ...data });
        } catch (e: any) {
          results.push({ index: i, claim: claim.text || claim, success: false, error: e.message });
        }
      }

      return new Response(JSON.stringify({ success: true, batchId, results, totalClaims: claims.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ===== ACTION: GET SHARED CLAIM =====
    if (action === 'get_shared_claim') {
      const { shareToken } = body;
      if (!shareToken) throw new Error('Share token required');

      const { data: claim, error } = await supabase.from('civic_claim_reviews').select('*, civic_documents(title, document_type, country)').eq('share_token', shareToken).eq('is_public', true).single();
      if (error || !claim) throw new Error('Shared claim not found or not public');

      await supabase.from('civic_claim_reviews').update({ shared_count: (claim.shared_count || 0) + 1 }).eq('id', claim.id);

      return new Response(JSON.stringify({ success: true, claim }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ===== ACTION: TOGGLE CLAIM PUBLIC =====
    if (action === 'toggle_claim_public') {
      const { reviewId, isPublic } = body;
      if (!reviewId) throw new Error('Review ID required');

      const { error: updateError } = await supabase.from('civic_claim_reviews').update({
        is_public: isPublic,
        updated_at: new Date().toISOString(),
      }).eq('id', reviewId);
      if (updateError) throw new Error(updateError.message);
      
      await logAudit(supabase, userId, 'toggle_claim_public', 'civic_claim_review', reviewId, { isPublic });
      return new Response(JSON.stringify({ success: true, isPublic }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ===== ACTION: PARSE UPLOADED DOCUMENT TEXT =====
    if (action === 'parse_document') {
      const { text, documentId: docId, fileName, fileType } = body;
      if (!text || !docId) throw new Error('Text and document ID required');

      await supabase.from('civic_documents').update({
        original_text: text.substring(0, 100000),
        file_type: fileType,
        processing_status: 'text_extracted',
      }).eq('id', docId);

      const url = `${Deno.env.get('SUPABASE_URL')}/functions/v1/nuru-ai-chat`;
      await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'summarize', documentId: docId }),
      });

      return new Response(JSON.stringify({ success: true, message: 'Document text extracted and processing started' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ===== ACTION: COMPARE DOCUMENTS (CHAT tier — balanced speed/quality) =====
    if (action === 'compare_documents') {
      const { documentIds } = body;
      if (!documentIds || documentIds.length < 2) throw new Error('Need at least 2 document IDs');

      const { data: docs } = await supabase
        .from('civic_documents')
        .select('id, title, summary, topics, financial_allocations, country')
        .in('id', documentIds);

      if (!docs || docs.length < 2) throw new Error('Documents not found');

      const { content, modelUsed } = await callAI(LOVABLE_API_KEY, [
        {
          role: 'system',
          content: `You are NuruAI. Compare these policy documents and provide a structured analysis.

Respond in markdown format with these sections:
## Comparative Overview
## Key Similarities
## Key Differences
## Financial Comparison (if applicable)
## Policy Alignment Analysis
## Recommendations for Citizens`
        },
        {
          role: 'user',
          content: docs.map((d: any) => `Document: "${d.title}" (${d.country})\nSummary: ${d.summary}\nTopics: ${d.topics?.join(', ')}\nFinancials: ${JSON.stringify(d.financial_allocations)}`).join('\n\n---\n\n')
        }
      ], 0.15, 'chat');

      return new Response(JSON.stringify({ success: true, comparison: content, modelUsed, documents: docs.map((d: any) => ({ id: d.id, title: d.title, country: d.country })) }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ===== ACTION: PROCESS CONSTITUTION (DEEP tier) =====
    if (action === 'process_constitution') {
      const { constitutionId } = body;
      if (!constitutionId) throw new Error('Constitution ID required');

      const { data: constitution, error } = await supabase
        .from('country_constitutions')
        .select('*')
        .eq('id', constitutionId)
        .single();

      if (error || !constitution) throw new Error('Constitution not found');

      await supabase.from('country_constitutions').update({ processing_status: 'processing' }).eq('id', constitutionId);

      const textContent = constitution.original_text || '';
      if (!textContent || textContent.length < 100) {
        await supabase.from('country_constitutions').update({ processing_status: 'failed' }).eq('id', constitutionId);
        throw new Error('Constitution text too short for analysis');
      }

      const { content, modelUsed } = await callAI(LOVABLE_API_KEY, [
        {
          role: 'system',
          content: `You are a constitutional law analyst. Analyze this national constitution and extract structured information.

Respond as JSON:
{
  "summary": "Comprehensive 3-4 paragraph summary of the constitution's key features, governance structure, and rights framework",
  "keyProvisions": [{"article": "article/section number", "title": "provision title", "description": "what it establishes", "category": "governance|rights|judiciary|legislature|executive|amendment|territory|citizenship"}],
  "fundamentalRights": [{"right": "right name", "article": "article number", "description": "scope and limitations", "derogable": true/false}],
  "governanceStructure": {"headOfState": "title", "legislature": "type (unicameral/bicameral)", "judiciary": "structure", "localGovernment": "structure", "electoralSystem": "description"},
  "amendmentProcess": "description of how the constitution can be amended",
  "keyPrinciples": ["principle 1", "principle 2"],
  "humanRightsFramework": "description of the rights framework",
  "independentBodies": [{"name": "body name", "role": "function", "article": "reference"}]
}`
        },
        { role: 'user', content: textContent.substring(0, 50000) }
      ], 0.1, 'deep');

      const parsed = parseJSON(content) || { summary: content };

      await supabase.from('country_constitutions').update({
        summary: parsed.summary,
        ai_summary: parsed,
        key_provisions: parsed.keyProvisions || null,
        fundamental_rights: parsed.fundamentalRights || null,
        governance_structure: parsed.governanceStructure || null,
        processing_status: 'completed',
        updated_at: new Date().toISOString(),
      }).eq('id', constitutionId);

      await logAudit(supabase, userId, 'constitution_processed', 'country_constitution', constitutionId, {
        processingTime: Date.now() - startTime, modelUsed, country: constitution.country_name,
      });

      return new Response(JSON.stringify({ success: true, summary: parsed, modelUsed }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ===== ACTION: SIMPLE CHAT (FAST tier for quick responses) =====
    if (action === 'simple_chat') {
      const userMessage = message || question || '';
      if (!userMessage) throw new Error('Message is required');

      let documentContext = '';
      let doc: any = null;
      if (documentId) {
        const { data } = await supabase.from('civic_documents').select('*').eq('id', documentId).single();
        doc = data;
        documentContext = doc ? (doc.original_text || doc.summary || doc.description || '') : '';
      }

      const constitution = await fetchConstitution(supabase, doc?.country || null);
      const systemPrompt = buildChatSystemPrompt(doc, documentContext, constitution);

      const aiMessages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ];

      // Use CHAT tier for simple_chat — good balance
      const { content, modelUsed } = await callAI(LOVABLE_API_KEY, aiMessages, 0.1, 'chat');
      const processingTime = Date.now() - startTime;

      await logAudit(supabase, userId, 'simple_chat', 'nuru_chat', undefined, { processingTime, modelUsed, documentId });

      return new Response(JSON.stringify({ response: content, processingTime, modelUsed }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    console.error('NuruAI error:', error);
    const errMsg = error instanceof Error ? error.message : 'NuruAI processing failed';
    let status = 500;
    if (errMsg.includes('credits') || errMsg.includes('402')) status = 402;
    else if (errMsg.includes('Rate limit') || errMsg.includes('429')) status = 429;
    return new Response(
      JSON.stringify({ error: errMsg }),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildChatSystemPrompt(doc: any, documentContext: string, constitution?: { text: string; title: string; country: string } | null): string {
  const constitutionalContext = buildConstitutionalInstructions(constitution || null);

  return `You are NuruAI, an elite civic intelligence analyst and policy advisor that transforms complex government documents into clear, actionable, evidence-based knowledge. You serve as critical public infrastructure for democratic participation, institutional accountability, and informed citizen engagement across Africa.
${constitutionalContext}
${doc ? `**CONTEXT DOCUMENT**: "${doc.title}"
- **Type**: ${doc.document_type}
- **Country**: ${doc.country || 'Not specified'}
- **Topics**: ${doc.topics?.join(', ') || 'Not categorized'}

**FULL DOCUMENT CONTENT**:
${documentContext.substring(0, 40000)}` : 'No specific document referenced. You may answer general civic questions but MUST clearly state: "⚠️ This response is not grounded in a specific document. For verified analysis, please upload or select a document."'}

## YOUR ANALYTICAL FRAMEWORK

### 1. Evidence-First Analysis
- **GROUND EVERY CLAIM** in the provided document text. Never fabricate, assume, or extrapolate.
- Quote exact passages using > blockquote format with section/page identifiers when visible.
- For financial data, cite exact figures with currency and context — never round.
- When information is ambiguous, present all plausible interpretations and state: "The document is ambiguous on this point. It could mean [A] or [B]."
- If the document doesn't address the question: "📋 This document does not contain information about [topic]. You may find this in [suggested document type]."

### 2. Rich, Structured Responses
- Use **markdown** formatting extensively for readability:
  - ## and ### headers to organize sections
  - **Bold** for key figures, institutions, and critical terms
  - > Blockquotes for direct document citations
  - Bullet points and numbered lists for structured data
  - Tables (| header |) when comparing data points, timelines, or allocations
  - Horizontal rules (---) to separate major sections
- Include relevant statistics, percentages, and data points from the document in every response
- Provide context for numbers: what they mean, who they affect, and why they matter

### 3. Citizen-Centric Communication
- Use plain, accessible language — explain jargon on first use
- Connect policy provisions to everyday life: "This means that [practical impact]..."
- Stratify impact analysis when relevant: urban/rural, income levels, gender, age groups
- Highlight rights, entitlements, or obligations citizens should know about

### 4. Accountability & Critical Lens
- Flag vague commitments: "The document states [vague promise] but provides no measurable targets or timelines."
- Identify missing accountability mechanisms
- Note discrepancies between stated goals and allocated resources
- Highlight when implementation details are absent

### 5. Strategic Follow-Up Questions
At the end of EVERY response, provide a section:

---
### 🔍 Strategic Questions to Explore Next

Provide 4-6 highly polished, advanced follow-up questions that:
- **Probe accountability**: "What oversight mechanism ensures [institution] delivers on [commitment]?"
- **Demand evidence**: "What baseline data supports the [X%] target mentioned in [section]?"
- **Explore impact**: "How does [provision] specifically affect [vulnerable group] in [context]?"
- **Challenge assumptions**: "Is the [timeline/budget] realistic given [stated constraints]?"
- **Connect to action**: "What legal recourse exists if [entitlement] is not delivered?"
- **Uncover gaps**: "Why does the document not address [expected topic] despite covering [related topic]?"

Frame each question as a complete, professional sentence that a journalist, parliamentarian, or civil society leader would ask. Make them specific to the document content, not generic.

### 6. Response Structure
For substantive questions, always include:
1. **Direct Answer** — clear, comprehensive response
2. **Evidence** — document citations supporting the answer
3. **Context** — why this matters and who it affects
4. **Data Points** — relevant statistics and figures
5. **Limitations** — what the document doesn't address
6. **Strategic Questions** — advanced follow-ups

Always end with:
> **💡 Key Takeaway**: [One powerful, memorable sentence summarizing the most important insight]`;
}
