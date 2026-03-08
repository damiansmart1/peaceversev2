import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const AI_GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';
const MODEL = 'google/gemini-2.5-pro';
const FAST_MODEL = 'google/gemini-2.5-flash';

function getSupabase() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

async function callAI(apiKey: string, messages: any[], temperature = 0.1, model = MODEL) {
  const response = await fetch(AI_GATEWAY, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, temperature }),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error('Rate limit exceeded. Please try again later.');
    if (response.status === 402) throw new Error('AI credits depleted. Please contact admin.');
    const t = await response.text();
    console.error('AI gateway error:', response.status, t);
    throw new Error(`AI service error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function streamAI(apiKey: string, messages: any[], temperature = 0.1, model = MODEL) {
  const response = await fetch(AI_GATEWAY, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, temperature, stream: true }),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error('Rate limit exceeded. Please try again later.');
    if (response.status === 402) throw new Error('AI credits depleted. Please contact admin.');
    const t = await response.text();
    console.error('AI gateway error:', response.status, t);
    throw new Error(`AI service error: ${response.status}`);
  }

  return response;
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
  try {
    const { data } = await supabase
      .from('country_constitutions')
      .select('original_text, constitution_title, country_name, ai_summary, key_provisions, fundamental_rights')
      .eq('country_name', countryName)
      .eq('is_active', true)
      .single();
    if (!data) return null;
    // Build a concise constitutional reference (key provisions + rights first, then full text truncated)
    let constitutionContext = '';
    if (data.ai_summary?.summary) constitutionContext += `CONSTITUTIONAL SUMMARY:\n${data.ai_summary.summary}\n\n`;
    if (data.key_provisions) constitutionContext += `KEY PROVISIONS:\n${JSON.stringify(data.key_provisions)}\n\n`;
    if (data.fundamental_rights) constitutionContext += `FUNDAMENTAL RIGHTS:\n${JSON.stringify(data.fundamental_rights)}\n\n`;
    constitutionContext += `FULL CONSTITUTIONAL TEXT:\n${(data.original_text || '').substring(0, 15000)}`;
    return { text: constitutionContext, title: data.constitution_title, country: data.country_name };
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

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, documentId, question, claimText, conversationId, messages: chatMessages, stream: useStream } = body;
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

    // ===== ACTION: STREAMING CHAT =====
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

      // Fetch constitution for cross-referencing
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

      const streamResponse = await streamAI(LOVABLE_API_KEY, aiMessages, 0.1);

      // Create a TransformStream to intercept and save the complete response
      let fullContent = '';
      const { readable, writable } = new TransformStream({
        transform(chunk, controller) {
          const text = new TextDecoder().decode(chunk);
          // Extract content from SSE chunks for saving
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
          // Save complete AI response
          await supabase.from('nuru_messages').insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: fullContent,
            model_used: MODEL,
            processing_time_ms: processingTime,
          });
          // Update conversation
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

          await logAudit(supabase, userId, 'chat_streamed', 'nuru_conversation', conversationId, { processingTime, documentId: doc?.id });
        }
      });

      streamResponse.body!.pipeTo(writable);

      return new Response(readable, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
      });
    }

    // ===== ACTION: SUMMARIZE DOCUMENT =====
    if (action === 'summarize') {
      const { data: doc, error } = await supabase
        .from('civic_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error || !doc) throw new Error('Document not found');

      const textToSummarize = doc.original_text || doc.description || '';
      if (!textToSummarize) throw new Error('No text content to summarize');

      // Fetch constitution for cross-referencing
      const constitution = await fetchConstitution(supabase, doc.country || null);
      const constitutionalContext = buildConstitutionalInstructions(constitution);

      await supabase.from('civic_documents').update({ processing_status: 'processing' }).eq('id', documentId);

      const content = await callAI(LOVABLE_API_KEY, [
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
      ], 0.12);

      const parsed = parseJSON(content) || { summary: content };
      const processingTime = Date.now() - startTime;

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

      await supabase.from('nuru_document_versions').insert({
        document_id: documentId,
        version_number: 1,
        original_text: textToSummarize.substring(0, 50000),
        uploaded_by: userId,
      }).catch(() => {});

      await logAudit(supabase, userId, 'document_summarized', 'civic_document', documentId, { processingTime, topicCount: parsed.topics?.length });

      return new Response(JSON.stringify({ success: true, summary: parsed, processingTime }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ===== ACTION: CONVERSATIONAL Q&A (non-streaming fallback) =====
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

      // Fetch constitution for cross-referencing
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

      const content = await callAI(LOVABLE_API_KEY, aiMessages, 0.1);
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
        model_used: MODEL,
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
        processingTime, documentId: doc?.id,
      });

      return new Response(JSON.stringify({ success: true, answer: content, processingTime }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ===== ACTION: SINGLE QUESTION =====
    if (action === 'ask') {
      if (!question || !documentId) throw new Error('Question and document ID required');

      const { data: doc } = await supabase
        .from('civic_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (!doc) throw new Error('Document not found');
      const documentContext = doc.original_text || doc.summary || doc.description || '';

      // Fetch constitution for cross-referencing
      const constitution = await fetchConstitution(supabase, doc.country || null);
      const constitutionalContext = buildConstitutionalInstructions(constitution);

      const content = await callAI(LOVABLE_API_KEY, [
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
      ], 0.1);

      const parsed = parseJSON(content) || { answer: content, confidence: 0.5 };
      const processingTime = Date.now() - startTime;

      await logAudit(supabase, userId, 'civic_question_asked', 'civic_document', documentId, {
        processingTime, confidence: parsed.confidence,
      });

      return new Response(JSON.stringify({ success: true, ...parsed, processingTime }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ===== ACTION: REVIEW CLAIM =====
    if (action === 'review_claim') {
      if (!claimText) throw new Error('Claim text required');

      let documentContext = '';
      if (documentId) {
        const { data: doc } = await supabase
          .from('civic_documents')
          .select('original_text, summary, title')
          .eq('id', documentId)
          .single();
        if (doc) {
          documentContext = `Reference Document: "${doc.title}"\n${(doc.original_text || doc.summary || '').substring(0, 25000)}`;
        }
      }

      const content = await callAI(LOVABLE_API_KEY, [
        {
          role: 'system',
          content: `You are NuruAI's fact-checking module, a rigorous evidence-based verification system.

METHODOLOGY:
1. Extract core factual claims
2. Compare against document evidence
3. Assess accuracy, context, completeness
4. Provide detailed evidence summary

CRITICAL RULES:
- "supported" = document explicitly confirms with matching data
- "misleading" = claim takes info out of context
- "unsupported" = document contradicts the claim
- "needs_context" = document doesn't address or more info needed

Respond as JSON: {
  "status": "supported|unsupported|misleading|needs_context",
  "evidenceSummary": "detailed explanation",
  "supportingPassages": ["quotes"],
  "contradictingEvidence": ["quotes"],
  "confidence": 0.0-1.0,
  "recommendation": "citizen guidance",
  "factCheckDetails": [{"claim": "specific claim", "verdict": "status", "evidence": "evidence"}]
}`
        },
        {
          role: 'user',
          content: `Claim to verify: "${claimText}"\n\n${documentContext || 'No specific document referenced.'}`
        }
      ], 0.1);

      const parsed = parseJSON(content) || { status: 'needs_context', evidenceSummary: content };
      const processingTime = Date.now() - startTime;

      if (claimText) {
        await supabase.from('civic_claim_reviews').insert({
          claim_text: claimText,
          source_document_id: documentId || null,
          flagged_by: userId,
          evidence_summary: parsed.evidenceSummary,
          supporting_passages: parsed.supportingPassages || [],
          review_status: parsed.status,
        }).catch(() => {});
      }

      await logAudit(supabase, userId, 'claim_reviewed', 'civic_claim', undefined, {
        processingTime, status: parsed.status, confidence: parsed.confidence,
      });

      return new Response(JSON.stringify({ success: true, ...parsed, processingTime }), {
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

      // Trigger summarization
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

    // ===== ACTION: COMPARE DOCUMENTS =====
    if (action === 'compare_documents') {
      const { documentIds } = body;
      if (!documentIds || documentIds.length < 2) throw new Error('Need at least 2 document IDs');

      const { data: docs } = await supabase
        .from('civic_documents')
        .select('id, title, summary, topics, financial_allocations, country')
        .in('id', documentIds);

      if (!docs || docs.length < 2) throw new Error('Documents not found');

      const content = await callAI(LOVABLE_API_KEY, [
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
          content: docs.map(d => `Document: "${d.title}" (${d.country})\nSummary: ${d.summary}\nTopics: ${d.topics?.join(', ')}\nFinancials: ${JSON.stringify(d.financial_allocations)}`).join('\n\n---\n\n')
        }
      ], 0.15, FAST_MODEL);

      return new Response(JSON.stringify({ success: true, comparison: content, documents: docs.map(d => ({ id: d.id, title: d.title, country: d.country })) }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ===== ACTION: PROCESS CONSTITUTION =====
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

      const content = await callAI(LOVABLE_API_KEY, [
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
      ], 0.1);

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
        processingTime: Date.now() - startTime, country: constitution.country_name,
      });

      return new Response(JSON.stringify({ success: true, summary: parsed }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    console.error('NuruAI error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'NuruAI processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
