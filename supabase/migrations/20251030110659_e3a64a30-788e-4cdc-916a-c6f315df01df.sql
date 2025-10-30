-- Add category field to content table
ALTER TABLE public.content
ADD COLUMN category text NOT NULL DEFAULT 'general';

-- Add a check constraint for valid categories
ALTER TABLE public.content
ADD CONSTRAINT content_category_check 
CHECK (category IN ('peace_stories', 'community', 'voice_stories', 'radio', 'general'));

-- Add index for better query performance
CREATE INDEX idx_content_category ON public.content(category);