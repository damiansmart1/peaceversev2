import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';

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
      // Use secure view - masks precise coordinates for unauthorized users
      let query = supabase
        .from('citizen_reports_safe' as any)
        .select('*')
        .not('location_latitude', 'is', null)
        .not('location_longitude', 'is', null)
        .order('created_at', { ascending: false });

      if (country && country !== 'all') {
        query = query.eq('location_country', country);
      }

      if (severity && severity !== 'all') {
        query = query.eq('severity_level', severity);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Map citizen_reports to HeatmapIncident format
      return (data || []).map(report => ({
        id: report.id,
        title: report.title,
        description: report.description,
        incident_type: report.category,
        severity: report.severity_level as 'low' | 'medium' | 'high' | 'critical',
        status: report.status || 'pending',
        geo_location: {
          latitude: report.location_latitude!,
          longitude: report.location_longitude!,
          location_name: report.location_name || report.location_city || report.location_region,
        },
        country_code: report.location_country,
        region: report.location_region,
        reported_by: report.reporter_id,
        verified_by: report.verified_by,
        resolved_by: null,
        created_at: report.created_at!,
        updated_at: report.updated_at!,
        verification_status: report.verification_status,
        impact_assessment: null,
        affected_population: report.estimated_people_affected,
        response_actions: null,
      })) as HeatmapIncident[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds for live data
  });
};
