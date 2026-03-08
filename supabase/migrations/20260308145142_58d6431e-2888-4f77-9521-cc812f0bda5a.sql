
-- Fix remaining nuru_document_versions policies
DROP POLICY IF EXISTS "Authenticated can insert versions" ON public.nuru_document_versions;
CREATE POLICY "Authenticated can insert versions" ON public.nuru_document_versions FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can view versions" ON public.nuru_document_versions;
DROP POLICY IF EXISTS "Users can view versions" ON public.nuru_document_versions;
CREATE POLICY "Authenticated can view versions" ON public.nuru_document_versions FOR SELECT TO authenticated USING (true);
