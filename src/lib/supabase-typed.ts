// Temporary typed wrapper for Supabase client until types regenerate
// This allows all hooks to work without individual type casts
import { supabase as baseSupabase } from '@/integrations/supabase/client';

// Export a typed version that bypasses the 'never' types
export const supabase = baseSupabase as any;
