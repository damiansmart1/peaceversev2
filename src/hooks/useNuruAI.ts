import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRef, useCallback } from 'react';

const sb = supabase as any;

/**
 * Extract a human-readable error message from edge function responses.
 * supabase.functions.invoke returns { data, error } where error on non-2xx
 * is a FunctionsHttpError whose context contains the response body.
 */
async function extractEdgeFunctionError(error: any): Promise<string> {
  // FunctionsHttpError has a context property with the response
  if (error?.context) {
    try {
      // context is the Response object — try to parse its JSON body
      if (typeof error.context.json === 'function') {
        const body = await error.context.json();
        if (body?.error) return body.error;
      }
    } catch {
      // fallback
    }
  }
  // Try .message directly
  if (error?.message && error.message !== 'Edge Function returned a non-2xx status code') {
    return error.message;
  }
  // Try JSON stringifying
  try {
    const str = JSON.stringify(error);
    if (str && str !== '{}') return str;
  } catch {}
  return 'An unexpected error occurred. Please try again.';
}

/** Wrapper: invoke edge function and throw with the exact error message */
async function invokeNuruAI(body: Record<string, any>) {
  const { data, error } = await supabase.functions.invoke('nuru-ai-chat', { body });
  if (error) {
    const msg = await extractEdgeFunctionError(error);
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

export interface CivicDocument {
  id: string;
  title: string;
  description: string;
  document_type: string;
  file_url: string | null;
  original_text: string | null;
  parsed_sections: any;
  summary: string | null;
  ai_summary: any;
  topics: string[];
  institutions: string[];
  financial_allocations: any;
  status: string;
  uploaded_by: string | null;
  country: string | null;
  region: string | null;
  publish_date: string | null;
  source_url: string | null;
  view_count: number;
  question_count: number;
  file_type: string | null;
  file_size_bytes: number | null;
  processing_status: string | null;
  processing_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface CivicQuestion {
  id: string;
  question_text: string;
  document_id: string;
  asked_by: string | null;
  is_anonymous: boolean;
  ai_answer: string | null;
  ai_confidence: number | null;
  source_passages: any;
  document_references: any;
  status: string;
  upvote_count: number;
  view_count: number;
  is_public: boolean;
  tags: string[];
  created_at: string;
}

export interface InstitutionalResponse {
  id: string;
  question_id: string;
  institution_name: string;
  respondent_id: string | null;
  response_text: string;
  status: string;
  created_at: string;
}

export interface NuruConversation {
  id: string;
  user_id: string;
  document_id: string | null;
  title: string | null;
  message_count: number;
  last_message_at: string;
  is_shared: boolean;
  created_at: string;
}

export interface NuruMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources: any;
  confidence: number | null;
  model_used: string | null;
  processing_time_ms: number | null;
  created_at: string;
}

export interface NuruAuditEntry {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  created_at: string;
}

export interface ChatAttachment {
  file: File;
  name: string;
  type: string;
  size: number;
  previewUrl?: string;
  extractedText?: string;
}

// ========== Document Hooks ==========

export function useCivicDocuments(type?: string) {
  return useQuery({
    queryKey: ['civic-documents', type],
    queryFn: async () => {
      let query = sb.from('civic_documents').select('*').order('created_at', { ascending: false });
      if (type && type !== 'all') query = query.eq('document_type', type);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as CivicDocument[];
    },
  });
}

export function useCivicDocument(id: string) {
  return useQuery({
    queryKey: ['civic-document', id],
    queryFn: async () => {
      const { data, error } = await sb.from('civic_documents').select('*').eq('id', id).single();
      if (error) throw error;
      return data as CivicDocument;
    },
    enabled: !!id,
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (doc: { title: string; description: string; document_type: string; original_text: string; country?: string; region?: string; source_url?: string; publish_date?: string; language?: string; topics?: string[]; institutions?: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');
      const { data, error } = await sb.from('civic_documents').insert({
        ...doc,
        uploaded_by: user.id,
        status: 'processing',
        processing_status: 'pending',
      }).select().single();
      if (error) throw error;
      await invokeNuruAI({ action: 'summarize', documentId: data.id });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['civic-documents'] });
      toast.success('Document uploaded and processing started');
    },
    onError: (e: any) => toast.error(e.message || 'Upload failed'),
  });
}

export function useUploadDocumentFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, title, description, documentType, country, region, source_url, publish_date, language, topics, institutions }: { file: File; title: string; description: string; documentType: string; country?: string; region?: string; source_url?: string; publish_date?: string; language?: string; topics?: string[]; institutions?: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { data: doc, error: docError } = await sb.from('civic_documents').insert({
        title,
        description,
        document_type: documentType,
        uploaded_by: user.id,
        status: 'processing',
        processing_status: 'uploading',
        file_type: file.type,
        file_size_bytes: file.size,
        country: country || null,
        region: region || null,
        source_url: source_url || null,
        publish_date: publish_date || null,
        language: language || null,
        topics: topics?.length ? topics : null,
        institutions: institutions?.length ? institutions : null,
      }).select().single();
      if (docError) throw docError;

      const filePath = `${user.id}/${doc.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage.from('nuru-documents').upload(filePath, file);
      if (uploadError) {
        await sb.from('civic_documents').update({ processing_status: 'upload_failed', processing_error: uploadError.message }).eq('id', doc.id);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage.from('nuru-documents').getPublicUrl(filePath);
      await sb.from('civic_documents').update({ file_url: publicUrl, processing_status: 'uploaded' }).eq('id', doc.id);

      const { data: extractResult, error: extractError } = await supabase.functions.invoke('extract-document-text', {
        body: { documentId: doc.id, fileUrl: publicUrl, fileName: file.name, fileType: file.type },
      });
      if (extractError) {
        console.error('Server-side extraction error:', extractError);
        const text = await extractTextFromFile(file);
        if (text && text.length > 50) {
          await supabase.functions.invoke('nuru-ai-chat', {
            body: { action: 'parse_document', text, documentId: doc.id, fileName: file.name, fileType: file.type },
          });
        } else {
          await sb.from('civic_documents').update({
            processing_status: 'text_extraction_failed',
            processing_error: 'Could not extract text. Please paste the text content manually via the text upload tab.',
          }).eq('id', doc.id);
        }
      }

      return doc;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['civic-documents'] });
      toast.success('Document uploaded and processing started');
    },
    onError: (e: any) => toast.error(e.message || 'Upload failed'),
  });
}

async function extractTextFromFile(file: File): Promise<string | null> {
  try {
    if (file.type === 'text/plain' || file.type === 'text/csv' || 
        file.name.endsWith('.txt') || file.name.endsWith('.csv') ||
        file.name.endsWith('.rtf') || file.name.endsWith('.md')) {
      const raw = await file.text();
      if (raw.startsWith('{\\rtf')) {
        return raw.replace(/\{\\[^{}]*\}|\\[a-z]+\d*\s?|[{}]/gi, '').trim() || null;
      }
      return raw.length > 10 ? raw : null;
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    if (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const text = extractTextFromDocx(uint8Array);
      if (text && text.length > 50) return text;
    }

    if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
      const text = extractTextFromPdf(uint8Array);
      if (text && text.length > 50) return text;
    }

    const decoder = new TextDecoder('utf-8', { fatal: false });
    const rawText = decoder.decode(uint8Array);
    const readable = rawText.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s{3,}/g, ' ').trim();
    return readable.length > 50 ? readable : null;
  } catch (e) {
    console.error('Text extraction error:', e);
    return null;
  }
}

function extractTextFromPdf(data: Uint8Array): string | null {
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const rawText = decoder.decode(data);
  const parts: string[] = [];

  const btBlocks = rawText.match(/BT[\s\S]*?ET/g);
  if (btBlocks) {
    for (const block of btBlocks) {
      const tjMatches = block.match(/\(([^)]*)\)\s*Tj/g);
      if (tjMatches) {
        parts.push(...tjMatches.map(t => t.replace(/\)\s*Tj/, '').replace(/^\(/, '')));
      }
      const tjArrays = block.match(/\[([^\]]*)\]\s*TJ/gi);
      if (tjArrays) {
        for (const arr of tjArrays) {
          const strs = arr.match(/\(([^)]*)\)/g);
          if (strs) parts.push(...strs.map(s => s.slice(1, -1)));
        }
      }
    }
  }

  if (parts.length === 0) {
    const segments = rawText.match(/\(([^)]{4,})\)/g);
    if (segments) {
      parts.push(...segments.map(s => s.slice(1, -1)));
    }
  }

  if (parts.length === 0) {
    const streams = rawText.match(/stream\r?\n([\s\S]*?)endstream/g);
    if (streams) {
      for (const stream of streams) {
        const content = stream.replace(/^stream\r?\n/, '').replace(/endstream$/, '');
        const readable = content.replace(/[^\x20-\x7E\n\r]/g, '').trim();
        if (readable.length > 20) parts.push(readable);
      }
    }
  }

  let text = parts.join(' ')
    .replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(').replace(/\\\)/g, ')').replace(/\\\\/g, '\\')
    .replace(/\s{2,}/g, ' ').trim();

  return text.length > 50 ? text : null;
}

function extractTextFromDocx(data: Uint8Array): string | null {
  try {
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const raw = decoder.decode(data);
    
    const xmlContent = raw.match(/<w:t[^>]*>([^<]*)<\/w:t>/gi);
    if (!xmlContent || xmlContent.length === 0) return null;

    const text = xmlContent
      .map(tag => tag.replace(/<[^>]+>/g, ''))
      .join(' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    return text.length > 50 ? text : null;
  } catch {
    return null;
  }
}

// ========== Question Hooks ==========

export function useCivicQuestions(documentId?: string) {
  return useQuery({
    queryKey: ['civic-questions', documentId],
    queryFn: async () => {
      let query = sb.from('civic_questions').select('*').eq('is_public', true).order('upvote_count', { ascending: false }).limit(100);
      if (documentId) query = query.eq('document_id', documentId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as CivicQuestion[];
    },
  });
}

export function useInstitutionalResponses(questionId: string) {
  return useQuery({
    queryKey: ['institutional-responses', questionId],
    queryFn: async () => {
      const { data, error } = await sb.from('institutional_responses').select('*').eq('question_id', questionId).order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as InstitutionalResponse[];
    },
    enabled: !!questionId,
  });
}

export function useAskQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ question, documentId, isAnonymous }: { question: string; documentId: string; isAnonymous?: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: aiResult, error: aiError } = await supabase.functions.invoke('nuru-ai-chat', {
        body: { action: 'ask', question, documentId },
      });
      if (aiError) throw aiError;
      const { data, error } = await sb.from('civic_questions').insert({
        question_text: question,
        document_id: documentId,
        asked_by: user?.id || null,
        is_anonymous: isAnonymous || false,
        ai_answer: aiResult.answer,
        ai_confidence: aiResult.confidence,
        source_passages: aiResult.sourcePassages || [],
        document_references: aiResult.documentReferences || [],
        status: 'answered',
      }).select().single();
      if (error) throw error;
      return { ...data, ...aiResult };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['civic-questions'] });
      toast.success('Question answered');
    },
    onError: (e: any) => toast.error(e.message || 'Failed to get answer'),
  });
}

export function useSubmitResponse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ questionId, institutionName, responseText }: { questionId: string; institutionName: string; responseText: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');
      const { data, error } = await sb.from('institutional_responses').insert({
        question_id: questionId,
        institution_name: institutionName,
        respondent_id: user.id,
        response_text: responseText,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['institutional-responses'] });
      toast.success('Response published');
    },
    onError: (e: any) => toast.error(e.message || 'Failed to submit response'),
  });
}

// ========== Conversation Hooks ==========

export function useNuruConversations() {
  return useQuery({
    queryKey: ['nuru-conversations'],
    queryFn: async () => {
      const { data, error } = await sb.from('nuru_conversations').select('*').order('last_message_at', { ascending: false }).limit(50);
      if (error) throw error;
      return (data || []) as NuruConversation[];
    },
  });
}

export function useNuruMessages(conversationId: string) {
  return useQuery({
    queryKey: ['nuru-messages', conversationId],
    queryFn: async () => {
      const { data, error } = await sb.from('nuru_messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as NuruMessage[];
    },
    enabled: !!conversationId,
    refetchInterval: 5000,
  });
}

export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ documentId, title }: { documentId?: string; title?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');
      const { data, error } = await sb.from('nuru_conversations').insert({
        user_id: user.id,
        document_id: documentId || null,
        title: title || 'New Conversation',
      }).select().single();
      if (error) throw error;
      return data as NuruConversation;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nuru-conversations'] }),
  });
}

export function useDeleteConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      await sb.from('nuru_messages').delete().eq('conversation_id', conversationId);
      const { error } = await sb.from('nuru_conversations').delete().eq('id', conversationId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nuru-conversations'] });
      toast.success('Conversation deleted');
    },
    onError: (e: any) => toast.error(e.message || 'Failed to delete'),
  });
}

export function useRenameConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, title }: { conversationId: string; title: string }) => {
      const { error } = await sb.from('nuru_conversations').update({ title }).eq('id', conversationId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nuru-conversations'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to rename'),
  });
}

export function useClearConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await sb.from('nuru_messages').delete().eq('conversation_id', conversationId);
      if (error) throw error;
      await sb.from('nuru_conversations').update({ message_count: 0 }).eq('id', conversationId);
    },
    onSuccess: (_, conversationId) => {
      qc.invalidateQueries({ queryKey: ['nuru-messages', conversationId] });
      qc.invalidateQueries({ queryKey: ['nuru-conversations'] });
      toast.success('Conversation cleared');
    },
    onError: (e: any) => toast.error(e.message || 'Failed to clear'),
  });
}

export function useSendChatMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, message }: { conversationId: string; message: string }) => {
      const { data, error } = await supabase.functions.invoke('nuru-ai-chat', {
        body: { action: 'chat', conversationId, messages: [{ role: 'user', content: message }] },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['nuru-messages', variables.conversationId] });
      qc.invalidateQueries({ queryKey: ['nuru-conversations'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to send message'),
  });
}

// Streaming chat with AbortController support
export function useStreamChatMessage() {
  const qc = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const streamChat = useCallback(async (
    conversationId: string,
    message: string,
    onDelta: (text: string) => void,
    onDone: () => void,
    attachmentContext?: string,
  ) => {
    // Abort any previous stream
    abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nuru-ai-chat`;

    const messageContent = attachmentContext
      ? `${message}\n\n---\n**Attached file content:**\n${attachmentContext}`
      : message;

    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        action: 'chat_stream',
        conversationId,
        messages: [{ role: 'user', content: messageContent }],
      }),
      signal: controller.signal,
    });

    if (!resp.ok) {
      let errMsg = '';
      try { const errData = JSON.parse(await resp.text()); errMsg = errData.error || ''; } catch { errMsg = await resp.text().catch(() => ''); }
      
      if (resp.status === 429) {
        throw new Error('⏳ Rate limit reached. Please wait a moment before sending another message.');
      }
      if (resp.status === 402) {
        throw new Error('💳 AI credits depleted. Please add credits to your workspace under Settings → Workspace → Usage.');
      }
      throw new Error(errMsg || `Stream failed: ${resp.status}`);
    }

    if (!resp.body) throw new Error('No response body');

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let aborted = false;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onDelta(content);
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        aborted = true;
      } else {
        throw e;
      }
    }

    // Flush remaining
    if (!aborted && textBuffer.trim()) {
      for (let raw of textBuffer.split('\n')) {
        if (!raw || !raw.startsWith('data: ')) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {}
      }
    }

    abortControllerRef.current = null;
    onDone();
    qc.invalidateQueries({ queryKey: ['nuru-messages', conversationId] });
    qc.invalidateQueries({ queryKey: ['nuru-conversations'] });
  }, [qc, abort]);

  return { streamChat, abort };
}

