-- Allow authenticated users to delete documents
CREATE POLICY "civic_docs_delete" ON public.civic_documents
FOR DELETE TO authenticated
USING (true);

-- Allow selecting all civic questions (not just public) for admin views
DROP POLICY IF EXISTS "civic_q_select" ON public.civic_questions;
CREATE POLICY "civic_q_select" ON public.civic_questions
FOR SELECT USING (true);