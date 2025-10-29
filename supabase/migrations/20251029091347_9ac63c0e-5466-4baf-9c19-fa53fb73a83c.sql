-- Add admin policies for full content management

-- Admin policies for content table
CREATE POLICY "Admins can do everything with content"
ON public.content
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin policies for proposals table (already has delete for admin, adding more)
CREATE POLICY "Admins can insert any proposal"
ON public.proposals
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update any proposal"
ON public.proposals
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin policies for safe_spaces table
CREATE POLICY "Admins can do everything with safe spaces"
ON public.safe_spaces
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add archived status to content if not exists
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false;
ALTER TABLE public.safe_spaces ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false;