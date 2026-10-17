// Imported first in main.tsx so sign-ins are saved clock-independently before anything else runs.
import { supabase } from '@/integrations/supabase/client';
import { installClockSafeStorage } from '@/lib/authHealth';

installClockSafeStorage(supabase.auth);
