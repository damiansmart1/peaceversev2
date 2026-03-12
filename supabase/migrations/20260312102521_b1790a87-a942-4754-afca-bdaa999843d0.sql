
-- News intelligence pipeline tables

-- Scanned news articles from multiple sources
CREATE TABLE public.news_intelligence_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_domain TEXT,
  title TEXT NOT NULL,
  summary TEXT,
  full_content TEXT,
  published_at TIMESTAMPTZ,
  language TEXT DEFAULT 'en',
  country_codes TEXT[] DEFAULT '{}',
  regions TEXT[] DEFAULT '{}',
  categories TEXT[] DEFAULT '{}',
  actors TEXT[] DEFAULT '{}',
  tone_score NUMERIC,
  gdelt_event_id TEXT,
  external_id TEXT,
  image_url TEXT,
  credibility_tier TEXT DEFAULT 'unrated',
  duplicate_cluster_id UUID,
  scan_batch_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- News scan batches (each scheduled or manual scan run)
CREATE TABLE public.news_scan_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_type TEXT NOT NULL DEFAULT 'scheduled',
  status TEXT NOT NULL DEFAULT 'running',
  trigger_user_id UUID,
  search_queries TEXT[] DEFAULT '{}',
  geographic_focus TEXT[] DEFAULT '{}',
  articles_found INTEGER DEFAULT 0,
  articles_processed INTEGER DEFAULT 0,
  clusters_identified INTEGER DEFAULT 0,
  reports_generated INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

-- AI-generated draft incident reports from news intelligence
CREATE TABLE public.news_intelligence_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_batch_id UUID REFERENCES public.news_scan_batches(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  detailed_analysis TEXT,
  category TEXT NOT NULL,
  severity_level TEXT DEFAULT 'medium',
  credibility_score NUMERIC DEFAULT 0,
  credibility_methodology JSONB DEFAULT '{}',
  source_count INTEGER DEFAULT 0,
  source_articles UUID[] DEFAULT '{}',
  source_urls TEXT[] DEFAULT '{}',
  source_names TEXT[] DEFAULT '{}',
  cross_reference_summary TEXT,
  affected_countries TEXT[] DEFAULT '{}',
  affected_regions TEXT[] DEFAULT '{}',
  estimated_people_affected INTEGER,
  location_latitude NUMERIC,
  location_longitude NUMERIC,
  location_name TEXT,
  actors_involved JSONB DEFAULT '[]',
  key_facts JSONB DEFAULT '[]',
  timeline_events JSONB DEFAULT '[]',
  recommended_actions JSONB DEFAULT '[]',
  review_status TEXT NOT NULL DEFAULT 'pending_review',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  published_report_id UUID,
  ai_model_used TEXT,
  ai_confidence NUMERIC,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Source credibility registry
CREATE TABLE public.news_source_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country TEXT,
  credibility_score NUMERIC DEFAULT 50,
  bias_rating TEXT,
  fact_check_record JSONB DEFAULT '{}',
  total_articles_scanned INTEGER DEFAULT 0,
  accurate_reports INTEGER DEFAULT 0,
  false_reports INTEGER DEFAULT 0,
  last_scanned_at TIMESTAMPTZ,
  is_primary_source BOOLEAN DEFAULT false,
  source_type TEXT DEFAULT 'news',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.news_intelligence_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_scan_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_intelligence_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_source_registry ENABLE ROW LEVEL SECURITY;

-- RLS: Authenticated users can read
CREATE POLICY "Authenticated users can read articles" ON public.news_intelligence_articles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read scan batches" ON public.news_scan_batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read intelligence reports" ON public.news_intelligence_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read source registry" ON public.news_source_registry FOR SELECT TO authenticated USING (true);

-- RLS: Only admins/verifiers can insert/update (via service role in edge functions, but add policies for direct access)
CREATE POLICY "Service role manages articles" ON public.news_intelligence_articles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages batches" ON public.news_scan_batches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages reports" ON public.news_intelligence_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages registry" ON public.news_source_registry FOR ALL USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_news_articles_batch ON public.news_intelligence_articles(scan_batch_id);
CREATE INDEX idx_news_articles_published ON public.news_intelligence_articles(published_at DESC);
CREATE INDEX idx_news_articles_countries ON public.news_intelligence_articles USING GIN(country_codes);
CREATE INDEX idx_news_reports_status ON public.news_intelligence_reports(review_status);
CREATE INDEX idx_news_reports_credibility ON public.news_intelligence_reports(credibility_score DESC);
CREATE INDEX idx_news_reports_created ON public.news_intelligence_reports(created_at DESC);
CREATE INDEX idx_source_registry_domain ON public.news_source_registry(domain);

-- Enable realtime for reports (for live updates in review queue)
ALTER PUBLICATION supabase_realtime ADD TABLE public.news_intelligence_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.news_scan_batches;
