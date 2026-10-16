ALTER TABLE public.polls
  ADD COLUMN eligibility text NOT NULL DEFAULT 'everyone',
  ADD COLUMN eligible_domains text[] NOT NULL DEFAULT '{}',
  ADD COLUMN results_visibility text NOT NULL DEFAULT 'live',
  ADD COLUMN outcome_text text,
  ADD COLUMN outcome_published_at timestamptz;
ALTER TABLE public.polls ADD CONSTRAINT polls_eligibility_chk CHECK (eligibility IN ('everyone','domain','invite'));
ALTER TABLE public.polls ADD CONSTRAINT polls_results_visibility_chk CHECK (results_visibility IN ('live','after_vote','after_close'));
ALTER TABLE public.polls ADD CONSTRAINT polls_outcome_len_chk CHECK (outcome_text IS NULL OR char_length(outcome_text) <= 2000);

CREATE TABLE public.poll_invites (
  poll_id uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  email text NOT NULL CHECK (email = lower(email) AND char_length(email) <= 320),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (poll_id, email)
);
GRANT SELECT, INSERT, DELETE ON public.poll_invites TO authenticated;
GRANT ALL ON public.poll_invites TO service_role;
ALTER TABLE public.poll_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY poll_invites_manage ON public.poll_invites FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.polls p WHERE p.id = poll_id AND (p.created_by = auth.uid() OR public.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.polls p WHERE p.id = poll_id AND (p.created_by = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY poll_invites_self ON public.poll_invites FOR SELECT TO authenticated
  USING (email = lower(coalesce(auth.jwt()->>'email','')));

CREATE TABLE public.poll_tallies (
  poll_id uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_index integer NOT NULL,
  votes integer NOT NULL DEFAULT 0,
  PRIMARY KEY (poll_id, option_index)
);
GRANT ALL ON public.poll_tallies TO service_role;
ALTER TABLE public.poll_tallies ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.poll_voter_eligible(_poll_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE p.eligibility
    WHEN 'everyone' THEN true
    WHEN 'domain' THEN split_part(lower(coalesce(auth.jwt()->>'email','')),'@',2) = ANY (SELECT lower(ltrim(d,'@')) FROM unnest(p.eligible_domains) d)
    WHEN 'invite' THEN EXISTS (SELECT 1 FROM public.poll_invites i WHERE i.poll_id = p.id AND i.email = lower(coalesce(auth.jwt()->>'email','')))
    ELSE false END
   OR p.created_by = auth.uid()
  FROM public.polls p WHERE p.id = _poll_id
$$;
GRANT EXECUTE ON FUNCTION public.poll_voter_eligible(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.poll_results(_poll_id uuid) RETURNS integer[]
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE p record;
BEGIN
  SELECT * INTO p FROM public.polls WHERE id = _poll_id;
  IF NOT FOUND OR (p.visibility = 'private' AND p.created_by IS DISTINCT FROM auth.uid() AND NOT public.has_role(auth.uid(),'admin')) THEN RETURN NULL; END IF;
  IF p.results_visibility = 'after_close' AND (p.ends_at IS NULL OR p.ends_at > now()) AND p.is_active
     AND p.created_by IS DISTINCT FROM auth.uid() AND NOT public.has_role(auth.uid(),'admin') THEN RETURN NULL; END IF;
  RETURN ARRAY(SELECT coalesce(t.votes,0) FROM generate_series(0, jsonb_array_length(p.options)-1) g(i)
               LEFT JOIN public.poll_tallies t ON t.poll_id = p.id AND t.option_index = g.i ORDER BY g.i);
END $$;
GRANT EXECUTE ON FUNCTION public.poll_results(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.validate_participation_vote()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE p record; n integer; idx integer;
BEGIN
 IF auth.uid() IS NULL OR NEW.user_id IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'Sign in to vote'; END IF;
 IF TG_TABLE_NAME='poll_responses' THEN
 SELECT * INTO p FROM public.polls WHERE id=NEW.poll_id FOR UPDATE;
 IF NOT FOUND OR NOT p.is_active OR p.starts_at>now() OR p.ends_at<=now() OR (p.visibility<>'public' AND p.visibility<>'unlisted' AND p.created_by<>auth.uid()) THEN RAISE EXCEPTION 'Poll is closed or unavailable'; END IF;
 IF NOT public.poll_voter_eligible(p.id) THEN RAISE EXCEPTION 'This poll is limited to invited members'; END IF;
 n:=cardinality(NEW.selected_options);
 IF n IS NULL OR n<1 OR n<>(SELECT count(DISTINCT x) FROM unnest(NEW.selected_options) x) THEN RAISE EXCEPTION 'Select valid, distinct options'; END IF;
 FOREACH idx IN ARRAY NEW.selected_options LOOP IF idx<0 OR idx>=jsonb_array_length(p.options) THEN RAISE EXCEPTION 'Option is unavailable'; END IF; END LOOP;
 IF p.poll_type NOT IN ('multiple_choice','ranked') AND n<>1 THEN RAISE EXCEPTION 'Select one option'; END IF;
 IF p.poll_type IN ('multiple_choice','ranked') AND n>COALESCE((p.settings->>'max_selections')::integer,jsonb_array_length(p.options)) THEN RAISE EXCEPTION 'Too many options selected'; END IF;
 IF p.poll_type='rating' AND (NEW.rating_value IS NULL OR NEW.rating_value<>NEW.selected_options[1]+1) THEN RAISE EXCEPTION 'Invalid rating'; END IF;
 IF char_length(COALESCE(NEW.comment,''))>500 THEN RAISE EXCEPTION 'Comment exceeds 500 characters'; END IF;
 ELSE
 SELECT * INTO p FROM public.proposals WHERE id=NEW.proposal_id;
 IF NOT FOUND OR p.status NOT IN ('active','published','voting') OR p.ends_at<=now() OR (p.visibility<>'public' AND p.creator_id<>auth.uid()) THEN RAISE EXCEPTION 'Proposal voting is closed or unavailable'; END IF;
 END IF;
 RETURN NEW;
END $function$;

-- Ranked ballots score points (top rank = max_selections points). Hidden polls tally privately.
CREATE OR REPLACE FUNCTION public.update_poll_counts() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p record; k integer; pts integer; pos integer;
BEGIN
 SELECT * INTO p FROM public.polls WHERE id = NEW.poll_id;
 k := cardinality(NEW.selected_options);
 IF p.poll_type = 'ranked' THEN k := COALESCE((p.settings->>'max_selections')::integer, jsonb_array_length(p.options)); END IF;
 IF p.results_visibility = 'after_close' THEN
   FOR pos IN 1..cardinality(NEW.selected_options) LOOP
     pts := CASE WHEN p.poll_type='ranked' THEN GREATEST(k - pos + 1, 1) ELSE 1 END;
     INSERT INTO public.poll_tallies(poll_id, option_index, votes) VALUES (p.id, NEW.selected_options[pos], pts)
     ON CONFLICT (poll_id, option_index) DO UPDATE SET votes = poll_tallies.votes + EXCLUDED.votes;
   END LOOP;
   UPDATE public.polls SET total_votes=COALESCE(total_votes,0)+cardinality(NEW.selected_options), total_participants=COALESCE(total_participants,0)+1, updated_at=now() WHERE id=p.id;
 ELSE
   UPDATE public.polls SET options=(SELECT jsonb_agg(
     (CASE WHEN jsonb_typeof(e)='string' THEN jsonb_build_object('text', e#>>'{}') ELSE e END)
     || jsonb_build_object('votes', COALESCE((e->>'votes')::integer,0) + COALESCE((
          SELECT CASE WHEN p.poll_type='ranked' THEN GREATEST(k - s.o + 1, 1) ELSE 1 END
          FROM unnest(NEW.selected_options) WITH ORDINALITY s(v,o) WHERE s.v = (ord-1)::integer LIMIT 1),0))
     ORDER BY ord) FROM jsonb_array_elements(options) WITH ORDINALITY a(e,ord)),
    total_votes=COALESCE(total_votes,0)+cardinality(NEW.selected_options),
    total_participants=COALESCE(total_participants,0)+1, updated_at=now() WHERE id=p.id;
 END IF;
 RETURN NEW;
END $$;

-- Hidden polls must not leak counts through the public options column.
CREATE OR REPLACE FUNCTION public.guard_poll_hidden_counts() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.results_visibility = 'after_close' AND NEW.results_visibility <> 'after_close' AND OLD.total_participants > 0 THEN
    RAISE EXCEPTION 'Results privacy cannot be relaxed after voting starts';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER guard_poll_hidden_counts BEFORE UPDATE ON public.polls FOR EACH ROW EXECUTE FUNCTION public.guard_poll_hidden_counts();

CREATE OR REPLACE FUNCTION public.notify_poll_outcome() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.outcome_text IS NOT NULL AND NEW.outcome_text IS DISTINCT FROM OLD.outcome_text THEN
    NEW.outcome_published_at := now();
    INSERT INTO public.notifications(user_id, type, title, message, related_id, metadata)
    SELECT DISTINCT r.user_id, 'poll_outcome', 'Decision published: ' || left(NEW.title, 120), left(NEW.outcome_text, 500), NEW.id, jsonb_build_object('poll_id', NEW.id)
    FROM public.poll_responses r WHERE r.poll_id = NEW.id AND r.user_id IS NOT NULL;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER notify_poll_outcome BEFORE UPDATE OF outcome_text ON public.polls FOR EACH ROW EXECUTE FUNCTION public.notify_poll_outcome();