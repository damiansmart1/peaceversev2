-- Create USSD sessions table
CREATE TABLE IF NOT EXISTS public.ussd_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  phone_number text NOT NULL,
  current_state text NOT NULL DEFAULT 'main_menu',
  data jsonb DEFAULT '{}'::jsonb,
  language text DEFAULT 'en',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create USSD logs table
CREATE TABLE IF NOT EXISTS public.ussd_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  session_id text,
  action text NOT NULL,
  report_id uuid REFERENCES public.citizen_reports(id),
  input_text text,
  response_text text,
  country_code text DEFAULT 'KE',
  carrier text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ussd_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ussd_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for ussd_sessions
CREATE POLICY "Admins can manage USSD sessions"
  ON public.ussd_sessions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage sessions"
  ON public.ussd_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS policies for ussd_logs  
CREATE POLICY "Admins can view USSD logs"
  ON public.ussd_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert USSD logs"
  ON public.ussd_logs
  FOR INSERT
  WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ussd_sessions_phone ON public.ussd_sessions(phone_number);
CREATE INDEX IF NOT EXISTS idx_ussd_logs_phone ON public.ussd_logs(phone_number);
CREATE INDEX IF NOT EXISTS idx_ussd_logs_created ON public.ussd_logs(created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.ussd_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ussd_logs;

-- Insert mock USSD logs data (representing realistic USSD interactions)
INSERT INTO public.ussd_logs (phone_number, session_id, action, input_text, response_text, country_code, carrier, created_at) VALUES
-- Kenya users
('+254712345678', 'sess_ke_001', 'menu_access', '', 'Peaceverse Early Warning - Main Menu', 'KE', 'Safaricom', now() - interval '2 hours'),
('+254712345678', 'sess_ke_001', 'report_started', '1', 'Select incident type', 'KE', 'Safaricom', now() - interval '2 hours'),
('+254712345678', 'sess_ke_001', 'category_selected', '1*1', 'Violence - Enter location', 'KE', 'Safaricom', now() - interval '2 hours'),
('+254712345678', 'sess_ke_001', 'location_entered', '1*1*Kibera', 'Enter description', 'KE', 'Safaricom', now() - interval '2 hours'),
('+254712345678', 'sess_ke_001', 'report_submitted', '1*1*Kibera*Armed men spotted near market', 'Report submitted RPT-A1B2C3', 'KE', 'Safaricom', now() - interval '2 hours'),

('+254723456789', 'sess_ke_002', 'menu_access', '', 'Peaceverse Early Warning - Main Menu', 'KE', 'Airtel', now() - interval '1 hour'),
('+254723456789', 'sess_ke_002', 'view_alerts', '2', 'Active Alerts in your area', 'KE', 'Airtel', now() - interval '1 hour'),

('+254734567890', 'sess_ke_003', 'menu_access', '', 'Peaceverse Early Warning - Main Menu', 'KE', 'Safaricom', now() - interval '45 minutes'),
('+254734567890', 'sess_ke_003', 'check_status', '3', 'Enter Report ID', 'KE', 'Safaricom', now() - interval '45 minutes'),
('+254734567890', 'sess_ke_003', 'status_checked', '3*RPT123456', 'Report Status: Under Verification', 'KE', 'Safaricom', now() - interval '44 minutes'),

-- Nigeria users
('+2348012345678', 'sess_ng_001', 'menu_access', '', 'Peaceverse Early Warning - Main Menu', 'NG', 'MTN', now() - interval '3 hours'),
('+2348012345678', 'sess_ng_001', 'report_started', '1', 'Select incident type', 'NG', 'MTN', now() - interval '3 hours'),
('+2348012345678', 'sess_ng_001', 'category_selected', '1*4', 'Political Unrest - Enter location', 'NG', 'MTN', now() - interval '3 hours'),
('+2348012345678', 'sess_ng_001', 'report_submitted', '1*4*Lagos Island*Protest blocking major roads', 'Report submitted RPT-D4E5F6', 'NG', 'MTN', now() - interval '3 hours'),

('+2348023456789', 'sess_ng_002', 'menu_access', '', 'Peaceverse Early Warning - Main Menu', 'NG', 'Glo', now() - interval '30 minutes'),
('+2348023456789', 'sess_ng_002', 'find_safe_space', '4', 'Safe Spaces Near You', 'NG', 'Glo', now() - interval '30 minutes'),

-- Ethiopia users
('+251911234567', 'sess_et_001', 'menu_access', '', 'Peaceverse Early Warning - Main Menu', 'ET', 'Ethio Telecom', now() - interval '4 hours'),
('+251911234567', 'sess_et_001', 'language_change', '5', 'Select Language', 'ET', 'Ethio Telecom', now() - interval '4 hours'),
('+251911234567', 'sess_et_001', 'language_set', '5*5', 'Language set to Amharic', 'ET', 'Ethio Telecom', now() - interval '4 hours'),
('+251911234567', 'sess_et_001', 'report_started', '5*5*1', 'Select incident type', 'ET', 'Ethio Telecom', now() - interval '4 hours'),
('+251911234567', 'sess_et_001', 'report_submitted', '5*5*1*2*Addis Ababa*Displacement reported', 'Report submitted RPT-G7H8I9', 'ET', 'Ethio Telecom', now() - interval '4 hours'),

-- Uganda users
('+256772345678', 'sess_ug_001', 'menu_access', '', 'Peaceverse Early Warning - Main Menu', 'UG', 'MTN Uganda', now() - interval '5 hours'),
('+256772345678', 'sess_ug_001', 'report_started', '1', 'Select incident type', 'UG', 'MTN Uganda', now() - interval '5 hours'),
('+256772345678', 'sess_ug_001', 'report_submitted', '1*3*Kampala*Flooding in low areas', 'Report submitted RPT-J0K1L2', 'UG', 'MTN Uganda', now() - interval '5 hours'),

('+256783456789', 'sess_ug_002', 'menu_access', '', 'Peaceverse Early Warning - Main Menu', 'UG', 'Airtel Uganda', now() - interval '20 minutes'),
('+256783456789', 'sess_ug_002', 'view_alerts', '2', 'No active alerts', 'UG', 'Airtel Uganda', now() - interval '20 minutes'),

-- Tanzania users
('+255712345678', 'sess_tz_001', 'menu_access', '', 'Peaceverse Early Warning - Main Menu', 'TZ', 'Vodacom', now() - interval '6 hours'),
('+255712345678', 'sess_tz_001', 'language_change', '5', 'Select Language', 'TZ', 'Vodacom', now() - interval '6 hours'),
('+255712345678', 'sess_tz_001', 'language_set', '5*2', 'Language set to Kiswahili', 'TZ', 'Vodacom', now() - interval '6 hours'),

-- South Africa users
('+27821234567', 'sess_za_001', 'menu_access', '', 'Peaceverse Early Warning - Main Menu', 'ZA', 'Vodacom SA', now() - interval '1 hour'),
('+27821234567', 'sess_za_001', 'report_started', '1', 'Select incident type', 'ZA', 'Vodacom SA', now() - interval '1 hour'),
('+27821234567', 'sess_za_001', 'report_submitted', '1*1*Johannesburg*Community violence near school', 'Report submitted RPT-M3N4O5', 'ZA', 'Vodacom SA', now() - interval '1 hour'),

-- Ghana users
('+233241234567', 'sess_gh_001', 'menu_access', '', 'Peaceverse Early Warning - Main Menu', 'GH', 'MTN Ghana', now() - interval '2 hours'),
('+233241234567', 'sess_gh_001', 'find_safe_space', '4', 'Safe Spaces Near You', 'GH', 'MTN Ghana', now() - interval '2 hours'),

-- Rwanda users
('+250781234567', 'sess_rw_001', 'menu_access', '', 'Peaceverse Early Warning - Main Menu', 'RW', 'MTN Rwanda', now() - interval '3 hours'),
('+250781234567', 'sess_rw_001', 'check_status', '3', 'Enter Report ID', 'RW', 'MTN Rwanda', now() - interval '3 hours'),
('+250781234567', 'sess_rw_001', 'status_checked', '3*RPT789012', 'Report Status: Verified', 'RW', 'MTN Rwanda', now() - interval '3 hours'),

-- DRC users
('+243812345678', 'sess_cd_001', 'menu_access', '', 'Peaceverse Early Warning - Main Menu', 'CD', 'Vodacom DRC', now() - interval '4 hours'),
('+243812345678', 'sess_cd_001', 'language_change', '5', 'Select Language', 'CD', 'Vodacom DRC', now() - interval '4 hours'),
('+243812345678', 'sess_cd_001', 'language_set', '5*3', 'Language set to Français', 'CD', 'Vodacom DRC', now() - interval '4 hours'),
('+243812345678', 'sess_cd_001', 'report_submitted', '5*3*1*2*Goma*Population displacement due to conflict', 'Report submitted RPT-P6Q7R8', 'CD', 'Vodacom DRC', now() - interval '4 hours'),

-- Senegal users (French)
('+221771234567', 'sess_sn_001', 'menu_access', '', 'Peaceverse Early Warning - Main Menu', 'SN', 'Orange Senegal', now() - interval '5 hours'),
('+221771234567', 'sess_sn_001', 'report_started', '1', 'Select incident type', 'SN', 'Orange Senegal', now() - interval '5 hours'),
('+221771234567', 'sess_sn_001', 'report_submitted', '1*5*Dakar*Water shortage in suburbs', 'Report submitted RPT-S9T0U1', 'SN', 'Orange Senegal', now() - interval '5 hours'),

-- Sudan users (Arabic)
('+249912345678', 'sess_sd_001', 'menu_access', '', 'Peaceverse Early Warning - Main Menu', 'SD', 'Sudani', now() - interval '6 hours'),
('+249912345678', 'sess_sd_001', 'language_change', '5', 'Select Language', 'SD', 'Sudani', now() - interval '6 hours'),
('+249912345678', 'sess_sd_001', 'language_set', '5*4', 'Language set to Arabic', 'SD', 'Sudani', now() - interval '6 hours'),
('+249912345678', 'sess_sd_001', 'report_started', '5*4*1', 'Select incident type', 'SD', 'Sudani', now() - interval '6 hours'),

-- Recent activity burst (simulating active usage)
('+254745678901', 'sess_ke_004', 'menu_access', '', 'Peaceverse Early Warning - Main Menu', 'KE', 'Safaricom', now() - interval '10 minutes'),
('+254745678901', 'sess_ke_004', 'view_alerts', '2', 'Active Alerts: 3 in your region', 'KE', 'Safaricom', now() - interval '9 minutes'),

('+254756789012', 'sess_ke_005', 'menu_access', '', 'Peaceverse Early Warning - Main Menu', 'KE', 'Telkom', now() - interval '5 minutes'),
('+254756789012', 'sess_ke_005', 'report_started', '1', 'Select incident type', 'KE', 'Telkom', now() - interval '5 minutes'),
('+254756789012', 'sess_ke_005', 'report_submitted', '1*1*Mombasa*Suspicious activity near port', 'Report submitted RPT-V2W3X4', 'KE', 'Telkom', now() - interval '4 minutes'),

('+2348034567890', 'sess_ng_003', 'menu_access', '', 'Peaceverse Early Warning - Main Menu', 'NG', 'Airtel Nigeria', now() - interval '3 minutes'),
('+2348034567890', 'sess_ng_003', 'find_safe_space', '4', 'Safe Spaces Near You', 'NG', 'Airtel Nigeria', now() - interval '2 minutes'),

('+256794567890', 'sess_ug_003', 'menu_access', '', 'Peaceverse Early Warning - Main Menu', 'UG', 'Africell', now() - interval '1 minute'),
('+256794567890', 'sess_ug_003', 'view_alerts', '2', 'No active alerts', 'UG', 'Africell', now() - interval '30 seconds');