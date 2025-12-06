-- Create verification_tasks table
CREATE TABLE public.verification_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES public.citizen_reports(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category TEXT,
  credibility_score NUMERIC,
  verification_notes TEXT,
  verdict TEXT CHECK (verdict IN ('verified', 'rejected', 'needs_more_info')),
  confidence_score NUMERIC,
  evidence_urls TEXT[],
  recommended_action TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.verification_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Verifiers and admins can view all tasks"
  ON public.verification_tasks FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'verifier'::app_role));

CREATE POLICY "Verifiers and admins can update tasks"
  ON public.verification_tasks FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'verifier'::app_role));

CREATE POLICY "System can insert tasks"
  ON public.verification_tasks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can delete tasks"
  ON public.verification_tasks FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert sample verification tasks based on existing citizen reports
INSERT INTO public.verification_tasks (report_id, status, priority, category, credibility_score, created_at)
SELECT 
  id,
  CASE 
    WHEN verification_status = 'verified' THEN 'completed'
    WHEN verification_status = 'pending_verification' THEN 'pending'
    ELSE 'pending'
  END,
  CASE 
    WHEN ai_threat_level = 'critical' THEN 'critical'
    WHEN ai_threat_level = 'high' THEN 'high'
    WHEN ai_threat_level = 'medium' THEN 'medium'
    ELSE 'low'
  END,
  category,
  CASE 
    WHEN verification_status = 'verified' THEN 85.0
    ELSE ROUND((RANDOM() * 40 + 40)::numeric, 1)
  END,
  created_at
FROM public.citizen_reports
WHERE id NOT IN (SELECT report_id FROM public.verification_tasks WHERE report_id IS NOT NULL);

-- Enable realtime for verification tasks
ALTER PUBLICATION supabase_realtime ADD TABLE public.verification_tasks;