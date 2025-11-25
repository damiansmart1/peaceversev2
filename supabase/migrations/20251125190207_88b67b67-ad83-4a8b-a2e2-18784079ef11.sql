-- Create sponsors table with comprehensive fields for display control
CREATE TABLE IF NOT EXISTS sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  pages TEXT[] DEFAULT ARRAY['home']::TEXT[],
  rotation_duration INTEGER DEFAULT 3000,
  display_frequency TEXT DEFAULT 'always' CHECK (display_frequency IN ('always', 'high', 'medium', 'low')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view active sponsors
CREATE POLICY "Anyone can view active sponsors"
  ON sponsors FOR SELECT
  USING (is_active = true);

-- Allow admins to manage sponsors
CREATE POLICY "Admins can manage sponsors"
  ON sponsors FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_sponsors_updated_at
  BEFORE UPDATE ON sponsors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE sponsors IS 'Partners and sponsors with display preferences';
COMMENT ON COLUMN sponsors.pages IS 'Array of page routes where sponsor should appear (e.g., home, about, incidents)';
COMMENT ON COLUMN sponsors.rotation_duration IS 'Duration in milliseconds for carousel rotation';
COMMENT ON COLUMN sponsors.display_frequency IS 'How often sponsor appears: always, high (75%), medium (50%), low (25%)';