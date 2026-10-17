CREATE TABLE public.about_people (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name text NOT NULL,
 role_title text NOT NULL DEFAULT '',
 category text NOT NULL DEFAULT 'team' CHECK (category IN ('founder','team','partner')),
 organization text NOT NULL DEFAULT '',
 bio text NOT NULL DEFAULT '',
 fun_intro text NOT NULL DEFAULT '',
 image_path text,
 website_url text NOT NULL DEFAULT '',
 linkedin_url text NOT NULL DEFAULT '',
 display_order integer NOT NULL DEFAULT 0,
 is_published boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.about_people TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.about_people TO authenticated;
GRANT ALL ON public.about_people TO service_role;
ALTER TABLE public.about_people ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published people are public" ON public.about_people FOR SELECT TO anon, authenticated USING (is_published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins create people" ON public.about_people FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update people" ON public.about_people FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete people" ON public.about_people FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "About portraits readable" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'about-portraits' AND (public.has_role(auth.uid(), 'admin') OR EXISTS (SELECT 1 FROM public.about_people p WHERE p.image_path = name AND p.is_published)));
CREATE POLICY "Admins upload about portraits" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'about-portraits' AND public.has_role(auth.uid(), 'admin') AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp'));
CREATE POLICY "Admins delete about portraits" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'about-portraits' AND public.has_role(auth.uid(), 'admin'));
ALTER PUBLICATION supabase_realtime ADD TABLE public.about_people;