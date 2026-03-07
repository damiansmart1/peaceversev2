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

// Fetch documents
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

// Fetch single document
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

// Fetch questions for a document
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

// Fetch institutional responses
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

// Upload a document
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
      }).select().single();
      if (error) throw error;
      // Trigger AI summarization
      await supabase.functions.invoke('nuru-ai-chat', { body: { action: 'summarize', documentId: data.id } });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['civic-documents'] });
      toast.success('Document uploaded and processing');
    },
    onError: (e: any) => toast.error(e.message || 'Upload failed'),
  });
}

// Ask a civic question
export function useAskQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ question, documentId, isAnonymous }: { question: string; documentId: string; isAnonymous?: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      // Get AI answer
      const { data: aiResult, error: aiError } = await supabase.functions.invoke('nuru-ai-chat', {
        body: { action: 'ask', question, documentId },
      });
      if (aiError) throw aiError;
      // Save question with answer
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

// Submit institutional response
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

// Review a claim
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

// Analytics
export function useCivicAnalytics() {
  return useQuery({
    queryKey: ['civic-analytics'],
    queryFn: async () => {
      const { data, error } = await sb.from('civic_analytics').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data || [];
    },
  });
}

// Governance registry
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