// ========== Chat Attachment Helpers ==========

export async function extractTextFromAttachment(file: File): Promise<string | null> {
  return extractTextFromFile(file);
}

// ========== Document Bookmarks ==========

export function useDocumentBookmarks() {
  return useQuery({
    queryKey: ['document-bookmarks'],
    queryFn: async () => {
      const { data, error } = await sb.from('document_bookmarks').select('*, civic_documents(id, title, document_type, country)').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useToggleBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ documentId }: { documentId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { data: existing } = await sb.from('document_bookmarks').select('id').eq('user_id', user.id).eq('document_id', documentId).single();
      if (existing) {
        await sb.from('document_bookmarks').delete().eq('id', existing.id);
        return { bookmarked: false };
      } else {
        await sb.from('document_bookmarks').insert({ user_id: user.id, document_id: documentId });
        return { bookmarked: true };
      }
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['document-bookmarks'] });
      toast.success(data.bookmarked ? 'Document bookmarked' : 'Bookmark removed');
    },
  });
}

// ========== Review & Analytics Hooks ==========

export function useReviewClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ claimText, documentId, claimSource, claimSourceUrl }: {
      claimText: string; documentId?: string; claimSource?: string; claimSourceUrl?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('nuru-ai-chat', {
        body: { action: 'review_claim', claimText, documentId, claimSource, claimSourceUrl },
      });
      if (error) throw new Error(error?.message || JSON.stringify(error));
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['claim-review-history'] });
    },
    onError: (e: any) => toast.error(e.message || 'Claim review failed'),
  });
}

