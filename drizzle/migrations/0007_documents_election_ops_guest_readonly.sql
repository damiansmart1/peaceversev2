CREATE OR REPLACE FUNCTION public.is_election_observer(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.election_observers WHERE user_id = _uid AND coalesce(is_active, true))
$$;
CREATE OR REPLACE FUNCTION public.owns_observer(_observer_id uuid, _uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.election_observers WHERE id = _observer_id AND user_id = _uid)
$$;

-- Civic documents: uploader and admins
DROP POLICY IF EXISTS civic_docs_delete ON public.civic_documents;
CREATE POLICY civic_docs_delete ON public.civic_documents FOR DELETE TO authenticated USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS civic_docs_update ON public.civic_documents;
CREATE POLICY civic_docs_update ON public.civic_documents FOR UPDATE TO authenticated USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (uploaded_by = auth.uid() OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS civic_docs_insert ON public.civic_documents;
CREATE POLICY civic_docs_insert ON public.civic_documents FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());

-- Election operations: observers and admins
DROP POLICY IF EXISTS "Authenticated users can insert check-ins" ON public.observer_check_ins;
CREATE POLICY "Authenticated users can insert check-ins" ON public.observer_check_ins FOR INSERT TO authenticated WITH CHECK (public.owns_observer(observer_id, auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can view check-ins" ON public.observer_check_ins;
CREATE POLICY "Authenticated users can view check-ins" ON public.observer_check_ins FOR SELECT TO authenticated USING (public.owns_observer(observer_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Authenticated users can insert checklists" ON public.observation_checklists;
CREATE POLICY "Authenticated users can insert checklists" ON public.observation_checklists FOR INSERT TO authenticated WITH CHECK (public.owns_observer(observer_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Authenticated users can view checklists" ON public.observation_checklists;
CREATE POLICY "Authenticated users can view checklists" ON public.observation_checklists FOR SELECT TO authenticated USING (public.owns_observer(observer_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Authenticated users can manage deployment logs" ON public.observer_deployment_logs;
CREATE POLICY "Authenticated users can manage deployment logs" ON public.observer_deployment_logs FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Authenticated users can view deployment logs" ON public.observer_deployment_logs;
CREATE POLICY "Authenticated users can view deployment logs" ON public.observer_deployment_logs FOR SELECT TO authenticated USING (public.owns_observer(observer_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Authenticated users can insert OCR verifications" ON public.ocr_tally_verifications;
CREATE POLICY "Authenticated users can insert OCR verifications" ON public.ocr_tally_verifications FOR INSERT TO authenticated WITH CHECK (public.is_election_observer(auth.uid()) OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Authenticated users can update OCR verifications" ON public.ocr_tally_verifications;
CREATE POLICY "Authenticated users can update OCR verifications" ON public.ocr_tally_verifications FOR UPDATE TO authenticated USING (verified_by = auth.uid() OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Authenticated users can view OCR verifications" ON public.ocr_tally_verifications;
CREATE POLICY "Authenticated users can view OCR verifications" ON public.ocr_tally_verifications FOR SELECT TO authenticated USING (public.is_election_observer(auth.uid()) OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Authenticated users can insert pvt_samples" ON public.pvt_samples;
CREATE POLICY "Authenticated users can insert pvt_samples" ON public.pvt_samples FOR INSERT TO authenticated WITH CHECK ((public.is_election_observer(auth.uid()) AND submitted_by = auth.uid()) OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Authenticated users can view pvt_samples" ON public.pvt_samples;
CREATE POLICY "Authenticated users can view pvt_samples" ON public.pvt_samples FOR SELECT TO authenticated USING (public.is_election_observer(auth.uid()) OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Authenticated users can insert anomalies" ON public.election_anomalies;
CREATE POLICY "Authenticated users can insert anomalies" ON public.election_anomalies FOR INSERT TO authenticated WITH CHECK (public.is_election_observer(auth.uid()) OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Authenticated users can view anomalies" ON public.election_anomalies;
CREATE POLICY "Authenticated users can view anomalies" ON public.election_anomalies FOR SELECT TO authenticated USING (public.is_election_observer(auth.uid()) OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Authenticated users can insert blockchain anchors" ON public.election_blockchain_anchors;
CREATE POLICY "Authenticated users can insert blockchain anchors" ON public.election_blockchain_anchors FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Authenticated users can view blockchain anchors" ON public.election_blockchain_anchors;
CREATE POLICY "Authenticated users can view blockchain anchors" ON public.election_blockchain_anchors FOR SELECT TO authenticated USING (public.is_election_observer(auth.uid()) OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Authenticated users can manage escalation events" ON public.election_escalation_events;
CREATE POLICY "Authenticated users can manage escalation events" ON public.election_escalation_events FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Authenticated users can view escalation events" ON public.election_escalation_events;
CREATE POLICY "Authenticated users can view escalation events" ON public.election_escalation_events FOR SELECT TO authenticated USING (public.is_election_observer(auth.uid()) OR public.has_role(auth.uid(),'admin'));

-- Guests are read-only everywhere except election incident reporting
DO $$
DECLARE r record; op text;
BEGIN
  FOR r IN SELECT c.relname FROM pg_class c WHERE c.relnamespace = 'public'::regnamespace AND c.relkind = 'r' AND c.relrowsecurity AND c.relname NOT IN ('election_incidents','spatial_ref_sys') LOOP
    FOREACH op IN ARRAY ARRAY['INSERT','UPDATE','DELETE'] LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'guests_read_only_'||lower(op), r.relname);
      IF op = 'INSERT' THEN
        EXECUTE format('CREATE POLICY %I ON public.%I AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (coalesce((auth.jwt()->>''is_anonymous'')::boolean,false) = false)', 'guests_read_only_insert', r.relname);
      ELSE
        EXECUTE format('CREATE POLICY %I ON public.%I AS RESTRICTIVE FOR %s TO authenticated USING (coalesce((auth.jwt()->>''is_anonymous'')::boolean,false) = false)', 'guests_read_only_'||lower(op), r.relname, op);
      END IF;
    END LOOP;
  END LOOP;
END $$;