import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const sb = supabase as any;

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

// ========== Document Hooks ==========

export function useCivicDocuments(type?: string) {
  return useQuery({
    queryKey: ['civic-documents', type],
    queryFn: async () => {
      let query = sb.from('civic_documents').select('*').eq('status', 'ready').order('created_at', { ascending: false });
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
    mutationFn: async (doc: { title: string; description: string; document_type: string; original_text: string; country?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');
      const { data, error } = await sb.from('civic_documents').insert({
        ...doc,
        uploaded_by: user.id,
        status: 'processing',
        processing_status: 'pending',
      }).select().single();
      if (error) throw error;
      await supabase.functions.invoke('nuru-ai-chat', { body: { action: 'summarize', documentId: data.id } });
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
    mutationFn: async ({ file, title, description, documentType, country }: { file: File; title: string; description: string; documentType: string; country?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      // Create document record
      const { data: doc, error: docError } = await sb.from('civic_documents').insert({
        title,
        description,
        document_type: documentType,
        uploaded_by: user.id,
        status: 'processing',
        processing_status: 'uploading',
        file_type: file.type,
        file_size_bytes: file.size,
      }).select().single();
      if (docError) throw docError;

      // Upload file to storage
      const filePath = `${user.id}/${doc.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage.from('nuru-documents').upload(filePath, file);
      if (uploadError) {
        // Update status on failure
        await sb.from('civic_documents').update({ processing_status: 'upload_failed', processing_error: uploadError.message }).eq('id', doc.id);
        throw uploadError;
      }

      // Update document with file URL
      const { data: { publicUrl } } = supabase.storage.from('nuru-documents').getPublicUrl(filePath);
      await sb.from('civic_documents').update({ file_url: publicUrl, processing_status: 'uploaded' }).eq('id', doc.id);

      // For text-based files, read content directly
      if (file.type === 'text/plain' || file.type === 'text/csv') {
        const text = await file.text();
        await supabase.functions.invoke('nuru-ai-chat', {
          body: { action: 'parse_document', text, documentId: doc.id, fileName: file.name, fileType: file.type },
        });
      } else if (file.type === 'application/pdf') {
        // For PDF, extract text client-side using basic approach
        const text = await extractTextFromFile(file);
        if (text) {
          await supabase.functions.invoke('nuru-ai-chat', {
            body: { action: 'parse_document', text, documentId: doc.id, fileName: file.name, fileType: file.type },
          });
        } else {
          // If can't extract, use description as content
          await sb.from('civic_documents').update({ processing_status: 'text_extraction_failed', processing_error: 'Could not extract text from PDF. Please paste the text content manually.' }).eq('id', doc.id);
        }
      } else {
        // For Word docs etc., try text extraction
        const text = await extractTextFromFile(file);
        if (text) {
          await supabase.functions.invoke('nuru-ai-chat', {
            body: { action: 'parse_document', text, documentId: doc.id, fileName: file.name, fileType: file.type },
          });
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
    if (file.type === 'text/plain' || file.type === 'text/csv') {
      return await file.text();
    }
    // For PDF and other binary formats, try reading as text
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    // Basic text extraction from PDF - find text between parentheses in stream objects
    let text = '';
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const rawText = decoder.decode(uint8Array);
    
    // Extract readable text segments
    const segments = rawText.match(/\(([^)]{3,})\)/g);
    if (segments) {
      text = segments.map(s => s.slice(1, -1)).join(' ');
    }
    
    // Also try extracting from stream content
    const streamMatches = rawText.match(/BT[\s\S]*?ET/g);
    if (streamMatches) {
      for (const match of streamMatches) {
        const tjMatches = match.match(/\(([^)]+)\)\s*Tj/g);
        if (tjMatches) {
          text += ' ' + tjMatches.map(t => t.replace(/\)\s*Tj/, '').replace(/^\(/, '')).join(' ');
        }
      }
    }
    
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
      let query = sb.from('civic_questions').select('*').eq('is_public', true).order('created_at', { ascending: false }).limit(50);
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
      const { data, error } = await sb.from('nuru_conversations').select('*').order('last_message_at', { ascending: false }).limit(20);
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
    refetchInterval: 3000,
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

// ========== Review & Analytics Hooks ==========

export function useReviewClaim() {
  return useMutation({
    mutationFn: async ({ claimText, documentId }: { claimText: string; documentId?: string }) => {
      const { data, error } = await supabase.functions.invoke('nuru-ai-chat', {
        body: { action: 'review_claim', claimText, documentId },
      });
      if (error) throw error;
      return data;
    },
    onError: (e: any) => toast.error(e.message || 'Claim review failed'),
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
      const { data, error } = await sb.from('nuru_audit_log').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return (data || []) as NuruAuditEntry[];
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