export function useBatchReviewClaims() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ claims, documentId }: { claims: (string | { text: string; source?: string; sourceUrl?: string })[]; documentId?: string }) => {
      const { data, error } = await supabase.functions.invoke('nuru-ai-chat', {
        body: { action: 'batch_review_claims', claims, documentId },
      });
      if (error) throw new Error(error?.message || JSON.stringify(error));
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['claim-review-history'] });
    },
    onError: (e: any) => toast.error(e.message || 'Batch review failed'),
  });
}

export function useToggleClaimPublic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ reviewId, isPublic }: { reviewId: string; isPublic: boolean }) => {
      const { data, error } = await supabase.functions.invoke('nuru-ai-chat', {
        body: { action: 'toggle_claim_public', reviewId, isPublic },
      });
      if (error) throw new Error(error?.message || JSON.stringify(error));
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['claim-review-history'] });
      toast.success('Sharing settings updated');
    },
    onError: (e: any) => toast.error(e.message || 'Failed to update sharing'),
  });
}

export function useCompareDocuments() {
  return useMutation({
    mutationFn: async ({ documentIds }: { documentIds: string[] }) => {
      const { data, error } = await supabase.functions.invoke('nuru-ai-chat', {
        body: { action: 'compare_documents', documentIds },
      });
      if (error) throw error;
      return data;
    },
    onError: (e: any) => toast.error(e.message || 'Document comparison failed'),
  });
}

