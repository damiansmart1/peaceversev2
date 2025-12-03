-- Create standalone polls table
CREATE TABLE public.polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  poll_type TEXT NOT NULL DEFAULT 'single_choice', -- single_choice, multiple_choice, rating, yes_no
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb, -- max_selections, show_results_before_vote, require_comment, etc.
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  visibility TEXT DEFAULT 'public', -- public, private, unlisted
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE,
  total_votes INTEGER DEFAULT 0,
  total_participants INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create poll responses table
CREATE TABLE public.poll_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  selected_options INTEGER[] NOT NULL, -- array of option indices
  rating_value INTEGER, -- for rating type polls (1-5 or 1-10)
  comment TEXT, -- optional comment with vote
  is_anonymous BOOLEAN DEFAULT false,
  ip_hash TEXT, -- hashed IP for anonymous vote tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(poll_id, user_id) -- one vote per user per poll (for authenticated users)
);

-- Create poll analytics table for tracking engagement
CREATE TABLE public.poll_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- view, vote, share, comment
  user_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_analytics ENABLE ROW LEVEL SECURITY;

-- Polls policies
CREATE POLICY "Anyone can view public active polls"
ON public.polls FOR SELECT
USING (visibility = 'public' OR created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can create polls"
ON public.polls FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own polls"
ON public.polls FOR UPDATE
USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete own polls"
ON public.polls FOR DELETE
USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'::app_role));

-- Poll responses policies
CREATE POLICY "Users can view poll responses"
ON public.poll_responses FOR SELECT
USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.polls WHERE id = poll_id AND created_by = auth.uid()) OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Authenticated users can submit responses"
ON public.poll_responses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own responses"
ON public.poll_responses FOR UPDATE
USING (auth.uid() = user_id);

-- Poll analytics policies
CREATE POLICY "Admins and poll creators can view analytics"
ON public.poll_analytics FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.polls WHERE id = poll_id AND created_by = auth.uid()) OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Anyone can insert analytics"
ON public.poll_analytics FOR INSERT
WITH CHECK (true);

-- Function to increment poll vote counts
CREATE OR REPLACE FUNCTION public.update_poll_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.polls
  SET 
    total_votes = total_votes + array_length(NEW.selected_options, 1),
    total_participants = total_participants + 1,
    updated_at = now()
  WHERE id = NEW.poll_id;
  RETURN NEW;
END;
$$;

-- Trigger for updating poll counts
CREATE TRIGGER on_poll_response_insert
AFTER INSERT ON public.poll_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_poll_counts();

-- Enable realtime for polls
ALTER PUBLICATION supabase_realtime ADD TABLE public.polls;