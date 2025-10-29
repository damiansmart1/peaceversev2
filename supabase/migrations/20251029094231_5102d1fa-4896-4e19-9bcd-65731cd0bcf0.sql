-- Create polls table for proposals
CREATE TABLE IF NOT EXISTS public.proposal_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  allow_multiple BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE
);

-- Create poll responses table
CREATE TABLE IF NOT EXISTS public.proposal_poll_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.proposal_polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  option_index INTEGER NOT NULL,
  display_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(poll_id, user_id, option_index)
);

-- Enable RLS
ALTER TABLE public.proposal_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_poll_responses ENABLE ROW LEVEL SECURITY;

-- RLS policies for polls
CREATE POLICY "Polls are viewable by everyone"
  ON public.proposal_polls FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create polls"
  ON public.proposal_polls FOR INSERT
  WITH CHECK (auth.uid() = created_by OR auth.uid() IS NOT NULL);

CREATE POLICY "Creators can update polls"
  ON public.proposal_polls FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all polls"
  ON public.proposal_polls FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS policies for poll responses
CREATE POLICY "Poll responses are viewable by everyone"
  ON public.proposal_poll_responses FOR SELECT
  USING (true);

CREATE POLICY "Anyone can submit poll responses"
  ON public.proposal_poll_responses FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can update their own responses"
  ON public.proposal_poll_responses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own responses"
  ON public.proposal_poll_responses FOR DELETE
  USING (auth.uid() = user_id);