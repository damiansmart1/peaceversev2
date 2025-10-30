-- Add attachments field to content table for storing multiple files and links
ALTER TABLE public.content
ADD COLUMN attachments jsonb DEFAULT '[]'::jsonb;

-- Add index for better query performance on attachments
CREATE INDEX idx_content_attachments ON public.content USING GIN(attachments);