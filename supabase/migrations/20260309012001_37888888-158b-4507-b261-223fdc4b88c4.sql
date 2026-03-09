-- =====================================================
-- ELECTION MONITORING CENTER - SECURITY HARDENING (v3)
-- Create missing functions and new tables
-- =====================================================

-- 1. Create has_any_role function if it doesn't exist
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- 2. Create is_election_stakeholder function
CREATE OR REPLACE FUNCTION public.is_election_stakeholder(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'government', 'verifier', 'partner')
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- 3. Create OCR tally sheets table
CREATE TABLE IF NOT EXISTS public.election_ocr_tally_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id uuid REFERENCES public.elections(id) ON DELETE CASCADE,
  polling_station_id uuid,
  image_url text NOT NULL,
  extracted_results jsonb DEFAULT '[]'::jsonb,
  total_votes integer,
  registered_voters integer,
  turnout_percent decimal(5,2),
  ocr_confidence decimal(5,2),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'verified', 'disputed', 'rejected')),
  anomalies text[] DEFAULT '{}',
  hash_digest text,
  uploaded_by uuid REFERENCES auth.users(id),
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.election_ocr_tally_sheets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Stakeholders can view tally sheets" ON public.election_ocr_tally_sheets;
DROP POLICY IF EXISTS "Authenticated can upload tally sheets" ON public.election_ocr_tally_sheets;
DROP POLICY IF EXISTS "Verifiers can update tally sheets" ON public.election_ocr_tally_sheets;

CREATE POLICY "Stakeholders can view tally sheets"
  ON public.election_ocr_tally_sheets FOR SELECT
  USING (public.is_election_stakeholder(auth.uid()) OR uploaded_by = auth.uid());

CREATE POLICY "Authenticated can upload tally sheets"
  ON public.election_ocr_tally_sheets FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND uploaded_by = auth.uid());

CREATE POLICY "Verifiers can update tally sheets"
  ON public.election_ocr_tally_sheets FOR UPDATE
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'verifier']::app_role[]));

-- 4. Create media evidence table
CREATE TABLE IF NOT EXISTS public.election_media_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id uuid REFERENCES public.elections(id) ON DELETE CASCADE,
  polling_station_id uuid,
  incident_id uuid REFERENCES public.election_incidents(id) ON DELETE SET NULL,
  filename text NOT NULL,
  file_type text CHECK (file_type IN ('image', 'video', 'audio', 'document')),
  file_size integer,
  file_url text NOT NULL,
  thumbnail_url text,
  hash_digest text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'flagged', 'rejected')),
  access_level text DEFAULT 'restricted' CHECK (access_level IN ('public', 'restricted', 'confidential')),
  gps_latitude decimal(10,8),
  gps_longitude decimal(11,8),
  captured_at timestamptz,
  device_info text,
  duration_seconds integer,
  uploaded_by uuid REFERENCES auth.users(id),
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.election_media_evidence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view public media" ON public.election_media_evidence;
DROP POLICY IF EXISTS "Authenticated can upload media" ON public.election_media_evidence;
DROP POLICY IF EXISTS "Stakeholders can update media" ON public.election_media_evidence;
DROP POLICY IF EXISTS "Only admins can delete media" ON public.election_media_evidence;

CREATE POLICY "Public can view public media"
  ON public.election_media_evidence FOR SELECT
  USING (
    access_level = 'public' 
    OR uploaded_by = auth.uid()
    OR public.is_election_stakeholder(auth.uid())
  );

CREATE POLICY "Authenticated can upload media"
  ON public.election_media_evidence FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND uploaded_by = auth.uid());

CREATE POLICY "Stakeholders can update media"
  ON public.election_media_evidence FOR UPDATE
  USING (
    uploaded_by = auth.uid() 
    OR public.is_election_stakeholder(auth.uid())
  );

CREATE POLICY "Only admins can delete media"
  ON public.election_media_evidence FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Create media access audit log
CREATE TABLE IF NOT EXISTS public.election_media_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid REFERENCES public.election_media_evidence(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  api_token_id uuid,
  action text NOT NULL CHECK (action IN ('view', 'download', 'verify', 'share')),
  ip_address inet,
  user_agent text,
  status text DEFAULT 'success' CHECK (status IN ('success', 'denied', 'error')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.election_media_access_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view media access logs" ON public.election_media_access_log;
DROP POLICY IF EXISTS "System can insert media access logs" ON public.election_media_access_log;

CREATE POLICY "Admins can view media access logs"
  ON public.election_media_access_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert media access logs"
  ON public.election_media_access_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 6. Add indexes
CREATE INDEX IF NOT EXISTS idx_ocr_tally_election ON public.election_ocr_tally_sheets(election_id);
CREATE INDEX IF NOT EXISTS idx_ocr_tally_status ON public.election_ocr_tally_sheets(status);
CREATE INDEX IF NOT EXISTS idx_media_evidence_election ON public.election_media_evidence(election_id);
CREATE INDEX IF NOT EXISTS idx_media_evidence_status ON public.election_media_evidence(status);
CREATE INDEX IF NOT EXISTS idx_media_access_log_media ON public.election_media_access_log(media_id);

-- 7. Add triggers
DROP TRIGGER IF EXISTS update_ocr_tally_updated_at ON public.election_ocr_tally_sheets;
CREATE TRIGGER update_ocr_tally_updated_at 
  BEFORE UPDATE ON public.election_ocr_tally_sheets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_evidence_updated_at ON public.election_media_evidence;
CREATE TRIGGER update_media_evidence_updated_at 
  BEFORE UPDATE ON public.election_media_evidence
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.election_ocr_tally_sheets IS 'OCR-processed tally sheet images with extracted vote counts';
COMMENT ON TABLE public.election_media_evidence IS 'Media evidence files from election monitoring';
COMMENT ON TABLE public.election_media_access_log IS 'Audit trail for media access and downloads';