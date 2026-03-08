
-- Token limits table for NuruAI usage management
CREATE TABLE public.nuru_token_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'role' CHECK (scope IN ('role', 'user', 'global')),
  target_role TEXT NULL,
  target_user_id UUID NULL,
  daily_token_limit INTEGER NOT NULL DEFAULT 10000,
  monthly_token_limit INTEGER NOT NULL DEFAULT 300000,
  max_tokens_per_request INTEGER NOT NULL DEFAULT 4096,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Token usage tracking table
CREATE TABLE public.nuru_token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  request_type TEXT NOT NULL DEFAULT 'chat',
  conversation_id TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nuru_token_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nuru_token_usage ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for token limits
CREATE POLICY "Admins can manage token limits"
  ON public.nuru_token_limits FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users can read their applicable limits
CREATE POLICY "Users can read active limits"
  ON public.nuru_token_limits FOR SELECT TO authenticated
  USING (is_active = true);

-- Token usage policies
CREATE POLICY "Users can insert own usage"
  ON public.nuru_token_usage FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own usage"
  ON public.nuru_token_usage FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all usage"
  ON public.nuru_token_usage FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all usage"
  ON public.nuru_token_usage FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
