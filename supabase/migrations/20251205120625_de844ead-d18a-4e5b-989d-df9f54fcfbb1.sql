-- Add missing columns to proposals table
ALTER TABLE public.proposals 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS stage text DEFAULT 'first_reading';

-- Add comment for stage column
COMMENT ON COLUMN public.proposals.stage IS 'Parliamentary stage: first_reading, second_reading, committee, third_reading, passed, rejected';