-- Create safe_spaces table for community safe locations
CREATE TABLE public.safe_spaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location_name TEXT NOT NULL,
  space_type TEXT NOT NULL DEFAULT 'community_center',
  latitude NUMERIC,
  longitude NUMERIC,
  verified BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.safe_spaces ENABLE ROW LEVEL SECURITY;

-- Anyone can view non-archived safe spaces
CREATE POLICY "Anyone can view active safe spaces"
ON public.safe_spaces
FOR SELECT
USING (is_archived = false);

-- Admins can view all safe spaces (including archived)
CREATE POLICY "Admins can view all safe spaces"
ON public.safe_spaces
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can create safe spaces
CREATE POLICY "Admins can create safe spaces"
ON public.safe_spaces
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update safe spaces
CREATE POLICY "Admins can update safe spaces"
ON public.safe_spaces
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete safe spaces
CREATE POLICY "Admins can delete safe spaces"
ON public.safe_spaces
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_safe_spaces_updated_at
BEFORE UPDATE ON public.safe_spaces
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();