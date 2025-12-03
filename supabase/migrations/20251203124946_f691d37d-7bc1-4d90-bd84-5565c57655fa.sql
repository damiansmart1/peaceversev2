-- Create regional economic communities table
CREATE TABLE public.regional_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  full_name TEXT,
  description TEXT,
  headquarters TEXT,
  website_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create countries table linked to regional blocks
CREATE TABLE public.african_countries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  regional_block_id UUID REFERENCES public.regional_blocks(id) ON DELETE SET NULL,
  capital TEXT,
  population BIGINT,
  area_km2 NUMERIC,
  official_languages TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create peace pulse metrics table (admin-editable)
CREATE TABLE public.peace_pulse_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL,
  region TEXT,
  time_period DATE DEFAULT CURRENT_DATE,
  sentiment_average NUMERIC,
  tension_level TEXT CHECK (tension_level IN ('low', 'medium', 'high', 'critical')),
  activity_count INTEGER DEFAULT 0,
  risk_score NUMERIC,
  trending_topics JSONB DEFAULT '[]'::jsonb,
  hotspot_locations JSONB DEFAULT '[]'::jsonb,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create accountability metrics table (admin-editable)
CREATE TABLE public.peace_accountability_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL,
  incidents_reported INTEGER DEFAULT 0,
  incidents_verified INTEGER DEFAULT 0,
  incidents_resolved INTEGER DEFAULT 0,
  avg_response_time TEXT,
  avg_resolution_time TEXT,
  accountability_index NUMERIC,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.regional_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.african_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peace_pulse_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peace_accountability_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for regional_blocks
CREATE POLICY "Anyone can view active regional blocks" ON public.regional_blocks
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage regional blocks" ON public.regional_blocks
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for african_countries
CREATE POLICY "Anyone can view active countries" ON public.african_countries
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage countries" ON public.african_countries
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for peace_pulse_metrics
CREATE POLICY "Anyone can view peace metrics" ON public.peace_pulse_metrics
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage peace metrics" ON public.peace_pulse_metrics
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for peace_accountability_metrics
CREATE POLICY "Anyone can view accountability metrics" ON public.peace_accountability_metrics
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage accountability metrics" ON public.peace_accountability_metrics
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert regional blocks
INSERT INTO public.regional_blocks (code, name, full_name, display_order) VALUES
  ('AU', 'African Union', 'African Union', 1),
  ('COMESA', 'COMESA', 'Common Market for Eastern and Southern Africa', 2),
  ('SADC', 'SADC', 'Southern African Development Community', 3),
  ('ECOWAS', 'ECOWAS', 'Economic Community of West African States', 4),
  ('EAC', 'EAC', 'East African Community', 5),
  ('IGAD', 'IGAD', 'Intergovernmental Authority on Development', 6),
  ('AMU', 'AMU', 'Arab Maghreb Union', 7),
  ('ECCAS', 'ECCAS', 'Economic Community of Central African States', 8);

