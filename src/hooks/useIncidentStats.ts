import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface IncidentStats {
  totalIncidents: number;
  pendingReview: number;
  verified: number;
  resolved: number;
  criticalCases: number;
  escalated: number;
  byCategory: Record<string, number>;
  byCountry: Record<string, number>;
  bySeverity: Record<string, number>;
  recentIncidents: any[];
}

export const useIncidentStats = () => {
  return useQuery({
    queryKey: ['incident-stats'],
    queryFn: async (): Promise<IncidentStats> => {
      // Fetch all public incidents
      const { data: incidents, error } = await supabase
        .from('citizen_reports')
        .select('*')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const data = incidents || [];

      // Calculate stats
      const totalIncidents = data.length;
      const pendingReview = data.filter(i => i.status === 'pending' || i.status === 'under_review').length;
      const verified = data.filter(i => i.verification_status === 'verified').length;
      const resolved = data.filter(i => i.status === 'resolved').length;
      const criticalCases = data.filter(i => i.severity_level === 'critical').length;
      const escalated = data.filter(i => i.status === 'escalated').length;

      // Group by category
      const byCategory: Record<string, number> = {};
      data.forEach(i => {
        const cat = i.category || 'unknown';
        byCategory[cat] = (byCategory[cat] || 0) + 1;
      });

      // Group by country
      const byCountry: Record<string, number> = {};
      data.forEach(i => {
        const country = i.location_country || 'Unknown';
        byCountry[country] = (byCountry[country] || 0) + 1;
      });

      // Group by severity
      const bySeverity: Record<string, number> = {};
      data.forEach(i => {
        const severity = i.severity_level || 'unknown';
        bySeverity[severity] = (bySeverity[severity] || 0) + 1;
      });

      // Recent incidents (last 10)
      const recentIncidents = data.slice(0, 10);

      return {
        totalIncidents,
        pendingReview,
        verified,
        resolved,
        criticalCases,
        escalated,
        byCategory,
        byCountry,
        bySeverity,
        recentIncidents,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
