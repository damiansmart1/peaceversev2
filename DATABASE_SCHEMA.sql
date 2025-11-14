-- =====================================================
-- PEACEVERSE VERIFICATION ARCHITECTURE - FOUNDATION
-- Phase 1: Core Security, RBAC, and Base Entities
-- =====================================================
-- 
-- INSTRUCTIONS TO APPLY:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Create a new query
-- 4. Copy and paste this entire SQL file
-- 5. Execute the query
-- =====================================================

-- =====================================================
-- 1. ROLE-BASED ACCESS CONTROL (RBAC)
-- =====================================================

-- Create app role enum (expandable for future roles)
CREATE TYPE public.app_role AS ENUM (
  'citizen',      -- Regular users who report and participate
  'verifier',     -- Trusted community members who verify reports
  'partner',      -- NGO/Organization partners (Nuru Trust Network)
  'government',   -- Government officials with special access
  'admin',        -- Platform administrators
  'moderator'     -- Content moderators
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_by uuid REFERENCES auth.users(id),
  assigned_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Function to check if user has any of multiple roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 2. ENHANCED USER PROFILES
-- =====================================================

-- Extend the profiles table with verification fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_level integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reputation_score integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contribution_count integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_count integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trust_score decimal(5,2) DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country_code text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'en';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS accessibility_settings jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_at timestamptz DEFAULT now();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_reputation ON public.profiles(reputation_score DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_trust_score ON public.profiles(trust_score DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_region ON public.profiles(region);

-- =====================================================
-- 3. CITIZEN REPORTS / STORIES
-- =====================================================

CREATE TYPE public.report_type AS ENUM (
  'incident',
  'story',
  'concern',
  'suggestion',
  'emergency',
  'violation'
);

CREATE TYPE public.report_status AS ENUM (
  'draft',
  'submitted',
  'pending_verification',
  'under_review',
  'verified',
  'escalated',
  'resolved',
  'rejected',
  'archived'
);

CREATE TYPE public.risk_level AS ENUM (
  'low',
  'medium',
  'high',
  'critical',
  'emergency'
);

CREATE TABLE public.citizen_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  report_type report_type NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  location_name text,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  region text,
  country_code text,
  risk_level risk_level DEFAULT 'low',
  status report_status DEFAULT 'submitted',
  is_anonymous boolean DEFAULT false,
  sentiment_score decimal(5,2),
  credibility_score decimal(5,2),
  urgency_score decimal(5,2),
  ai_analysis jsonb,
  media_urls text[],
  tags text[],
  affected_population integer,
  verified_at timestamptz,
  verified_by uuid REFERENCES auth.users(id),
  escalated_at timestamptz,
  resolved_at timestamptz,
  view_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.citizen_reports ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view verified reports"
  ON public.citizen_reports FOR SELECT
  USING (status IN ('verified', 'resolved') OR reporter_id = auth.uid());

CREATE POLICY "Authenticated users can create reports"
  ON public.citizen_reports FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own reports"
  ON public.citizen_reports FOR UPDATE
  USING (reporter_id = auth.uid() AND status = 'draft');

CREATE POLICY "Verifiers and admins can update reports"
  ON public.citizen_reports FOR UPDATE
  USING (public.has_any_role(auth.uid(), ARRAY['verifier', 'admin', 'moderator']::app_role[]));

-- Indexes
CREATE INDEX idx_reports_status ON public.citizen_reports(status);
CREATE INDEX idx_reports_risk_level ON public.citizen_reports(risk_level);
CREATE INDEX idx_reports_location ON public.citizen_reports(latitude, longitude);
CREATE INDEX idx_reports_created ON public.citizen_reports(created_at DESC);
CREATE INDEX idx_reports_region ON public.citizen_reports(region);

-- =====================================================
-- 4. VERIFICATION TASKS
-- =====================================================

CREATE TYPE public.verification_task_status AS ENUM (
  'pending',
  'assigned',
  'in_progress',
  'needs_evidence',
  'completed',
  'escalated',
  'rejected'
);

CREATE TABLE public.verification_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES public.citizen_reports(id) ON DELETE CASCADE NOT NULL,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status verification_task_status DEFAULT 'pending',
  priority integer DEFAULT 5,
  confidence_score decimal(5,2),
  verification_notes text,
  evidence_requested jsonb,
  evidence_provided jsonb,
  reviewer_consensus jsonb,
  time_spent_minutes integer DEFAULT 0,
  assigned_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  deadline timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.verification_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verifiers can view their tasks"
  ON public.verification_tasks FOR SELECT
  USING (
    assigned_to = auth.uid() OR 
    public.has_any_role(auth.uid(), ARRAY['admin', 'moderator']::app_role[])
  );

CREATE POLICY "Verifiers can update their tasks"
  ON public.verification_tasks FOR UPDATE
  USING (
    assigned_to = auth.uid() OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE INDEX idx_verification_status ON public.verification_tasks(status);
CREATE INDEX idx_verification_priority ON public.verification_tasks(priority DESC);
CREATE INDEX idx_verification_assigned ON public.verification_tasks(assigned_to);

-- =====================================================
-- 5. AI ANALYSIS LOGS
-- =====================================================

CREATE TYPE public.ai_analysis_type AS ENUM (
  'sentiment',
  'threat_detection',
  'credibility',
  'entity_extraction',
  'tone_classification',
  'anomaly_detection'
);

CREATE TABLE public.ai_analysis_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES public.citizen_reports(id) ON DELETE CASCADE,
  analysis_type ai_analysis_type NOT NULL,
  model_version text,
  input_data jsonb,
  output_data jsonb NOT NULL,
  confidence decimal(5,2),
  processing_time_ms integer,
  detected_entities jsonb,
  sentiment_breakdown jsonb,
  risk_indicators jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_analysis_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view AI logs"
  ON public.ai_analysis_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_ai_logs_report ON public.ai_analysis_logs(report_id);
CREATE INDEX idx_ai_logs_type ON public.ai_analysis_logs(analysis_type);

-- =====================================================
-- 6. AUDIT LOGS (Tamper-proof tracking)
-- =====================================================

CREATE TYPE public.audit_action AS ENUM (
  'create',
  'update',
  'delete',
  'verify',
  'escalate',
  'resolve',
  'assign',
  'login',
  'role_change',
  'export'
);

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  changes jsonb,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Immutable audit logs (no updates or deletes allowed)
CREATE POLICY "No one can update audit logs"
  ON public.audit_logs FOR UPDATE
  USING (false);

CREATE POLICY "No one can delete audit logs"
  ON public.audit_logs FOR DELETE
  USING (false);

CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- =====================================================
-- 7. ESCALATION RULES
-- =====================================================

CREATE TABLE public.escalation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  conditions jsonb NOT NULL,
  actions jsonb NOT NULL,
  priority integer DEFAULT 5,
  is_active boolean DEFAULT true,
  trigger_count integer DEFAULT 0,
  last_triggered_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.escalation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage escalation rules"
  ON public.escalation_rules FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 8. PARTNER ORGANIZATIONS (Nuru Trust Network)
-- =====================================================

CREATE TYPE public.partner_status AS ENUM (
  'pending',
  'active',
  'suspended',
  'inactive'
);

CREATE TABLE public.partner_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  organization_type text,
  description text,
  contact_email text,
  contact_phone text,
  website text,
  country_code text,
  regions_covered text[],
  verification_capabilities text[],
  trust_score decimal(5,2) DEFAULT 0.00,
  verification_count integer DEFAULT 0,
  status partner_status DEFAULT 'pending',
  logo_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.partner_organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active partners"
  ON public.partner_organizations FOR SELECT
  USING (status = 'active' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage partners"
  ON public.partner_organizations FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 9. NOTIFICATION SYSTEM
-- =====================================================

CREATE TYPE public.notification_type AS ENUM (
  'report_verified',
  'task_assigned',
  'escalation_alert',
  'badge_earned',
  'level_up',
  'community_milestone',
  'system_alert',
  'verification_request',
  'evidence_needed'
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  action_url text,
  is_read boolean DEFAULT false,
  priority integer DEFAULT 5,
  metadata jsonb DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- =====================================================
-- 10. TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_citizen_reports_updated_at BEFORE UPDATE ON public.citizen_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_verification_tasks_updated_at BEFORE UPDATE ON public.verification_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to assign default citizen role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (NEW.id, 'citizen', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-assign citizen role
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION public.create_audit_log(
  p_user_id uuid,
  p_action audit_action,
  p_entity_type text,
  p_entity_id uuid,
  p_changes jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, changes)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_changes);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMPLETE!
-- =====================================================

COMMENT ON TABLE public.user_roles IS 'Stores user role assignments for RBAC system';
COMMENT ON TABLE public.citizen_reports IS 'Core table for citizen reports and stories';
COMMENT ON TABLE public.verification_tasks IS 'Verification workflow and task management';
COMMENT ON TABLE public.ai_analysis_logs IS 'AI analysis results and model tracking';
COMMENT ON TABLE public.audit_logs IS 'Immutable audit trail for compliance';
COMMENT ON TABLE public.partner_organizations IS 'Nuru Trust Network partner organizations';
