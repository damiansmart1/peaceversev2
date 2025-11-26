-- Create content table for user-generated content
CREATE TABLE IF NOT EXISTS public.content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 100 AND char_length(trim(title)) > 0),
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'audio', 'other')),
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'peace_stories', 'voice_stories', 'community', 'radio')),
  attachments JSONB DEFAULT '[]'::jsonb,
  view_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  share_count INTEGER NOT NULL DEFAULT 0,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_content_user_id ON public.content(user_id);
CREATE INDEX idx_content_category ON public.content(category);
CREATE INDEX idx_content_approval_status ON public.content(approval_status);
CREATE INDEX idx_content_created_at ON public.content(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view approved content or their own content
CREATE POLICY "Users can view approved content or own content"
  ON public.content
  FOR SELECT
  USING (
    approval_status = 'approved' 
    OR auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'verifier')
      AND is_active = true
    )
  );

-- Policy: Authenticated users can create content
CREATE POLICY "Authenticated users can create content"
  ON public.content
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own content
CREATE POLICY "Users can update own content"
  ON public.content
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own content
CREATE POLICY "Users can delete own content"
  ON public.content
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Admins can manage all content
CREATE POLICY "Admins can manage all content"
  ON public.content
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_updated_at_trigger
  BEFORE UPDATE ON public.content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_content_updated_at();