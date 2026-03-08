
-- Fix civic_documents: allow users to see their own documents regardless of status
DROP POLICY IF EXISTS "Anyone can view ready documents" ON public.civic_documents;
CREATE POLICY "Anyone can view ready documents" ON public.civic_documents FOR SELECT USING (
  status = 'ready' OR auth.uid() = uploaded_by
);

-- Fix INSERT policy to be less restrictive (allow setting uploaded_by to own id)
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON public.civic_documents;
CREATE POLICY "Authenticated users can upload documents" ON public.civic_documents FOR INSERT TO authenticated WITH CHECK (
  uploaded_by = auth.uid()
);

-- Fix UPDATE policy to use WITH CHECK properly
DROP POLICY IF EXISTS "Uploaders can update own documents" ON public.civic_documents;
CREATE POLICY "Uploaders can update own documents" ON public.civic_documents FOR UPDATE TO authenticated USING (auth.uid() = uploaded_by) WITH CHECK (auth.uid() = uploaded_by);

-- Also allow service role full access for seeding (service role bypasses RLS, but ensure policies don't block)
-- Allow authenticated users to also view all ready documents from others
DROP POLICY IF EXISTS "Public can view ready documents" ON public.civic_documents;
CREATE POLICY "Public can view ready documents" ON public.civic_documents FOR SELECT TO anon USING (status = 'ready');

-- Fix nuru_audit_log: allow service role inserts (for edge functions)
DROP POLICY IF EXISTS "Service can insert audit logs" ON public.nuru_audit_log;
CREATE POLICY "Service can insert audit logs" ON public.nuru_audit_log FOR INSERT TO authenticated WITH CHECK (true);

-- Fix civic_questions INSERT for edge functions
DROP POLICY IF EXISTS "Authenticated can ask questions" ON public.civic_questions;
CREATE POLICY "Authenticated can ask questions" ON public.civic_questions FOR INSERT TO authenticated WITH CHECK (true);

-- Fix civic_analytics INSERT
DROP POLICY IF EXISTS "Authenticated can insert analytics" ON public.civic_analytics;
CREATE POLICY "Authenticated can insert analytics" ON public.civic_analytics FOR INSERT TO authenticated WITH CHECK (true);
