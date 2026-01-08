-- Create cms_content table for managing all editable content
CREATE TABLE public.cms_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'image', 'audio', 'video', 'document', 'html')),
  section TEXT NOT NULL,
  title TEXT,
  content TEXT,
  media_url TEXT,
  media_alt TEXT,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;

-- Everyone can read active content
CREATE POLICY "Anyone can read active cms content"
ON public.cms_content
FOR SELECT
USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage all cms content"
ON public.cms_content
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_cms_content_updated_at
BEFORE UPDATE ON public.cms_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for CMS media
INSERT INTO storage.buckets (id, name, public) VALUES ('cms-media', 'cms-media', true);

-- Storage policies for CMS media
CREATE POLICY "Anyone can view CMS media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'cms-media');

CREATE POLICY "Admins can upload CMS media"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'cms-media' AND
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update CMS media"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'cms-media' AND
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete CMS media"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'cms-media' AND
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Insert default content for Homepage
INSERT INTO public.cms_content (content_key, content_type, section, title, content, metadata) VALUES
-- Hero Section
('hero_title', 'text', 'homepage', 'Hero Title', 'Building Peace Across Africa', '{"translatable": true}'),
('hero_subtitle', 'text', 'homepage', 'Hero Subtitle', 'Join millions of citizens in creating safer communities through collaborative incident reporting, verification, and peacebuilding initiatives.', '{"translatable": true}'),
('hero_image', 'image', 'homepage', 'Hero Background', NULL, '{"aspect_ratio": "16:9"}'),
('hero_cta_primary', 'text', 'homepage', 'Primary CTA', 'Report an Incident', '{}'),
('hero_cta_secondary', 'text', 'homepage', 'Secondary CTA', 'Learn More', '{}'),

-- Features Section
('features_title', 'text', 'homepage', 'Features Title', 'Platform Features', '{}'),
('features_subtitle', 'text', 'homepage', 'Features Subtitle', 'Comprehensive tools for community safety and peacebuilding', '{}'),

-- About Section
('about_mission', 'html', 'about', 'Mission Statement', 'PeaceVerse is dedicated to building peaceful communities across Africa through technology-enabled citizen engagement and collaborative conflict prevention.', '{}'),
('about_vision', 'html', 'about', 'Vision Statement', 'A peaceful Africa where every citizen has the tools and support to contribute to community safety.', '{}'),

-- Team Section
('team_title', 'text', 'about', 'Team Section Title', 'Our Team', '{}'),
('team_subtitle', 'text', 'about', 'Team Section Subtitle', 'Dedicated professionals working for peace', '{}'),

-- Section Banners
('incidents_banner_title', 'text', 'banners', 'Incidents Banner Title', 'Incident Reporting', '{}'),
('incidents_banner_subtitle', 'text', 'banners', 'Incidents Banner Subtitle', 'Report and track incidents in your community', '{}'),
('proposals_banner_title', 'text', 'banners', 'Proposals Banner Title', 'Community Proposals', '{}'),
('proposals_banner_subtitle', 'text', 'banners', 'Proposals Banner Subtitle', 'Shape policies that affect your community', '{}'),
('safety_banner_title', 'text', 'banners', 'Safety Banner Title', 'Safety & Protection', '{}'),
('safety_banner_subtitle', 'text', 'banners', 'Safety Banner Subtitle', 'Resources for community safety', '{}'),
('community_banner_title', 'text', 'banners', 'Community Banner Title', 'Community Hub', '{}'),
('community_banner_subtitle', 'text', 'banners', 'Community Banner Subtitle', 'Connect with your community', '{}'),
('radio_banner_title', 'text', 'banners', 'Radio Banner Title', 'Peace Radio', '{}'),
('radio_banner_subtitle', 'text', 'banners', 'Radio Banner Subtitle', 'Listen to peace programming', '{}');

-- Create index for faster lookups
CREATE INDEX idx_cms_content_key ON public.cms_content(content_key);
CREATE INDEX idx_cms_content_section ON public.cms_content(section);