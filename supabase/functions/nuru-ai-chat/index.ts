import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const AI_GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';
const MODEL = 'google/gemini-2.5-pro';

function getSupabase() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

async function callAI(apiKey: string, messages: any[], temperature = 0.1) {
  const response = await fetch(AI_GATEWAY, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: MODEL, messages, temperature }),
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
  await supabase.from('nuru_audit_log').insert({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details: details || {},
  }).catch((e: any) => console.error('Audit log error:', e));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, documentId, question, claimText, conversationId, messages: chatMessages } = body;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const supabase = getSupabase();

    // Extract user from auth header
    let userId: string | null = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const startTime = Date.now();

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
          content: `You are NuruAI, a world-class civic intelligence assistant specialized in making government documents understandable for citizens across Africa. You operate as public civic infrastructure.

Analyze this policy document with the following rigorous methodology:

1. **Executive Summary** (2-3 paragraphs in plain language a citizen can understand)
2. **Key Topics** covered (as a JSON array of strings)  
3. **Key Institutions** mentioned with their roles
4. **Financial Allocations** - any monetary figures, percentages, or budget items with exact amounts
5. **Citizen Impact Assessment** - how this affects ordinary citizens, with specific examples
6. **Policy Timeline** - key dates, deadlines, or implementation phases
7. **Stakeholders** - who benefits and who is affected

CRITICAL RULES:
- ONLY cite information explicitly stated in the document
- If information is ambiguous, say "The document states X, which could mean Y or Z"
- Never fabricate statistics, dates, or figures
- Flag any sections that are unclear with "[Requires clarification]"
- Use simple language suitable for a citizen with secondary education

Format response as JSON:
{
  "summary": "plain language summary",
  "topics": ["topic1", "topic2"],
  "institutions": ["institution1", "institution2"],
  "financialAllocations": {"item": "amount"},
  "citizenImpact": "impact description",
  "policyTimeline": [{"date": "date", "event": "event"}],
  "stakeholders": ["stakeholder1"],
  "keyFindings": ["finding1", "finding2"],
  "complexityScore": 0.0-1.0,
  "readabilityGrade": "simplified grade level"
}`
        },
        { role: 'user', content: textToSummarize.substring(0, 30000) }
      ], 0.15);

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

      // Create version record
      await supabase.from('nuru_document_versions').insert({
        document_id: documentId,
        version_number: 1,
        original_text: textToSummarize.substring(0, 50000),
        uploaded_by: userId,
      });

      await logAudit(supabase, userId, 'document_summarized', 'civic_document', documentId, { processingTime, topicCount: parsed.topics?.length });

      return new Response(JSON.stringify({ success: true, summary: parsed, processingTime }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ===== ACTION: CONVERSATIONAL Q&A (multi-turn) =====
    if (action === 'chat') {
      if (!conversationId) throw new Error('Conversation ID required');

      // Get conversation with document context
      const { data: conv } = await supabase
        .from('nuru_conversations')
        .select('*, civic_documents(*)')
        .eq('id', conversationId)
        .single();

      if (!conv) throw new Error('Conversation not found');

      const doc = conv.civic_documents;
      const documentContext = doc ? (doc.original_text || doc.summary || doc.description || '') : '';

      // Get conversation history
      const { data: history } = await supabase
        .from('nuru_messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(20);

      const userQuestion = chatMessages?.[chatMessages.length - 1]?.content || '';

      const systemPrompt = `You are NuruAI, an advanced civic intelligence assistant that transforms complex government documents into clear, actionable civic knowledge. You serve as public civic infrastructure for democratic participation across Africa.

${doc ? `CONTEXT DOCUMENT: "${doc.title}" (Type: ${doc.document_type})
DOCUMENT CONTENT:
${documentContext.substring(0, 25000)}` : 'No specific document referenced.'}

CRITICAL OPERATING RULES:
1. GROUND ALL ANSWERS in the provided document content. Never fabricate information.
2. Quote exact passages from the document when supporting your answers.
3. If the document doesn't contain relevant information, clearly state: "This document does not contain information about [topic]."
4. Assign a confidence score (0.0-1.0) based on how directly the document answers the question.
5. Use plain, accessible language suitable for citizens with varying education levels.
6. For financial data, always cite exact figures from the document.
7. When uncertain, say "Based on the available text, it appears that..." rather than stating as fact.
8. Suggest follow-up questions that would help the citizen understand the policy better.
9. If asked about something outside the document, acknowledge the limitation.

RESPONSE FORMAT (JSON):
{
  "answer": "Clear, comprehensive answer in plain language",
  "confidence": 0.85,
  "sourcePassages": ["Exact quote from document 1", "Exact quote 2"],
  "documentReferences": [{"section": "Section name", "context": "Brief context"}],
  "suggestedFollowUps": ["Follow-up question 1", "Follow-up question 2"],
  "keyTakeaway": "One sentence summary of the answer"
}`;

      const aiMessages = [
        { role: 'system', content: systemPrompt },
        ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
        { role: 'user', content: userQuestion },
      ];

      const content = await callAI(LOVABLE_API_KEY, aiMessages, 0.1);
      const parsed = parseJSON(content) || { answer: content, confidence: 0.5 };
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
        content: parsed.answer,
        sources: { passages: parsed.sourcePassages, references: parsed.documentReferences, followUps: parsed.suggestedFollowUps },
        confidence: parsed.confidence,
        model_used: MODEL,
        processing_time_ms: processingTime,
      });

      // Update conversation
      await supabase.from('nuru_conversations').update({
        message_count: (conv.message_count || 0) + 2,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', conversationId);

      // Update question count on document
      if (doc) {
        await supabase.from('civic_documents').update({
          question_count: (doc.question_count || 0) + 1,
        }).eq('id', doc.id);
      }

      await logAudit(supabase, userId, 'question_asked', 'nuru_conversation', conversationId, {
        processingTime, confidence: parsed.confidence, documentId: doc?.id,
      });

      return new Response(JSON.stringify({ success: true, ...parsed, processingTime }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ===== ACTION: SINGLE QUESTION (legacy + civic_questions) =====
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
          content: `You are NuruAI, a world-class civic intelligence assistant. Answer the citizen's question using ONLY the provided document content.
              
RULES:
- Only use information from the document. Never fabricate.
- Quote relevant passages directly from the document.
- Assign a confidence score (0.0 to 1.0) based on how well the document answers the question.
- If the document doesn't contain enough info, say so honestly and explain what information is missing.
- Use plain language accessible to all citizens.
- Provide specific figures, dates, and facts from the document.
- Suggest 2-3 follow-up questions the citizen might want to ask.

Format response as JSON: {
  "answer": "your comprehensive answer",
  "confidence": 0.85,
  "sourcePassages": ["relevant quote 1", "relevant quote 2"],
  "documentReferences": [{"section": "Section name", "page": "if available"}],
  "suggestedFollowUps": ["follow-up question 1", "follow-up question 2"],
  "keyTakeaway": "one sentence summary"
}`
        },
        {
          role: 'user',
          content: `Document: "${doc.title}"\n\nContent:\n${documentContext.substring(0, 25000)}\n\nQuestion: ${question}`
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
          documentContext = `Reference Document: "${doc.title}"\n${(doc.original_text || doc.summary || '').substring(0, 20000)}`;
        }
      }

      const content = await callAI(LOVABLE_API_KEY, [
        {
          role: 'system',
          content: `You are NuruAI's fact-checking module, a rigorous evidence-based verification system for civic claims.

METHODOLOGY:
1. Extract the core factual claims from the statement
2. Compare each claim against the provided document evidence
3. Assess the accuracy, context, and completeness of each claim
4. Provide a detailed evidence summary

CRITICAL RULES:
- Only mark as "supported" if the document explicitly confirms the claim with matching data
- Mark as "misleading" if the claim takes information out of context or misrepresents it
- Mark as "unsupported" only if the document contradicts the claim
- Mark as "needs_context" if the document doesn't address the claim or more information is needed
- Always explain your reasoning with specific document references

Respond as JSON: {
  "status": "supported|unsupported|misleading|needs_context",
  "evidenceSummary": "detailed explanation of findings",
  "supportingPassages": ["relevant quotes from document"],
  "contradictingEvidence": ["any contradicting quotes"],
  "confidence": 0.0-1.0,
  "recommendation": "what the citizen should know",
  "factCheckDetails": [{"claim": "specific claim", "verdict": "status", "evidence": "evidence"}]
}`
        },
        {
          role: 'user',
          content: `Claim to verify: "${claimText}"\n\n${documentContext || 'No specific document referenced. Evaluate based on general civic knowledge and flag that no official document was used.'}`
        }
      ], 0.1);

      const parsed = parseJSON(content) || { status: 'needs_context', evidenceSummary: content };
      const processingTime = Date.now() - startTime;

      // Save claim review
      if (documentId || claimText) {
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

      // Update document with extracted text
      await supabase.from('civic_documents').update({
        original_text: text.substring(0, 100000),
        file_type: fileType,
        processing_status: 'text_extracted',
      }).eq('id', docId);

      // Now trigger summarization
      const summarizeBody = JSON.stringify({ action: 'summarize', documentId: docId });
      // Recursive call to summarize
      const url = `${Deno.env.get('SUPABASE_URL')}/functions/v1/nuru-ai-chat`;
      await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: summarizeBody,
      });

      return new Response(JSON.stringify({ success: true, message: 'Document text extracted and processing started' }), {
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
