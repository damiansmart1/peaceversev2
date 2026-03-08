
-- Enhanced fact-checking schema for ClaimReview, multi-source, sharing, and batch support

-- Add new columns to civic_claim_reviews
ALTER TABLE public.civic_claim_reviews
  ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS confidence_score NUMERIC(3,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS verdict_label TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS claim_source TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS claim_source_url TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS source_documents JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS claimreview_schema JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS fact_check_details JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS recommendation TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS contradicting_evidence JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS batch_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS batch_index INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS processing_time_ms INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS shared_count INTEGER DEFAULT 0;

-- Index for share token lookups
CREATE INDEX IF NOT EXISTS idx_claim_reviews_share_token ON public.civic_claim_reviews(share_token) WHERE share_token IS NOT NULL;

-- Index for batch lookups
CREATE INDEX IF NOT EXISTS idx_claim_reviews_batch_id ON public.civic_claim_reviews(batch_id) WHERE batch_id IS NOT NULL;

-- Index for public claims
CREATE INDEX IF NOT EXISTS idx_claim_reviews_public ON public.civic_claim_reviews(is_public) WHERE is_public = true;

-- RLS: Allow public access to shared claims via share_token
CREATE POLICY "Public can view shared claims"
  ON public.civic_claim_reviews
  FOR SELECT
  TO anon
  USING (is_public = true);
