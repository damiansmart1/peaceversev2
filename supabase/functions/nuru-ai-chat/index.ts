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
    const { action, documentId, question, claimText } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Action: summarize a document
    if (action === 'summarize') {
      const { data: doc, error } = await supabase
        .from('civic_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error || !doc) throw new Error('Document not found');

      const textToSummarize = doc.original_text || doc.description || '';
      if (!textToSummarize) throw new Error('No text content to summarize');

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
              content: `You are NuruAI, a civic intelligence assistant that makes government documents understandable. 
              Analyze this policy document and provide:
              1. A plain language summary (2-3 paragraphs)
              2. Key topics covered (as a list)
              3. Key institutions mentioned
              4. Financial allocations if any
              5. Potential impact on citizens
              
              Format your response as JSON with keys: summary, topics, institutions, financialAllocations, citizenImpact.
              Be factual, cite only what's in the document, and flag any uncertainty.`
            },
            { role: 'user', content: textToSummarize.substring(0, 15000) }
          ],
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) throw new Error('Rate limit exceeded. Please try again later.');
        if (response.status === 402) throw new Error('AI credits depleted. Contact admin.');
        throw new Error(`AI service error: ${response.status}`);
      }

      const aiData = await response.json();
      let parsed;
      try {
        const content = aiData.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: content };
      } catch {
        parsed = { summary: aiData.choices[0].message.content };
      }

      // Update document with AI summary
      await supabase.from('civic_documents').update({
        summary: parsed.summary,
        ai_summary: parsed,
        topics: parsed.topics || [],
        institutions: parsed.institutions || [],
        financial_allocations: parsed.financialAllocations || null,
        status: 'ready',
        updated_at: new Date().toISOString(),
      }).eq('id', documentId);

      return new Response(JSON.stringify({ success: true, summary: parsed }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Action: answer a civic question
    if (action === 'ask') {
      if (!question || !documentId) throw new Error('Question and document ID required');

      const { data: doc } = await supabase
        .from('civic_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (!doc) throw new Error('Document not found');

      const documentContext = doc.original_text || doc.summary || doc.description || '';

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
              content: `You are NuruAI, a civic intelligence assistant. Answer the citizen's question using ONLY the provided document content.
              
              Rules:
              - Only use information from the document. Never fabricate.
              - Quote relevant passages from the document.
              - Assign a confidence score (0.0 to 1.0) based on how well the document answers the question.
              - If the document doesn't contain enough info, say so honestly.
              
              Format response as JSON: {
                "answer": "your answer",
                "confidence": 0.85,
                "sourcePassages": ["relevant quote 1", "relevant quote 2"],
                "documentReferences": [{"section": "Section name", "page": "if available"}]
              }`
            },
            {
              role: 'user',
              content: `Document: "${doc.title}"\n\nContent:\n${documentContext.substring(0, 12000)}\n\nQuestion: ${question}`
            }
          ],
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) throw new Error('Rate limit exceeded.');
        if (response.status === 402) throw new Error('AI credits depleted.');
        throw new Error(`AI error: ${response.status}`);
      }

      const aiData = await response.json();
      let parsed;
      try {
        const content = aiData.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { answer: content, confidence: 0.5 };
      } catch {
        parsed = { answer: aiData.choices[0].message.content, confidence: 0.5 };
      }

      // Update question count
      await supabase.rpc('increment_count', { row_id: documentId, table_name: 'civic_documents', column_name: 'question_count' }).catch(() => {});

      return new Response(JSON.stringify({ success: true, ...parsed }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Action: review a claim
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
          documentContext = `Reference Document: "${doc.title}"\n${doc.original_text || doc.summary || ''}`;
        }
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
              content: `You are NuruAI's fact-checking module. Review this claim against official documents.
              Respond as JSON: {
                "status": "supported|unsupported|misleading|needs_context",
                "evidenceSummary": "explanation",
                "supportingPassages": ["relevant quotes"],
                "confidence": 0.0-1.0
              }`
            },
            {
              role: 'user',
              content: `Claim: "${claimText}"\n\n${documentContext ? documentContext.substring(0, 10000) : 'No specific document referenced.'}`
            }
          ],
          temperature: 0.1,
        }),
      });

      if (!response.ok) throw new Error(`AI error: ${response.status}`);

      const aiData = await response.json();
      let parsed;
      try {
        const content = aiData.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { status: 'needs_context', evidenceSummary: content };
      } catch {
        parsed = { status: 'needs_context', evidenceSummary: aiData.choices[0].message.content };
      }

      return new Response(JSON.stringify({ success: true, ...parsed }), {
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
