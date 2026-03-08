
-- Country Constitutions table for constitutional cross-referencing
CREATE TABLE public.country_constitutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_name text NOT NULL,
  country_code text,
  constitution_title text NOT NULL,
  original_text text NOT NULL,
  summary text,
  ai_summary jsonb,
  language text DEFAULT 'en',
  effective_date text,
  amendment_date text,
  source_url text,
  file_url text,
  file_type text,
  file_size_bytes integer,
  key_provisions jsonb,
  fundamental_rights jsonb,
  governance_structure jsonb,
  processing_status text DEFAULT 'pending',
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(country_name)
);

-- Enable RLS
ALTER TABLE public.country_constitutions ENABLE ROW LEVEL SECURITY;

-- Everyone can read active constitutions
CREATE POLICY "Anyone can view active constitutions"
  ON public.country_constitutions FOR SELECT
  USING (is_active = true);

-- Only admins can manage constitutions
CREATE POLICY "Admins can manage constitutions"
  ON public.country_constitutions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_constitutions_country ON public.country_constitutions(country_name);
CREATE INDEX idx_constitutions_country_code ON public.country_constitutions(country_code);

-- Updated_at trigger
CREATE TRIGGER update_country_constitutions_updated_at 
  BEFORE UPDATE ON public.country_constitutions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
