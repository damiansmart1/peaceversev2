-- Add display_anonymous column to proposal_votes table
ALTER TABLE public.proposal_votes 
ADD COLUMN IF NOT EXISTS display_anonymous boolean NOT NULL DEFAULT false;