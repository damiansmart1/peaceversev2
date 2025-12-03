-- Add missing columns to safe_spaces
ALTER TABLE public.safe_spaces 
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS capacity INTEGER,
ADD COLUMN IF NOT EXISTS country_code TEXT,
ADD COLUMN IF NOT EXISTS region TEXT;

-- Update safe_spaces with sample data
UPDATE public.safe_spaces SET country_code = 'KE', region = 'Nairobi' WHERE country_code IS NULL;

-- Insert sample safe spaces if table is empty
INSERT INTO public.safe_spaces (name, description, location_name, latitude, longitude, country_code, region, contact_phone, capacity, verified, is_archived)
SELECT 'Red Cross Center Nairobi', 'Emergency shelter and medical support', 'South C, Nairobi', -1.3089, 36.8219, 'KE', 'Nairobi', '0800-723-253', 200, true, false
WHERE NOT EXISTS (SELECT 1 FROM public.safe_spaces WHERE name = 'Red Cross Center Nairobi');

INSERT INTO public.safe_spaces (name, description, location_name, latitude, longitude, country_code, region, contact_phone, capacity, verified, is_archived)
SELECT 'UNHCR Dadaab Office', 'Refugee registration and support services', 'Dadaab, Garissa County', 0.0507, 40.3039, 'KE', 'North Eastern', '0800-727-253', 500, true, false
WHERE NOT EXISTS (SELECT 1 FROM public.safe_spaces WHERE name = 'UNHCR Dadaab Office');

INSERT INTO public.safe_spaces (name, description, location_name, latitude, longitude, country_code, region, contact_phone, capacity, verified, is_archived)
SELECT 'Community Peace Center', 'Counseling and community support', 'Kibera, Nairobi', -1.3133, 36.7876, 'KE', 'Nairobi', '+254 722 123456', 100, true, false
WHERE NOT EXISTS (SELECT 1 FROM public.safe_spaces WHERE name = 'Community Peace Center');