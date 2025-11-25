-- Create content storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content',
  'content',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']::text[];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view content files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload content files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update content files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete content files" ON storage.objects;

-- Create RLS policies for content bucket
CREATE POLICY "Anyone can view content files"
ON storage.objects FOR SELECT
USING (bucket_id = 'content');

CREATE POLICY "Admins can upload content files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'content' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update content files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'content' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete content files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'content' AND
  has_role(auth.uid(), 'admin'::app_role)
);