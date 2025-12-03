-- Integration API Keys table for external system authentication
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  organization_name text,
  created_by uuid,
  permissions jsonb DEFAULT '["read:incidents", "read:alerts"]'::jsonb,
  rate_limit_per_minute integer DEFAULT 60,
  is_active boolean DEFAULT true,
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Webhook subscriptions for external systems
CREATE TABLE IF NOT EXISTS public.webhook_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  secret text NOT NULL,
  events text[] NOT NULL DEFAULT ARRAY['incident.created', 'alert.triggered'],
  filters jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  organization_name text,
  created_by uuid,
  retry_count integer DEFAULT 3,
  timeout_seconds integer DEFAULT 30,
  last_triggered_at timestamptz,
  last_status text,
  failure_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Webhook delivery logs
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid REFERENCES public.webhook_subscriptions(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  response_status integer,
  response_body text,
  duration_ms integer,
  attempt_number integer DEFAULT 1,
  success boolean DEFAULT false,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Integration connections (for pre-built integrations)
CREATE TABLE IF NOT EXISTS public.integration_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_type text NOT NULL,
  name text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  credentials_encrypted text,
  sync_frequency_minutes integer DEFAULT 60,
  last_sync_at timestamptz,
  last_sync_status text,
  is_active boolean DEFAULT true,
  direction text DEFAULT 'inbound',
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- API usage logs for monitoring
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid REFERENCES public.api_keys(id),
  endpoint text NOT NULL,
  method text NOT NULL,
  response_status integer,
  response_time_ms integer,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage API keys" ON public.api_keys
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage webhooks" ON public.webhook_subscriptions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage own webhooks" ON public.webhook_subscriptions
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Admins can view webhook deliveries" ON public.webhook_deliveries
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage integrations" ON public.integration_connections
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view API logs" ON public.api_usage_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_key_prefix ON public.api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON public.webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_api_key_id ON public.api_usage_logs(api_key_id);