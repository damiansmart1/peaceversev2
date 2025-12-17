-- Create SMS sessions table
CREATE TABLE IF NOT EXISTS public.sms_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  session_id TEXT,
  current_state TEXT DEFAULT 'main_menu',
  data JSONB DEFAULT '{}',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '1 hour')
);

-- Create SMS logs table
CREATE TABLE IF NOT EXISTS public.sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message TEXT NOT NULL,
  command TEXT,
  report_id UUID REFERENCES public.citizen_reports(id),
  status TEXT DEFAULT 'pending',
  provider_message_id TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create SMS broadcasts table
CREATE TABLE IF NOT EXISTS public.sms_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID,
  message TEXT NOT NULL,
  recipient_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Create SMS subscribers table for alert subscriptions
CREATE TABLE IF NOT EXISTS public.sms_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  country_code TEXT,
  region TEXT,
  language TEXT DEFAULT 'en',
  alert_types TEXT[] DEFAULT ARRAY['critical', 'high'],
  is_active BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  verification_code TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);

-- Create emergency contacts table
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  region TEXT,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  description TEXT,
  is_verified BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create offline report queue table
CREATE TABLE IF NOT EXISTS public.offline_report_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('sms', 'ussd')),
  raw_data JSONB NOT NULL,
  parsed_data JSONB,
  processing_status TEXT DEFAULT 'queued',
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  report_id UUID REFERENCES public.citizen_reports(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_sms_sessions_phone ON public.sms_sessions(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_logs_phone ON public.sms_logs(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created ON public.sms_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_subscribers_phone ON public.sms_subscribers(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_subscribers_country ON public.sms_subscribers(country_code);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_country ON public.emergency_contacts(country_code);
CREATE INDEX IF NOT EXISTS idx_offline_queue_status ON public.offline_report_queue(processing_status);

-- Enable RLS on all tables
ALTER TABLE public.sms_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_report_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can manage SMS sessions" ON public.sms_sessions FOR ALL USING (true);
CREATE POLICY "Admins can manage SMS logs" ON public.sms_logs FOR ALL USING (true);
CREATE POLICY "Admins can manage SMS broadcasts" ON public.sms_broadcasts FOR ALL USING (true);
CREATE POLICY "Admins can manage SMS subscribers" ON public.sms_subscribers FOR ALL USING (true);
CREATE POLICY "Anyone can view emergency contacts" ON public.emergency_contacts FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage emergency contacts" ON public.emergency_contacts FOR ALL USING (true);
CREATE POLICY "Admins can manage offline queue" ON public.offline_report_queue FOR ALL USING (true);

-- Insert default emergency contacts
INSERT INTO public.emergency_contacts (country_code, name, phone_number, category, description, priority)
VALUES 
  ('KE', 'Kenya Red Cross', '0800-723-253', 'humanitarian', '24/7 emergency response', 1),
  ('KE', 'UNHCR Kenya', '0800-727-253', 'humanitarian', 'Refugee assistance', 2),
  ('KE', 'Police Emergency', '999', 'security', 'National police emergency', 1),
  ('KE', 'Ambulance', '112', 'medical', 'Emergency medical services', 1),
  ('NG', 'NEMA', '0800-2255-3362', 'emergency', 'National Emergency Management', 1),
  ('NG', 'Police Emergency', '112', 'security', 'Nigeria Police Force', 1),
  ('ZA', 'SAPS', '10111', 'security', 'South African Police Service', 1),
  ('ZA', 'Ambulance', '10177', 'medical', 'Emergency medical services', 1),
  ('UG', 'Police Emergency', '999', 'security', 'Uganda Police Force', 1),
  ('TZ', 'Police Emergency', '112', 'security', 'Tanzania Police Force', 1),
  ('ET', 'Federal Police', '991', 'security', 'Ethiopia Federal Police', 1),
  ('GH', 'Police Emergency', '191', 'security', 'Ghana Police Service', 1)
ON CONFLICT DO NOTHING;