-- Insert African countries with regional block assignments
INSERT INTO public.african_countries (code, name, regional_block_id) VALUES
  -- COMESA countries
  ('KE', 'Kenya', (SELECT id FROM public.regional_blocks WHERE code = 'COMESA')),
  ('UG', 'Uganda', (SELECT id FROM public.regional_blocks WHERE code = 'COMESA')),
  ('RW', 'Rwanda', (SELECT id FROM public.regional_blocks WHERE code = 'COMESA')),
  ('ET', 'Ethiopia', (SELECT id FROM public.regional_blocks WHERE code = 'COMESA')),
  ('ZM', 'Zambia', (SELECT id FROM public.regional_blocks WHERE code = 'COMESA')),
  ('ZW', 'Zimbabwe', (SELECT id FROM public.regional_blocks WHERE code = 'COMESA')),
  ('MW', 'Malawi', (SELECT id FROM public.regional_blocks WHERE code = 'COMESA')),
  ('BI', 'Burundi', (SELECT id FROM public.regional_blocks WHERE code = 'COMESA')),
  ('DJ', 'Djibouti', (SELECT id FROM public.regional_blocks WHERE code = 'COMESA')),
  ('ER', 'Eritrea', (SELECT id FROM public.regional_blocks WHERE code = 'COMESA')),
  -- SADC countries
  ('ZA', 'South Africa', (SELECT id FROM public.regional_blocks WHERE code = 'SADC')),
  ('BW', 'Botswana', (SELECT id FROM public.regional_blocks WHERE code = 'SADC')),
  ('NA', 'Namibia', (SELECT id FROM public.regional_blocks WHERE code = 'SADC')),
  ('MZ', 'Mozambique', (SELECT id FROM public.regional_blocks WHERE code = 'SADC')),
  ('AO', 'Angola', (SELECT id FROM public.regional_blocks WHERE code = 'SADC')),
  ('LS', 'Lesotho', (SELECT id FROM public.regional_blocks WHERE code = 'SADC')),
  ('SZ', 'Eswatini', (SELECT id FROM public.regional_blocks WHERE code = 'SADC')),
  ('TZ', 'Tanzania', (SELECT id FROM public.regional_blocks WHERE code = 'SADC')),
  ('CD', 'DR Congo', (SELECT id FROM public.regional_blocks WHERE code = 'SADC')),
  -- ECOWAS countries
  ('NG', 'Nigeria', (SELECT id FROM public.regional_blocks WHERE code = 'ECOWAS')),
  ('GH', 'Ghana', (SELECT id FROM public.regional_blocks WHERE code = 'ECOWAS')),
  ('SN', 'Senegal', (SELECT id FROM public.regional_blocks WHERE code = 'ECOWAS')),
  ('CI', 'Côte d''Ivoire', (SELECT id FROM public.regional_blocks WHERE code = 'ECOWAS')),
  ('ML', 'Mali', (SELECT id FROM public.regional_blocks WHERE code = 'ECOWAS')),
  ('BF', 'Burkina Faso', (SELECT id FROM public.regional_blocks WHERE code = 'ECOWAS')),
  ('NE', 'Niger', (SELECT id FROM public.regional_blocks WHERE code = 'ECOWAS')),
  ('GN', 'Guinea', (SELECT id FROM public.regional_blocks WHERE code = 'ECOWAS')),
  ('BJ', 'Benin', (SELECT id FROM public.regional_blocks WHERE code = 'ECOWAS')),
  ('TG', 'Togo', (SELECT id FROM public.regional_blocks WHERE code = 'ECOWAS')),
  ('SL', 'Sierra Leone', (SELECT id FROM public.regional_blocks WHERE code = 'ECOWAS')),
  ('LR', 'Liberia', (SELECT id FROM public.regional_blocks WHERE code = 'ECOWAS')),
  -- EAC countries
  ('SS', 'South Sudan', (SELECT id FROM public.regional_blocks WHERE code = 'EAC')),
  ('SO', 'Somalia', (SELECT id FROM public.regional_blocks WHERE code = 'IGAD')),
  ('SD', 'Sudan', (SELECT id FROM public.regional_blocks WHERE code = 'IGAD')),
  -- AMU countries
  ('EG', 'Egypt', (SELECT id FROM public.regional_blocks WHERE code = 'AMU')),
  ('LY', 'Libya', (SELECT id FROM public.regional_blocks WHERE code = 'AMU')),
  ('TN', 'Tunisia', (SELECT id FROM public.regional_blocks WHERE code = 'AMU')),
  ('DZ', 'Algeria', (SELECT id FROM public.regional_blocks WHERE code = 'AMU')),
  ('MA', 'Morocco', (SELECT id FROM public.regional_blocks WHERE code = 'AMU')),
  -- ECCAS countries
  ('CM', 'Cameroon', (SELECT id FROM public.regional_blocks WHERE code = 'ECCAS')),
  ('GA', 'Gabon', (SELECT id FROM public.regional_blocks WHERE code = 'ECCAS')),
  ('CG', 'Congo', (SELECT id FROM public.regional_blocks WHERE code = 'ECCAS')),
  ('CF', 'Central African Republic', (SELECT id FROM public.regional_blocks WHERE code = 'ECCAS')),
  ('TD', 'Chad', (SELECT id FROM public.regional_blocks WHERE code = 'ECCAS'));

