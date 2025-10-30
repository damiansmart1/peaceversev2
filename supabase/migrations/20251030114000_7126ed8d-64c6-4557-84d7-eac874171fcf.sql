-- Create sponsors table for managing carousel
CREATE TABLE public.sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text NOT NULL,
  website_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Sponsors are viewable by everyone"
  ON public.sponsors
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage sponsors"
  ON public.sponsors
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add index for ordering
CREATE INDEX idx_sponsors_display_order ON public.sponsors(display_order);

-- Add trigger for updated_at
CREATE TRIGGER update_sponsors_updated_at
  BEFORE UPDATE ON public.sponsors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();