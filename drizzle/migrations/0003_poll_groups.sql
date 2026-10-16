ALTER TABLE public.polls ADD COLUMN group_id uuid, ADD COLUMN group_title text, ADD COLUMN group_order integer NOT NULL DEFAULT 0;
CREATE INDEX polls_group_id_idx ON public.polls(group_id);