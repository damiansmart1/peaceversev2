-- Create enum for alert severity levels (OCHA standard)
CREATE TYPE public.alert_severity_level AS ENUM ('green', 'yellow', 'orange', 'red');

-- Create enum for communication channel types
CREATE TYPE public.comm_channel_type AS ENUM ('coordination', 'broadcast', 'field_report', 'direct', 'emergency');

-- Create enum for document types (OCHA standard)
CREATE TYPE public.ocha_document_type AS ENUM ('sitrep', 'flash_update', 'bulletin', '3w_report', 'meeting_notes', 'action_tracker');

-- Create enum for message status
CREATE TYPE public.comm_message_status AS ENUM ('draft', 'sent', 'delivered', 'read', 'acknowledged', 'escalated', 'archived');

-- Communication Channels table
CREATE TABLE public.communication_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  channel_type public.comm_channel_type NOT NULL DEFAULT 'coordination',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  is_emergency BOOLEAN DEFAULT false,
  allowed_roles TEXT[] DEFAULT ARRAY['admin', 'government', 'partner', 'verifier'],
  country_scope TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Channel Members table
CREATE TABLE public.channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.communication_channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member', -- member, moderator, admin
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_read_at TIMESTAMPTZ DEFAULT now(),
  notification_enabled BOOLEAN DEFAULT true,
  UNIQUE(channel_id, user_id)
);

-- Communication Messages table
CREATE TABLE public.channel_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.communication_channels(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- text, alert, sitrep, document, action_item
  priority public.alert_severity_level DEFAULT 'green',
  attachments JSONB DEFAULT '[]'::jsonb,
  mentions UUID[] DEFAULT ARRAY[]::UUID[],
  reply_to UUID REFERENCES public.channel_messages(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  status public.comm_message_status DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Message Acknowledgments table (for tracking who acknowledged critical messages)
CREATE TABLE public.message_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.channel_messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  acknowledged_at TIMESTAMPTZ DEFAULT now(),
  acknowledgment_note TEXT,
  UNIQUE(message_id, user_id)
);

-- OCHA Documents table
CREATE TABLE public.ocha_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type public.ocha_document_type NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  summary TEXT,
  severity_level public.alert_severity_level DEFAULT 'green',
  country TEXT,
  region TEXT,
  incident_ids UUID[] DEFAULT ARRAY[]::UUID[],
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft', -- draft, pending_review, approved, published, archived
  distribution_list TEXT[] DEFAULT ARRAY[]::TEXT[],
  attachments JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- Escalation Rules table
CREATE TABLE public.escalation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_conditions JSONB NOT NULL DEFAULT '{}'::jsonb, -- conditions that trigger escalation
  severity_threshold public.alert_severity_level DEFAULT 'orange',
  target_roles TEXT[] NOT NULL DEFAULT ARRAY['admin'],
  target_users UUID[] DEFAULT ARRAY[]::UUID[],
  escalation_time_minutes INTEGER DEFAULT 30, -- time before escalating
  max_escalations INTEGER DEFAULT 3,
  notification_channels TEXT[] DEFAULT ARRAY['in_app', 'email'], -- in_app, email, sms
  is_active BOOLEAN DEFAULT true,
  country_scope TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Escalation Logs table (audit trail)
CREATE TABLE public.escalation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES public.escalation_rules(id) ON DELETE SET NULL,
  message_id UUID REFERENCES public.channel_messages(id) ON DELETE SET NULL,
  document_id UUID REFERENCES public.ocha_documents(id) ON DELETE SET NULL,
  incident_id UUID,
  escalation_level INTEGER DEFAULT 1,
  escalated_to UUID[] NOT NULL,
  escalated_roles TEXT[],
  reason TEXT,
  status TEXT DEFAULT 'pending', -- pending, acknowledged, resolved, timeout
  acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  sla_deadline TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Broadcast Alerts table
CREATE TABLE public.broadcast_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity public.alert_severity_level NOT NULL DEFAULT 'yellow',
  alert_type TEXT DEFAULT 'general', -- general, emergency, security, weather, health
  target_roles TEXT[] DEFAULT ARRAY['citizen', 'verifier', 'partner', 'government'],
  target_countries TEXT[] DEFAULT ARRAY[]::TEXT[],
  target_regions TEXT[] DEFAULT ARRAY[]::TEXT[],
  requires_acknowledgment BOOLEAN DEFAULT false,
  acknowledgment_deadline TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft', -- draft, pending, active, expired, cancelled
  sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  delivery_stats JSONB DEFAULT '{"sent": 0, "delivered": 0, "read": 0, "acknowledged": 0}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Broadcast Acknowledgments table
CREATE TABLE public.broadcast_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id UUID REFERENCES public.broadcast_alerts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  acknowledged_at TIMESTAMPTZ DEFAULT now(),
  acknowledgment_note TEXT,
  UNIQUE(broadcast_id, user_id)
);

