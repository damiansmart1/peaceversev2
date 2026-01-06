-- Create role_feature_access table for managing which features each role can access
CREATE TABLE public.role_feature_access (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    role app_role NOT NULL,
    feature_key TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (role, feature_key)
);

-- Enable RLS
ALTER TABLE public.role_feature_access ENABLE ROW LEVEL SECURITY;

-- Create policies for role_feature_access
-- Anyone can read feature access (needed to determine what to show)
CREATE POLICY "Anyone can view role feature access"
ON public.role_feature_access
FOR SELECT
USING (true);

-- Only admins can modify role feature access
CREATE POLICY "Admins can manage role feature access"
ON public.role_feature_access
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updating updated_at
CREATE TRIGGER update_role_feature_access_updated_at
BEFORE UPDATE ON public.role_feature_access
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default feature access for all roles (all features enabled by default)
INSERT INTO public.role_feature_access (role, feature_key, is_enabled)
SELECT r.role, f.feature_key, true
FROM (
    SELECT 'citizen'::app_role as role
    UNION SELECT 'verifier'::app_role
    UNION SELECT 'partner'::app_role
    UNION SELECT 'government'::app_role
    UNION SELECT 'admin'::app_role
) r
CROSS JOIN (
    SELECT 'incidents' as feature_key
    UNION SELECT 'community'
    UNION SELECT 'peace-pulse'
    UNION SELECT 'proposals'
    UNION SELECT 'safety'
    UNION SELECT 'radio'
    UNION SELECT 'challenges'
    UNION SELECT 'voice'
    UNION SELECT 'verification'
    UNION SELECT 'integrations'
    UNION SELECT 'early-warning'
) f;