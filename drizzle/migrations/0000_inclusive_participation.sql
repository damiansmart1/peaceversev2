ALTER TABLE public.polls ADD COLUMN IF NOT EXISTS proposal_id uuid REFERENCES public.proposals(id) ON DELETE SET NULL;
CREATE TABLE public.participation_materials (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), proposal_id uuid REFERENCES public.proposals(id) ON DELETE CASCADE, poll_id uuid REFERENCES public.polls(id) ON DELETE CASCADE,
 created_by uuid NOT NULL, title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200), kind text NOT NULL CHECK (kind IN ('image','video','document','link')), storage_path text, url text, context text NOT NULL DEFAULT '' CHECK (char_length(context)<=2000), language text NOT NULL DEFAULT 'en' CHECK (char_length(language)<=10), created_at timestamptz NOT NULL DEFAULT now(),
 CHECK (num_nonnulls(proposal_id,poll_id)=1), CHECK (num_nonnulls(storage_path,url)=1), CHECK (url IS NULL OR (url ~ '^https://' AND char_length(url)<=2048)), CHECK(storage_path IS NULL OR storage_path LIKE created_by::text || '/%')
);
GRANT SELECT ON public.participation_materials TO anon;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.participation_materials TO authenticated;
GRANT ALL ON public.participation_materials TO service_role;
ALTER TABLE public.participation_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY materials_read ON public.participation_materials FOR SELECT USING (EXISTS(SELECT 1 FROM public.proposals p WHERE p.id=proposal_id) OR EXISTS(SELECT 1 FROM public.polls p WHERE p.id=poll_id));
CREATE POLICY materials_create ON public.participation_materials FOR INSERT TO authenticated WITH CHECK(created_by=auth.uid() AND (EXISTS(SELECT 1 FROM public.proposals p WHERE p.id=proposal_id AND p.creator_id=auth.uid()) OR EXISTS(SELECT 1 FROM public.polls p WHERE p.id=poll_id AND p.created_by=auth.uid())));
CREATE POLICY materials_delete ON public.participation_materials FOR DELETE TO authenticated USING(created_by=auth.uid());
CREATE POLICY participation_upload ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='participation-materials' AND (storage.foldername(name))[1]=auth.uid()::text AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp','mp4','webm','pdf','txt','docx'));
CREATE POLICY participation_read ON storage.objects FOR SELECT USING(bucket_id='participation-materials' AND ((storage.foldername(name))[1]=auth.uid()::text OR EXISTS(SELECT 1 FROM public.participation_materials m WHERE m.storage_path=name)));
CREATE POLICY participation_delete ON storage.objects FOR DELETE TO authenticated USING(bucket_id='participation-materials' AND (storage.foldername(name))[1]=auth.uid()::text);
DROP POLICY IF EXISTS "Anyone can view proposal votes" ON public.proposal_votes;
CREATE POLICY private_proposal_ballot ON public.proposal_votes FOR SELECT TO authenticated USING(user_id=auth.uid());
DROP POLICY IF EXISTS "Users can view poll responses" ON public.poll_responses;
CREATE POLICY private_poll_ballot ON public.poll_responses FOR SELECT TO authenticated USING(user_id=auth.uid());
DROP POLICY IF EXISTS "Users can update own responses" ON public.poll_responses;
CREATE OR REPLACE FUNCTION public.validate_participation_vote() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p record; n integer; idx integer;
BEGIN
 IF auth.uid() IS NULL OR NEW.user_id IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'Sign in to vote'; END IF;
 IF TG_TABLE_NAME='poll_responses' THEN
 SELECT * INTO p FROM public.polls WHERE id=NEW.poll_id FOR UPDATE;
 IF NOT FOUND OR NOT p.is_active OR p.starts_at>now() OR p.ends_at<=now() OR (p.visibility<>'public' AND p.created_by<>auth.uid()) THEN RAISE EXCEPTION 'Poll is closed or unavailable'; END IF;
 n:=cardinality(NEW.selected_options);
 IF n IS NULL OR n<1 OR n<>(SELECT count(DISTINCT x) FROM unnest(NEW.selected_options) x) THEN RAISE EXCEPTION 'Select valid, distinct options'; END IF;
 FOREACH idx IN ARRAY NEW.selected_options LOOP IF idx<0 OR idx>=jsonb_array_length(p.options) THEN RAISE EXCEPTION 'Option is unavailable'; END IF; END LOOP;
 IF p.poll_type<>'multiple_choice' AND n<>1 THEN RAISE EXCEPTION 'Select one option'; END IF;
 IF p.poll_type='multiple_choice' AND n>COALESCE((p.settings->>'max_selections')::integer,jsonb_array_length(p.options)) THEN RAISE EXCEPTION 'Too many options selected'; END IF;
 IF p.poll_type='rating' AND (NEW.rating_value IS NULL OR NEW.rating_value<>NEW.selected_options[1]+1) THEN RAISE EXCEPTION 'Invalid rating'; END IF;
 IF char_length(COALESCE(NEW.comment,''))>500 THEN RAISE EXCEPTION 'Comment exceeds 500 characters'; END IF;
 ELSE
 SELECT * INTO p FROM public.proposals WHERE id=NEW.proposal_id;
 IF NOT FOUND OR p.status NOT IN ('active','published','voting') OR p.ends_at<=now() OR (p.visibility<>'public' AND p.creator_id<>auth.uid()) THEN RAISE EXCEPTION 'Proposal voting is closed or unavailable'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER validate_poll_ballot BEFORE INSERT ON public.poll_responses FOR EACH ROW EXECUTE FUNCTION public.validate_participation_vote();
CREATE TRIGGER validate_proposal_ballot BEFORE INSERT OR UPDATE ON public.proposal_votes FOR EACH ROW EXECUTE FUNCTION public.validate_participation_vote();
CREATE OR REPLACE FUNCTION public.update_poll_counts() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 UPDATE public.polls SET options=(SELECT jsonb_agg(jsonb_build_object('text',CASE WHEN jsonb_typeof(e)='string' THEN e#>>'{}' ELSE e->>'text' END,'votes',COALESCE((e->>'votes')::integer,0)+CASE WHEN (ord-1)::integer=ANY(NEW.selected_options) THEN 1 ELSE 0 END) ORDER BY ord) FROM jsonb_array_elements(options) WITH ORDINALITY a(e,ord)),total_votes=COALESCE(total_votes,0)+cardinality(NEW.selected_options),total_participants=COALESCE(total_participants,0)+1,updated_at=now() WHERE id=NEW.poll_id;
 RETURN NEW;
END $$;
CREATE OR REPLACE FUNCTION public.refresh_proposal_totals() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE pid uuid:=COALESCE(NEW.proposal_id,OLD.proposal_id);
BEGIN
 UPDATE public.proposals SET votes_for=(SELECT count(*) FROM public.proposal_votes WHERE proposal_id=pid AND vote='for'),votes_against=(SELECT count(*) FROM public.proposal_votes WHERE proposal_id=pid AND vote='against'),votes_abstain=(SELECT count(*) FROM public.proposal_votes WHERE proposal_id=pid AND vote='abstain') WHERE id=pid;
 RETURN COALESCE(NEW,OLD);
END $$;
CREATE TRIGGER participation_proposal_totals AFTER INSERT OR UPDATE OR DELETE ON public.proposal_votes FOR EACH ROW EXECUTE FUNCTION public.refresh_proposal_totals();