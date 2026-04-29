-- Shareable conversations: public token + view tracking
ALTER TABLE public.nuru_conversations 
  ADD COLUMN IF NOT EXISTS share_token text UNIQUE,
  ADD COLUMN IF NOT EXISTS share_view_count integer DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_nuru_conversations_share_token 
  ON public.nuru_conversations(share_token) WHERE share_token IS NOT NULL;

-- Public read policy for shared conversations
DROP POLICY IF EXISTS "Public can view shared conversations" ON public.nuru_conversations;
CREATE POLICY "Public can view shared conversations"
  ON public.nuru_conversations
  FOR SELECT
  TO anon, authenticated
  USING (is_shared = true AND share_token IS NOT NULL);

-- Public read policy for messages in shared conversations
DROP POLICY IF EXISTS "Public can view messages in shared conversations" ON public.nuru_messages;
CREATE POLICY "Public can view messages in shared conversations"
  ON public.nuru_messages
  FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.nuru_conversations c
    WHERE c.id = nuru_messages.conversation_id
      AND c.is_shared = true
      AND c.share_token IS NOT NULL
  ));

-- Briefing digests: users subscribe to topic-based or document-based briefings
CREATE TABLE IF NOT EXISTS public.nuru_briefings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  topics text[] DEFAULT '{}',
  countries text[] DEFAULT '{}',
  document_ids uuid[] DEFAULT '{}',
  frequency text NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  is_active boolean DEFAULT true,
  last_generated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.nuru_briefing_digests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  briefing_id uuid REFERENCES public.nuru_briefings(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  summary text,
  key_findings jsonb DEFAULT '[]'::jsonb,
  source_documents jsonb DEFAULT '[]'::jsonb,
  generated_at timestamptz DEFAULT now(),
  read_at timestamptz
);

ALTER TABLE public.nuru_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nuru_briefing_digests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own briefings" ON public.nuru_briefings
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users view own digests" ON public.nuru_briefing_digests
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users update own digests" ON public.nuru_briefing_digests
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Storage bucket for user document uploads (private, per-user)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'nuru-user-docs',
  'nuru-user-docs',
  false,
  20971520,
  ARRAY['application/pdf', 'text/plain', 'text/markdown', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own docs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'nuru-user-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users read own docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'nuru-user-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own docs" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'nuru-user-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Trigger: auto-update updated_at on briefings
CREATE TRIGGER update_nuru_briefings_updated_at
  BEFORE UPDATE ON public.nuru_briefings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();