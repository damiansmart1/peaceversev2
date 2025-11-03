import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HeatmapIncident {
  id: string;
  title: string;
  description: string;
  incident_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  geo_location: {
    latitude: number;
    longitude: number;
    location_name?: string;
  };
  country_code?: string;
  region?: string;
  reported_by?: string;
  verified_by?: string;
  resolved_by?: string;
  created_at: string;
  updated_at: string;
  verification_status?: string;
  impact_assessment?: any;
  affected_population?: number;
  response_actions?: any;
}

export const useIncidentHeatmapData = (country?: string, severity?: string) => {
  return useQuery({
    queryKey: ['incident-heatmap', country, severity],
    queryFn: async () => {
      let query = supabase
        .from('incidents' as any)
        .select('*')
        .not('geo_location', 'is', null)
        .order('created_at', { ascending: false });

      if (country && country !== 'all') {
        query = query.eq('country_code', country);
      }

      if (severity && severity !== 'all') {
        query = query.eq('severity', severity);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return (data as unknown as HeatmapIncident[]) || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds for live data
  });
};
