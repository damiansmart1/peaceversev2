-- Create table to store which features each user can access
CREATE TABLE public.user_feature_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    feature_key TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    granted_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, feature_key)
);

-- Enable RLS
ALTER TABLE public.user_feature_access ENABLE ROW LEVEL SECURITY;

-- Users can view their own feature access
CREATE POLICY "Users can view own feature access"
ON public.user_feature_access
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can manage all feature access
CREATE POLICY "Admins can manage all feature access"
ON public.user_feature_access
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create index for faster lookups
CREATE INDEX idx_user_feature_access_user_id ON public.user_feature_access(user_id);
CREATE INDEX idx_user_feature_access_feature_key ON public.user_feature_access(feature_key);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_feature_access;