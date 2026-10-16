ALTER TABLE public.polls ADD COLUMN IF NOT EXISTS banner_path text;
DROP POLICY IF EXISTS poll_option_images_read ON storage.objects;
CREATE POLICY poll_option_images_read ON storage.objects FOR SELECT USING (
  bucket_id = 'poll-option-images' AND (
    (auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
    OR EXISTS (SELECT 1 FROM public.polls p WHERE p.visibility IN ('public','unlisted')
      AND (p.banner_path = objects.name OR p.options @> jsonb_build_array(jsonb_build_object('image_path', objects.name))))
  )
);