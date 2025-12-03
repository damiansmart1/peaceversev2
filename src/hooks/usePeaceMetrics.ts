import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';

export interface RegionalBlock {
  id: string;
  code: string;
  name: string;
  full_name: string | null;
  display_order: number;
}

export interface AfricanCountry {
  id: string;
  code: string;
  name: string;
  regional_block_id: string | null;
  regional_blocks?: RegionalBlock;
}

export interface PeaceMetrics {
  id: string;
  country_code: string;
  region: string | null;
  sentiment_average: number | null;
  tension_level: string | null;
  activity_count: number;
  risk_score: number | null;
  trending_topics: any;
  hotspot_locations: any;
  calculated_at: string;
  time_period: string;
}

export interface AccountabilityMetrics {
  id: string;
  country_code: string;
  incidents_reported: number;
  incidents_verified: number;
  incidents_resolved: number;
  avg_response_time: string | null;
  avg_resolution_time: string | null;
  accountability_index: number | null;
  calculated_at: string;
}

export const useRegionalBlocks = () => {
  return useQuery({
    queryKey: ['regional-blocks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regional_blocks')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as RegionalBlock[];
    },
  });
};

export const useAfricanCountries = (blockCode?: string) => {
  return useQuery({
    queryKey: ['african-countries', blockCode],
    queryFn: async () => {
      let query = supabase
        .from('african_countries')
        .select(`
          *,
          regional_blocks (
            id,
            code,
            name,
            full_name
          )
        `)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (blockCode && blockCode !== 'all') {
        const { data: block } = await supabase
          .from('regional_blocks')
          .select('id')
          .eq('code', blockCode)
          .single();
        
        if (block) {
          query = query.eq('regional_block_id', block.id);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AfricanCountry[];
    },
  });
};

export const useCountriesByBlock = () => {
  return useQuery({
    queryKey: ['countries-by-block'],
    queryFn: async () => {
      const { data: blocks, error: blocksError } = await supabase
        .from('regional_blocks')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (blocksError) throw blocksError;

      const { data: countries, error: countriesError } = await supabase
        .from('african_countries')
        .select(`
          *,
          regional_blocks (
            id,
            code,
            name
          )
        `)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (countriesError) throw countriesError;

      // Group countries by block
      const grouped = (blocks as RegionalBlock[]).map(block => ({
        block,
        countries: (countries as AfricanCountry[]).filter(
          c => c.regional_block_id === block.id
        )
      }));

      return grouped;
    },
  });
};

export const usePeacePulseMetrics = (country?: string) => {
  return useQuery({
    queryKey: ['peace-pulse', country],
    queryFn: async () => {
      let query = supabase
        .from('peace_pulse_metrics')
        .select('*')
        .order('calculated_at', { ascending: false })
        .limit(100);

      if (country) {
        query = query.eq('country_code', country);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PeaceMetrics[];
    },
    refetchInterval: 60000,
  });
};

export const useAccountabilityMetrics = (country?: string) => {
  return useQuery({
    queryKey: ['accountability', country],
    queryFn: async () => {
      let query = supabase
        .from('peace_accountability_metrics')
        .select('*')
        .order('calculated_at', { ascending: false })
        .limit(50);

      if (country) {
        query = query.eq('country_code', country);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AccountabilityMetrics[];
    },
  });
};

export const usePolicyResponses = (incidentId?: string, proposalId?: string) => {
  return useQuery({
    queryKey: ['policy-responses', incidentId, proposalId],
    queryFn: async () => {
      let query = supabase
        .from('policy_responses')
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
