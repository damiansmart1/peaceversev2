CREATE OR REPLACE FUNCTION public.update_poll_counts() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 UPDATE public.polls SET options=(SELECT jsonb_agg(
   (CASE WHEN jsonb_typeof(e)='string' THEN jsonb_build_object('text', e#>>'{}') ELSE e END)
   || jsonb_build_object('votes',COALESCE((e->>'votes')::integer,0)+CASE WHEN (ord-1)::integer=ANY(NEW.selected_options) THEN 1 ELSE 0 END)
   ORDER BY ord) FROM jsonb_array_elements(options) WITH ORDINALITY a(e,ord)),
  total_votes=COALESCE(total_votes,0)+cardinality(NEW.selected_options),
  total_participants=COALESCE(total_participants,0)+1, updated_at=now() WHERE id=NEW.poll_id;
 RETURN NEW;
END $$;

CREATE POLICY poll_option_images_upload ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id='poll-option-images' AND (storage.foldername(name))[1]=auth.uid()::text AND lower(storage.extension(name)) = ANY (ARRAY['jpg','jpeg','png','webp']));
CREATE POLICY poll_option_images_delete ON storage.objects FOR DELETE TO authenticated
USING (bucket_id='poll-option-images' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY poll_option_images_read ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id='poll-option-images' AND (
  (auth.uid() IS NOT NULL AND (storage.foldername(name))[1]=auth.uid()::text)
  OR EXISTS (SELECT 1 FROM public.polls p WHERE p.visibility IN ('public','unlisted')
     AND p.options @> jsonb_build_array(jsonb_build_object('image_path', objects.name)))));