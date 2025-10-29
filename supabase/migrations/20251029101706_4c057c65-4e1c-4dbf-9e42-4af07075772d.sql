-- Add new fields to proposals table for bill proposer and parliamentary stage
ALTER TABLE public.proposals
ADD COLUMN IF NOT EXISTS bill_proposer_name TEXT,
ADD COLUMN IF NOT EXISTS parliamentary_stage TEXT DEFAULT 'first_reading';

-- Add comment for clarity
COMMENT ON COLUMN public.proposals.bill_proposer_name IS 'Name of the person/entity proposing the bill';
COMMENT ON COLUMN public.proposals.parliamentary_stage IS 'Current stage of the bill in parliament';