-- Insert mock peace pulse metrics
INSERT INTO public.peace_pulse_metrics (country_code, sentiment_average, tension_level, activity_count, risk_score, trending_topics, hotspot_locations) VALUES
  ('KE', 0.72, 'medium', 245, 0.35, '["Election Security", "Youth Employment", "Climate Change"]', '[{"name": "Nairobi CBD", "risk": "medium"}, {"name": "Kisumu", "risk": "low"}]'),
  ('UG', 0.68, 'low', 156, 0.28, '["Healthcare Access", "Land Rights", "Education"]', '[{"name": "Kampala", "risk": "low"}]'),
  ('RW', 0.85, 'low', 89, 0.15, '["Economic Growth", "Tourism", "Technology"]', '[]'),
  ('ET', 0.45, 'high', 412, 0.65, '["Regional Tensions", "Food Security", "Political Reforms"]', '[{"name": "Tigray Region", "risk": "high"}, {"name": "Oromia", "risk": "medium"}]'),
  ('ZA', 0.58, 'medium', 324, 0.42, '["Energy Crisis", "Crime Prevention", "Economic Recovery"]', '[{"name": "Johannesburg", "risk": "medium"}, {"name": "Cape Town", "risk": "low"}]'),
  ('NG', 0.52, 'high', 567, 0.58, '["Security", "Elections", "Economic Diversification"]', '[{"name": "Lagos", "risk": "medium"}, {"name": "Borno", "risk": "high"}]'),
  ('GH', 0.75, 'low', 134, 0.22, '["Democracy", "Youth Development", "Digital Economy"]', '[{"name": "Accra", "risk": "low"}]'),
  ('EG', 0.62, 'medium', 278, 0.38, '["Economic Reform", "Regional Stability", "Infrastructure"]', '[{"name": "Cairo", "risk": "medium"}, {"name": "Sinai", "risk": "high"}]'),
  ('TZ', 0.78, 'low', 112, 0.18, '["Tourism", "Agriculture", "Infrastructure"]', '[{"name": "Dar es Salaam", "risk": "low"}]'),
  ('SD', 0.35, 'critical', 623, 0.82, '["Conflict Resolution", "Humanitarian Aid", "Peace Process"]', '[{"name": "Khartoum", "risk": "critical"}, {"name": "Darfur", "risk": "high"}]');

-- Insert mock accountability metrics
INSERT INTO public.peace_accountability_metrics (country_code, incidents_reported, incidents_verified, incidents_resolved, avg_response_time, avg_resolution_time, accountability_index) VALUES
  ('KE', 245, 198, 156, '4.2 hours', '3.5 days', 0.72),
  ('UG', 156, 134, 112, '5.1 hours', '4.2 days', 0.68),
  ('RW', 89, 82, 78, '2.8 hours', '2.1 days', 0.88),
  ('ET', 412, 289, 145, '8.5 hours', '7.8 days', 0.45),
  ('ZA', 324, 267, 198, '3.8 hours', '4.5 days', 0.65),
  ('NG', 567, 423, 289, '6.2 hours', '5.8 days', 0.58),
  ('GH', 134, 118, 102, '3.2 hours', '2.8 days', 0.78),
  ('EG', 278, 234, 178, '4.5 hours', '3.9 days', 0.68),
  ('TZ', 112, 98, 89, '3.5 hours', '2.5 days', 0.82),
  ('SD', 623, 312, 98, '12.5 hours', '15.2 days', 0.28);

-- Create indexes
CREATE INDEX idx_african_countries_block ON public.african_countries(regional_block_id);
CREATE INDEX idx_peace_pulse_country ON public.peace_pulse_metrics(country_code);
CREATE INDEX idx_peace_accountability_country ON public.peace_accountability_metrics(country_code);