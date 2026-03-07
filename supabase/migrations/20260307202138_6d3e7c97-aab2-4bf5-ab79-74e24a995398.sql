
-- NuruAI Civic Intelligence Tables

-- Civic documents uploaded by institutions
CREATE TABLE public.civic_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  document_type TEXT NOT NULL DEFAULT 'policy', -- budget, legislation, policy, regulation, report, consultation
  file_url TEXT,
  original_text TEXT,
  parsed_sections JSONB DEFAULT '[]'::jsonb,
  summary TEXT,
  ai_summary JSONB, -- structured AI-generated summaries per section
  topics TEXT[] DEFAULT '{}',
  institutions TEXT[] DEFAULT '{}',
  financial_allocations JSONB,
  status TEXT NOT NULL DEFAULT 'processing', -- processing, ready, error
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  country TEXT,
  region TEXT,
  publish_date DATE,
  source_url TEXT,
  language TEXT DEFAULT 'en',
  view_count INTEGER DEFAULT 0,
  question_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Civic questions asked by citizens
CREATE TABLE public.civic_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  document_id UUID REFERENCES public.civic_documents(id) ON DELETE CASCADE,
  asked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_anonymous BOOLEAN DEFAULT false,
  ai_answer TEXT,
  ai_confidence NUMERIC(3,2), -- 0.00 to 1.00
  source_passages JSONB DEFAULT '[]'::jsonb, -- highlighted source excerpts
  document_references JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending', -- pending, answered, needs_institutional_response
  upvote_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Institutional responses to civic questions
CREATE TABLE public.institutional_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.civic_questions(id) ON DELETE CASCADE NOT NULL,
  institution_name TEXT NOT NULL,
  respondent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  response_text TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'published', -- draft, published, withdrawn
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Knowledge graph entities
CREATE TABLE public.civic_knowledge_graph (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- institution, document, topic, budget_item, question
  entity_id UUID,
  entity_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}'::jsonb,
  connections JSONB DEFAULT '[]'::jsonb, -- [{target_id, relationship_type, weight}]
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Civic engagement analytics
CREATE TABLE public.civic_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL, -- documents_processed, questions_asked, engagement_time, response_rate, comprehension
  metric_value NUMERIC NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  country TEXT,
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Misinformation flags
CREATE TABLE public.civic_claim_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_text TEXT NOT NULL,
  source_document_id UUID REFERENCES public.civic_documents(id) ON DELETE SET NULL,
  review_status TEXT DEFAULT 'pending', -- pending, supported, unsupported, misleading, needs_context
  evidence_summary TEXT,
  supporting_passages JSONB DEFAULT '[]'::jsonb,
  flagged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  moderation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- AI Governance risk register
CREATE TABLE public.ai_governance_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_category TEXT NOT NULL,
  risk_name TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'medium', -- low, medium, high, critical
  mitigation_strategies TEXT[] DEFAULT '{}',
  monitoring_metrics JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active', -- active, mitigated, monitoring
  last_reviewed TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies
ALTER TABLE public.civic_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_knowledge_graph ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_claim_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_governance_registry ENABLE ROW LEVEL SECURITY;

-- Public read for published documents
CREATE POLICY "Anyone can view ready documents" ON public.civic_documents FOR SELECT USING (status = 'ready');
CREATE POLICY "Authenticated users can upload documents" ON public.civic_documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Uploaders can update own documents" ON public.civic_documents FOR UPDATE TO authenticated USING (auth.uid() = uploaded_by);

-- Public questions
CREATE POLICY "Anyone can view public questions" ON public.civic_questions FOR SELECT USING (is_public = true);
CREATE POLICY "Authenticated users can ask questions" ON public.civic_questions FOR INSERT TO authenticated WITH CHECK (auth.uid() = asked_by);
CREATE POLICY "Users can update own questions" ON public.civic_questions FOR UPDATE TO authenticated USING (auth.uid() = asked_by);

-- Institutional responses are public
CREATE POLICY "Anyone can view responses" ON public.institutional_responses FOR SELECT USING (true);
CREATE POLICY "Authenticated users can respond" ON public.institutional_responses FOR INSERT TO authenticated WITH CHECK (auth.uid() = respondent_id);

-- Knowledge graph is public read
CREATE POLICY "Anyone can view knowledge graph" ON public.civic_knowledge_graph FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert graph nodes" ON public.civic_knowledge_graph FOR INSERT TO authenticated WITH CHECK (true);

-- Analytics public read
CREATE POLICY "Anyone can view analytics" ON public.civic_analytics FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert analytics" ON public.civic_analytics FOR INSERT TO authenticated WITH CHECK (true);

-- Claim reviews
CREATE POLICY "Anyone can view claim reviews" ON public.civic_claim_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated can flag claims" ON public.civic_claim_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = flagged_by);

-- AI governance registry is public
CREATE POLICY "Anyone can view governance registry" ON public.ai_governance_registry FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert governance entries" ON public.ai_governance_registry FOR INSERT TO authenticated WITH CHECK (true);

-- Enable realtime for questions and responses
ALTER PUBLICATION supabase_realtime ADD TABLE public.civic_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.institutional_responses;