-- Field Reports table (Field-to-HQ reporting)
CREATE TABLE public.field_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  report_type TEXT DEFAULT 'situation', -- situation, assessment, request, update
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  location_country TEXT,
  location_region TEXT,
  location_coordinates JSONB, -- {lat, lng}
  severity public.alert_severity_level DEFAULT 'green',
  incident_ids UUID[] DEFAULT ARRAY[]::UUID[],
  attachments JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'submitted', -- submitted, received, processing, actioned, closed
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  priority INTEGER DEFAULT 2, -- 1=urgent, 2=high, 3=medium, 4=low
  response_deadline TIMESTAMPTZ,
  response_notes TEXT,
  responded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  responded_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocha_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for communication_channels
CREATE POLICY "Authenticated users can view active channels" ON public.communication_channels
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Admins can manage channels" ON public.communication_channels
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for channel_members
CREATE POLICY "Users can view their own memberships" ON public.channel_members
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can join public channels" ON public.channel_members
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage memberships" ON public.channel_members
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for channel_messages
CREATE POLICY "Channel members can view messages" ON public.channel_messages
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.channel_members WHERE channel_id = channel_messages.channel_id AND user_id = auth.uid())
  );

CREATE POLICY "Channel members can send messages" ON public.channel_messages
  FOR INSERT TO authenticated WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.channel_members WHERE channel_id = channel_messages.channel_id AND user_id = auth.uid())
  );

-- RLS Policies for message_acknowledgments
CREATE POLICY "Users can view and create their own acknowledgments" ON public.message_acknowledgments
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- RLS Policies for ocha_documents
CREATE POLICY "Published documents are viewable by authenticated users" ON public.ocha_documents
  FOR SELECT TO authenticated USING (status = 'published' OR created_by = auth.uid());

CREATE POLICY "Users can create documents" ON public.ocha_documents
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Creators can update their documents" ON public.ocha_documents
  FOR UPDATE TO authenticated USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for escalation_rules
CREATE POLICY "Admins can manage escalation rules" ON public.escalation_rules
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Government users can view escalation rules" ON public.escalation_rules
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'government'));

-- RLS Policies for escalation_logs
CREATE POLICY "Involved users can view escalation logs" ON public.escalation_logs
  FOR SELECT TO authenticated USING (
    auth.uid() = ANY(escalated_to) OR 
    acknowledged_by = auth.uid() OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'government')
  );

CREATE POLICY "System can create escalation logs" ON public.escalation_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for broadcast_alerts
CREATE POLICY "Active broadcasts are viewable" ON public.broadcast_alerts
  FOR SELECT TO authenticated USING (status = 'active' OR created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authorized users can create broadcasts" ON public.broadcast_alerts
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'government')
  );

CREATE POLICY "Creators and admins can update broadcasts" ON public.broadcast_alerts
  FOR UPDATE TO authenticated USING (
    created_by = auth.uid() OR public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for broadcast_acknowledgments
CREATE POLICY "Users can manage their own acknowledgments" ON public.broadcast_acknowledgments
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- RLS Policies for field_reports
CREATE POLICY "Reporters can view their own reports" ON public.field_reports
  FOR SELECT TO authenticated USING (
    reporter_id = auth.uid() OR 
    assigned_to = auth.uid() OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'government') OR
    public.has_role(auth.uid(), 'partner')
  );

CREATE POLICY "Authenticated users can create field reports" ON public.field_reports
  FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Reporters and assignees can update reports" ON public.field_reports
  FOR UPDATE TO authenticated USING (
    reporter_id = auth.uid() OR 
    assigned_to = auth.uid() OR
    public.has_role(auth.uid(), 'admin')
  );

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcast_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.escalation_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.field_reports;

-- Create indexes for performance
CREATE INDEX idx_channel_messages_channel ON public.channel_messages(channel_id);
CREATE INDEX idx_channel_messages_created ON public.channel_messages(created_at DESC);
CREATE INDEX idx_channel_members_user ON public.channel_members(user_id);
CREATE INDEX idx_ocha_documents_type ON public.ocha_documents(document_type);
CREATE INDEX idx_ocha_documents_status ON public.ocha_documents(status);
CREATE INDEX idx_broadcast_alerts_status ON public.broadcast_alerts(status);
CREATE INDEX idx_field_reports_status ON public.field_reports(status);
CREATE INDEX idx_escalation_logs_status ON public.escalation_logs(status);