import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PeaceMetrics {
  country_code: string;
  region: string | null;
  sentiment_average: number | null;
  tension_level: string | null;
  activity_count: number;
  risk_score: number | null;
  trending_topics: any;
  hotspot_locations: any;
  calculated_at: string;
}

export interface AccountabilityMetrics {
  country_code: string;
  incidents_reported: number;
  incidents_verified: number;
  incidents_resolved: number;
  avg_response_time: string | null;
  avg_resolution_time: string | null;
  accountability_index: number | null;
}

export const usePeacePulseMetrics = (country?: string) => {
  return useQuery({
    queryKey: ['peace-pulse', country],
    queryFn: async () => {
      let query = supabase
        .from('peace_pulse_metrics' as any)
        .select('*')
        .order('time_period', { ascending: false })
        .limit(100);

      if (country) {
        query = query.eq('country_code', country);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as PeaceMetrics[];
    },
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useAccountabilityMetrics = (country?: string) => {
  return useQuery({
    queryKey: ['accountability', country],
    queryFn: async () => {
      let query = supabase
        .from('peace_accountability_metrics' as any)
        .select('*')
        .order('calculated_at', { ascending: false })
        .limit(50);

      if (country) {
        query = query.eq('country_code', country);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as AccountabilityMetrics[];
    },
  });
};

export const usePolicyResponses = (incidentId?: string, proposalId?: string) => {
  return useQuery({
    queryKey: ['policy-responses', incidentId, proposalId],
    queryFn: async () => {
      let query = supabase
        .from('policy_responses' as any)
        .select('*')
        .eq('public_visibility', true)
        .order('created_at', { ascending: false });

      if (incidentId) {
        query = query.eq('incident_id', incidentId);
      }
      if (proposalId) {
        query = query.eq('proposal_id', proposalId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};