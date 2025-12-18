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
      // Fetch all public incidents using secure view (masks sensitive data for unauthorized users)
      const { data, error } = await supabase
        .from('citizen_reports_safe' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const incidents = (data || []) as any[];

      // Calculate stats
      const totalIncidents = incidents.length;
      const pendingReview = incidents.filter((i: any) => i.status === 'pending' || i.status === 'under_review').length;
      const verified = incidents.filter((i: any) => i.verification_status === 'verified').length;
      const resolved = incidents.filter((i: any) => i.status === 'resolved').length;
      const criticalCases = incidents.filter((i: any) => i.severity_level === 'critical').length;
      const escalated = incidents.filter((i: any) => i.status === 'escalated').length;

      // Group by category
      const byCategory: Record<string, number> = {};
      incidents.forEach((i: any) => {
        const cat = i.category || 'unknown';
        byCategory[cat] = (byCategory[cat] || 0) + 1;
      });

      // Group by country
      const byCountry: Record<string, number> = {};
      incidents.forEach((i: any) => {
        const country = i.location_country || 'Unknown';
        byCountry[country] = (byCountry[country] || 0) + 1;
      });

      // Group by severity
      const bySeverity: Record<string, number> = {};
      incidents.forEach((i: any) => {
        const severity = i.severity_level || 'unknown';
        bySeverity[severity] = (bySeverity[severity] || 0) + 1;
      });

      // Recent incidents (last 10)
      const recentIncidents = incidents.slice(0, 10);

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