export function useCivicAnalytics() {
  return useQuery({
    queryKey: ['civic-analytics'],
    queryFn: async () => {
      const { data, error } = await sb.from('civic_analytics').select('*').order('created_at', { ascending: false }).limit(500);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useGovernanceRegistry() {
  return useQuery({
    queryKey: ['governance-registry'],
    queryFn: async () => {
      const { data, error } = await sb.from('ai_governance_registry').select('*').order('severity', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useNuruAuditLog() {
  return useQuery({
    queryKey: ['nuru-audit-log'],
    queryFn: async () => {
      const { data, error } = await sb.from('nuru_audit_log').select('*').order('created_at', { ascending: false }).limit(200);
      if (error) throw error;
      return (data || []) as NuruAuditEntry[];
    },
  });
}

export function useClaimReviewHistory() {
  return useQuery({
    queryKey: ['claim-review-history'],
    queryFn: async () => {
      const { data, error } = await sb.from('civic_claim_reviews').select('*, civic_documents(title)').order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useSeedNuruDemo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('seed-nuru-demo');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['civic-documents'] });
      qc.invalidateQueries({ queryKey: ['civic-questions'] });
      qc.invalidateQueries({ queryKey: ['governance-registry'] });
      qc.invalidateQueries({ queryKey: ['civic-analytics'] });
      qc.invalidateQueries({ queryKey: ['nuru-audit-log'] });
      toast.success('Demo data seeded successfully!');
    },
    onError: (e: any) => toast.error(e.message || 'Failed to seed demo data'),
  });
}

export function useAllCivicQuestions() {
  return useQuery({
    queryKey: ['all-civic-questions'],
    queryFn: async () => {
      const { data, error } = await sb.from('civic_questions').select('*, civic_documents(title, country)').order('created_at', { ascending: false }).limit(200);
      if (error) throw error;
      return data || [];
    },
  });
}

// ========== Admin Document Management ==========

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await sb.from('civic_documents').delete().eq('id', documentId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['civic-documents'] });
      qc.invalidateQueries({ queryKey: ['civic-questions'] });
      toast.success('Document deleted');
    },
    onError: (e: any) => toast.error(e.message || 'Delete failed'),
  });
}

export function useUpdateDocumentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ documentId, status }: { documentId: string; status: string }) => {
      const { error } = await sb.from('civic_documents').update({ status }).eq('id', documentId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['civic-documents'] });
      toast.success('Document status updated');
    },
    onError: (e: any) => toast.error(e.message || 'Update failed'),
  });
}

export function useDocumentQuestions(documentId: string) {
  return useQuery({
    queryKey: ['document-questions', documentId],
    queryFn: async () => {
      const { data, error } = await sb.from('civic_questions')
        .select('*, institutional_responses:institutional_responses(id, institution_name, response_text, status, created_at)')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!documentId,
  });
}
