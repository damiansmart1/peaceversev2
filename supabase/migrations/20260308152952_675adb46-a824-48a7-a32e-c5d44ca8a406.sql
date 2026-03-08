
-- Add document bookmarks table for users
CREATE TABLE IF NOT EXISTS public.document_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_id UUID NOT NULL REFERENCES public.civic_documents(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, document_id)
);

ALTER TABLE public.document_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bookmarks" ON public.document_bookmarks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add conversation sharing
ALTER TABLE public.nuru_conversations ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false;
ALTER TABLE public.nuru_conversations ADD COLUMN IF NOT EXISTS shared_at TIMESTAMP WITH TIME ZONE;

-- Fix ALL civic_documents RLS comprehensively
DROP POLICY IF EXISTS "Anyone can view ready documents" ON public.civic_documents;
DROP POLICY IF EXISTS "Public can view ready documents" ON public.civic_documents;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON public.civic_documents;
DROP POLICY IF EXISTS "Uploaders can update own documents" ON public.civic_documents;
DROP POLICY IF EXISTS "Anyone can view documents" ON public.civic_documents;

CREATE POLICY "civic_docs_select" ON public.civic_documents FOR SELECT USING (
  status = 'ready' 
  OR uploaded_by = auth.uid()
  OR uploaded_by IS NULL
);

CREATE POLICY "civic_docs_insert" ON public.civic_documents FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "civic_docs_update" ON public.civic_documents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Fix nuru_conversations RLS
DROP POLICY IF EXISTS "Users can view own conversations" ON public.nuru_conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.nuru_conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON public.nuru_conversations;

CREATE POLICY "nuru_conv_select" ON public.nuru_conversations FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_shared = true);
CREATE POLICY "nuru_conv_insert" ON public.nuru_conversations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "nuru_conv_update" ON public.nuru_conversations FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Fix nuru_messages RLS
DROP POLICY IF EXISTS "Users can view conversation messages" ON public.nuru_messages;
DROP POLICY IF EXISTS "Users can insert messages" ON public.nuru_messages;
DROP POLICY IF EXISTS "Service can insert messages" ON public.nuru_messages;

CREATE POLICY "nuru_msg_select" ON public.nuru_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "nuru_msg_insert" ON public.nuru_messages FOR INSERT TO authenticated WITH CHECK (true);

-- Fix nuru_audit_log RLS
DROP POLICY IF EXISTS "Service can insert audit logs" ON public.nuru_audit_log;
DROP POLICY IF EXISTS "Admins can view audit log" ON public.nuru_audit_log;

CREATE POLICY "nuru_audit_select" ON public.nuru_audit_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "nuru_audit_insert" ON public.nuru_audit_log FOR INSERT TO authenticated WITH CHECK (true);

-- Fix civic_questions RLS
DROP POLICY IF EXISTS "Authenticated can ask questions" ON public.civic_questions;
DROP POLICY IF EXISTS "Anyone can view public questions" ON public.civic_questions;

CREATE POLICY "civic_q_select" ON public.civic_questions FOR SELECT USING (is_public = true OR asked_by = auth.uid());
CREATE POLICY "civic_q_insert" ON public.civic_questions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "civic_q_update" ON public.civic_questions FOR UPDATE TO authenticated USING (true);

-- Fix civic_analytics RLS
DROP POLICY IF EXISTS "Authenticated can insert analytics" ON public.civic_analytics;
DROP POLICY IF EXISTS "Anyone can view analytics" ON public.civic_analytics;

CREATE POLICY "civic_analytics_select" ON public.civic_analytics FOR SELECT USING (true);
CREATE POLICY "civic_analytics_insert" ON public.civic_analytics FOR INSERT TO authenticated WITH CHECK (true);

-- Fix civic_claim_reviews RLS
DROP POLICY IF EXISTS "Anyone can view claim reviews" ON public.civic_claim_reviews;
DROP POLICY IF EXISTS "Authenticated can submit claim reviews" ON public.civic_claim_reviews;

CREATE POLICY "claim_reviews_select" ON public.civic_claim_reviews FOR SELECT USING (true);
CREATE POLICY "claim_reviews_insert" ON public.civic_claim_reviews FOR INSERT TO authenticated WITH CHECK (true);

-- Fix institutional_responses RLS
DROP POLICY IF EXISTS "Anyone can view published responses" ON public.institutional_responses;
DROP POLICY IF EXISTS "Authenticated can submit responses" ON public.institutional_responses;

CREATE POLICY "inst_resp_select" ON public.institutional_responses FOR SELECT USING (true);
CREATE POLICY "inst_resp_insert" ON public.institutional_responses FOR INSERT TO authenticated WITH CHECK (true);

-- Fix ai_governance_registry RLS
DROP POLICY IF EXISTS "Anyone can view governance registry" ON public.ai_governance_registry;

CREATE POLICY "governance_select" ON public.ai_governance_registry FOR SELECT USING (true);
CREATE POLICY "governance_insert" ON public.ai_governance_registry FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "governance_upsert" ON public.ai_governance_registry FOR UPDATE TO authenticated USING (true);

-- Fix nuru_document_versions RLS
DROP POLICY IF EXISTS "Document uploaders can view versions" ON public.nuru_document_versions;
DROP POLICY IF EXISTS "Service can insert versions" ON public.nuru_document_versions;

CREATE POLICY "doc_versions_select" ON public.nuru_document_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "doc_versions_insert" ON public.nuru_document_versions FOR INSERT TO authenticated WITH CHECK (true);
