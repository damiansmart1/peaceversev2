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

serve(async (req) => {
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

      const systemPrompt = buildChatSystemPrompt(doc, documentContext);

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

      await supabase.from('civic_documents').update({ processing_status: 'processing' }).eq('id', documentId);

      const content = await callAI(LOVABLE_API_KEY, [
        {
          role: 'system',
          content: `You are NuruAI, a world-class civic intelligence analyst and policy decoder. You operate as critical public infrastructure for democratic participation across Africa.

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

      const { data: history } = await supabase
        .from('nuru_messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(30);

      const userQuestion = chatMessages?.[chatMessages.length - 1]?.content || '';
      const systemPrompt = buildChatSystemPrompt(doc, documentContext);

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

      const content = await callAI(LOVABLE_API_KEY, [
        {
          role: 'system',
          content: `You are NuruAI. Answer the citizen's question using ONLY the provided document content.

RULES:
- Only use information from the document. Never fabricate.
- Quote relevant passages directly.
- Assign confidence score (0.0-1.0).
- Use plain language accessible to all citizens.
- Suggest 2-3 follow-up questions.

Format as JSON: {
  "answer": "comprehensive answer",
  "confidence": 0.85,
  "sourcePassages": ["quote 1", "quote 2"],
  "documentReferences": [{"section": "name"}],
  "suggestedFollowUps": ["follow-up 1"],
  "keyTakeaway": "one sentence summary"
}`
        },
        {
          role: 'user',
          content: `Document: "${doc.title}"\n\nContent:\n${documentContext.substring(0, 30000)}\n\nQuestion: ${question}`
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

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    console.error('NuruAI error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'NuruAI processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildChatSystemPrompt(doc: any, documentContext: string): string {
  return `You are NuruAI, an advanced civic intelligence assistant that transforms complex government documents into clear, actionable knowledge. You serve as public civic infrastructure for democratic participation across Africa.

${doc ? `**CONTEXT DOCUMENT**: "${doc.title}" (Type: ${doc.document_type}, Country: ${doc.country || 'Not specified'})

**DOCUMENT CONTENT**:
${documentContext.substring(0, 35000)}` : 'No specific document referenced. Answer based on general civic knowledge and clearly state when information cannot be verified against an official document.'}

## YOUR OPERATING PRINCIPLES

### Accuracy & Integrity
- **GROUND ALL ANSWERS** in the provided document. Never fabricate information.
- Quote exact passages when supporting your answers using > blockquote format.
- For financial data, always cite exact figures from the document.
- If uncertain, say "Based on the available text, it appears that..." rather than stating as fact.

### Accessibility
- Use plain, accessible language suitable for citizens with varying education levels.
- Break down complex policy language into simple terms.
- Use bullet points and structured formatting for clarity.
- Explain technical terms when first used.

### Transparency
- If the document doesn't contain relevant info, state: "This document does not contain information about [topic]."
- When information is ambiguous, present multiple interpretations.
- Always encourage verification through official channels.

### Response Format
Use **markdown** formatting:
- Use headers (##, ###) to organize long answers
- Use bullet points for lists
- Use **bold** for key figures and important terms
- Use > blockquotes for document citations
- Use tables when comparing data points

Always end with a brief **Key Takeaway** in bold.`;
}
