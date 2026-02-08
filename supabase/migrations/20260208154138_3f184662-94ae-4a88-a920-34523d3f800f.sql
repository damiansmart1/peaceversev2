-- Add unique constraint on election_incident_categories.name for upsert support
ALTER TABLE public.election_incident_categories ADD CONSTRAINT election_incident_categories_name_key UNIQUE (name);

-- Make election_results.submitted_by nullable since demo data won't have real auth users
ALTER TABLE public.election_results ALTER COLUMN submitted_by DROP NOT NULL;

-- Drop the FK constraint on submitted_by so demo data can work without real auth users
ALTER TABLE public.election_results DROP CONSTRAINT IF EXISTS election_results_submitted_by_fkey;
