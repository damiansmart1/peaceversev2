
-- Citizen AI Feedback table for flagging inaccurate responses
CREATE TABLE public.nuru_ai_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  message_id UUID REFERENCES public.nuru_messages(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES public.nuru_conversations(id) ON DELETE SET NULL,
  feedback_type TEXT NOT NULL DEFAULT 'inaccurate' CHECK (feedback_type IN ('inaccurate', 'hallucination', 'bias', 'offensive', 'outdated', 'other')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  ai_response_snippet TEXT,
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'reviewing', 'confirmed', 'dismissed')),
  reviewed_by UUID,
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.nuru_ai_feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
CREATE POLICY "Users can submit AI feedback" ON public.nuru_ai_feedback
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback" ON public.nuru_ai_feedback
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Admins can view and manage all feedback
CREATE POLICY "Admins can manage all feedback" ON public.nuru_ai_feedback
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin')
  );

-- Add status tracking columns to ai_governance_registry for interactive management
ALTER TABLE public.ai_governance_registry 
  ADD COLUMN IF NOT EXISTS assigned_to UUID,
  ADD COLUMN IF NOT EXISTS resolution_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resolution_notes TEXT,
  ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_frequency TEXT DEFAULT 'monthly';
