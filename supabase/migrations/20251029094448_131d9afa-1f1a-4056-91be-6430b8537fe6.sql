-- Update RLS policies to allow anonymous participation

-- Drop existing policies for proposal_votes
DROP POLICY IF EXISTS "Authenticated users can vote" ON public.proposal_votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON public.proposal_votes;

-- Create new policies that allow anonymous votes
CREATE POLICY "Anyone can vote on proposals"
  ON public.proposal_votes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their votes"
  ON public.proposal_votes FOR UPDATE
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Drop existing policies for proposal_comments
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.proposal_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.proposal_comments;

-- Create new policies that allow anonymous comments
CREATE POLICY "Anyone can comment on proposals"
  ON public.proposal_comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their comments"
  ON public.proposal_comments FOR UPDATE
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Make user_id nullable in votes (if not already)
ALTER TABLE public.proposal_votes ALTER COLUMN user_id DROP NOT NULL;

-- Make user_id nullable in comments (if not already)
ALTER TABLE public.proposal_comments ALTER COLUMN user_id DROP NOT NULL;

-- Update unique constraint to allow multiple anonymous votes per proposal
ALTER TABLE public.proposal_votes DROP CONSTRAINT IF EXISTS proposal_votes_proposal_id_user_id_key;

-- Create a unique index that allows nulls
CREATE UNIQUE INDEX IF NOT EXISTS proposal_votes_user_proposal_unique 
  ON public.proposal_votes(proposal_id, user_id) 
  WHERE user_id IS NOT NULL;