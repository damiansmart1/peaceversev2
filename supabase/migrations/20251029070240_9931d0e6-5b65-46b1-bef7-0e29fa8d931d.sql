-- Enable RLS on achievements table if not already enabled
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for achievements table
CREATE POLICY "Achievements are viewable by everyone"
ON public.achievements FOR SELECT
USING (true);

CREATE POLICY "Admins can manage achievements"
ON public.achievements FOR ALL
USING (public.has_role(auth.uid(), 'admin'));