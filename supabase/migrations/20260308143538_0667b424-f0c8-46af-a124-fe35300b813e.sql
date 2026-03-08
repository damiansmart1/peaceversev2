
-- NuruAI Audit Trail & Enhanced Schema

-- 1. Conversation threads for multi-turn Q&A
CREATE TABLE public.nuru_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  document_id UUID REFERENCES public.civic_documents(id) ON DELETE SET NULL,
  title TEXT,
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.nuru_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.nuru_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  sources JSONB DEFAULT '[]'::jsonb,
  confidence NUMERIC(3,2),
  model_used TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Audit trail for all NuruAI actions
CREATE TABLE public.nuru_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Document versions for integrity tracking
CREATE TABLE public.nuru_document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.civic_documents(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  original_text TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size_bytes BIGINT,
  checksum TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Add file support columns to civic_documents
ALTER TABLE public.civic_documents 
  ADD COLUMN IF NOT EXISTS file_type TEXT,
  ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT,
  ADD COLUMN IF NOT EXISTS file_checksum TEXT,
  ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS processing_error TEXT,
  ADD COLUMN IF NOT EXISTS version_count INTEGER DEFAULT 1;

-- 5. Enable RLS
ALTER TABLE public.nuru_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nuru_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nuru_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nuru_document_versions ENABLE ROW LEVEL SECURITY;

-- Conversations: users see their own, admins see all
CREATE POLICY "Users can view own conversations" ON public.nuru_conversations
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create conversations" ON public.nuru_conversations
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own conversations" ON public.nuru_conversations
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Messages: accessible through conversation ownership
CREATE POLICY "Users can view messages in own conversations" ON public.nuru_messages
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.nuru_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())
  );
CREATE POLICY "Users can insert messages in own conversations" ON public.nuru_messages
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.nuru_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())
  );

-- Audit log: admins only for read, system writes via service role
CREATE POLICY "Admins can view audit logs" ON public.nuru_audit_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Document versions: public read
CREATE POLICY "Anyone can view document versions" ON public.nuru_document_versions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert versions" ON public.nuru_document_versions
  FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());

-- 6. Create storage bucket for document uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('nuru-documents', 'nuru-documents', false, 52428800, 
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload nuru documents" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'nuru-documents');
CREATE POLICY "Authenticated users can view nuru documents" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'nuru-documents');

-- 7. Enable realtime for conversations
ALTER PUBLICATION supabase_realtime ADD TABLE public.nuru_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.nuru_messages;

-- 8. Index for performance
CREATE INDEX IF NOT EXISTS idx_nuru_messages_conversation ON public.nuru_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_nuru_audit_action ON public.nuru_audit_log(action, created_at);
CREATE INDEX IF NOT EXISTS idx_nuru_conversations_user ON public.nuru_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_civic_documents_status ON public.civic_documents(status);
