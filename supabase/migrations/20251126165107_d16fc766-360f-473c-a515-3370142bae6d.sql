-- Add missing thumbnail_url column to content table
ALTER TABLE public.content 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

COMMENT ON COLUMN public.content.thumbnail_url IS 'URL to thumbnail image for video/audio content';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_category ON public.content(category);
CREATE INDEX IF NOT EXISTS idx_content_approval_status ON public.content(approval_status);
CREATE INDEX IF NOT EXISTS idx_content_user_id ON public.content(user_id);