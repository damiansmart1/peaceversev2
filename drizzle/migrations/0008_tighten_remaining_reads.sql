DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.content c WHERE c.id = comments.content_id));

DROP POLICY IF EXISTS "Anyone can view follows" ON public.user_follows;
CREATE POLICY "Anyone can view follows" ON public.user_follows FOR SELECT TO authenticated USING (follower_id = auth.uid() OR following_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Anyone can view chatroom members" ON public.chatroom_members;
CREATE POLICY "Anyone can view chatroom members" ON public.chatroom_members FOR SELECT TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.chatrooms r WHERE r.id = chatroom_members.chatroom_id));

DROP POLICY IF EXISTS "Audit log is public" ON public.proposal_audit_log;
CREATE POLICY "Audit log is public" ON public.proposal_audit_log FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "participation_read" ON storage.objects;
CREATE POLICY "participation_read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'participation-materials' AND ((storage.foldername(name))[1] = auth.uid()::text OR EXISTS (SELECT 1 FROM public.participation_materials m WHERE m.storage_path = objects.name)));

DROP POLICY IF EXISTS "Authenticated users can view nuru documents" ON storage.objects;
CREATE POLICY "Authenticated users can view nuru documents" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'nuru-documents' AND ((storage.foldername(name))[1] = auth.uid()::text OR ((storage.foldername(name))[1] = 'constitutions' AND (storage.foldername(name))[2] = auth.uid()::text) OR public.has_role(auth.uid(),'admin')));

DROP POLICY IF EXISTS "Authenticated users can view response teams" ON public.response_teams;
CREATE POLICY "Authenticated users can view response teams" ON public.response_teams FOR SELECT TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['admin','government','partner','verifier']::app_role[]));
DROP POLICY IF EXISTS "Authenticated users can view deployments" ON public.response_deployments;
CREATE POLICY "Authenticated users can view deployments" ON public.response_deployments FOR SELECT TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['admin','government','partner','verifier']::app_role[]));
DROP POLICY IF EXISTS "Authenticated users can view scenarios" ON public.scenario_models;
CREATE POLICY "Authenticated users can view scenarios" ON public.scenario_models FOR SELECT TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['admin','government','partner','verifier']::app_role[]));