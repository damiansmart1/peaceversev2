import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format } from 'date-fns';

export interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  criticalIncidents: number;
  verifiedReports: number;
  activeProposals: number;
  resolutionRate: number;
  avgResponseTime: number;
  peaceIndex: number;
}

export interface RegionalStat {
  region: string;
  country: string;
  reportCount: number;
  criticalCount: number;
  peaceScore: number;
}

export interface TrendData {
  date: string;
  reports: number;
  resolved: number;
  critical: number;
}

export const useGovernmentStats = () => {
  return useQuery({
    queryKey: ['government-stats'],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      
      // Fetch reports stats
      const [reportsResult, proposalsResult] = await Promise.all([
        (supabase as any)
          .from('citizen_reports')
          .select('id, status, verification_status, severity_level, created_at, location_country, location_region')
          .gte('created_at', thirtyDaysAgo),
        (supabase as any)
          .from('proposals')
          .select('id, status')
          .eq('status', 'active')
      ]);

      const reports = reportsResult.data || [];
      const proposals = proposalsResult.data || [];

      const pendingReports = reports.filter((r: any) => r.status === 'pending' || r.status === 'under_review').length;
      const criticalIncidents = reports.filter((r: any) => r.severity_level === 'critical' || r.severity_level === 'high').length;
      const verifiedReports = reports.filter((r: any) => r.verification_status === 'verified').length;
      const resolvedReports = reports.filter((r: any) => r.status === 'resolved').length;

      const stats: DashboardStats = {
        totalReports: reports.length,
        pendingReports,
        criticalIncidents,
        verifiedReports,
        activeProposals: proposals.length,
        resolutionRate: reports.length > 0 ? Math.round((resolvedReports / reports.length) * 100) : 0,
        avgResponseTime: 24, // placeholder
        peaceIndex: 7.8,
      };

      return stats;
    },
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useRegionalStats = () => {
  return useQuery({
    queryKey: ['regional-stats'],
    queryFn: async () => {
      const result = await (supabase as any)
        .from('citizen_reports')
        .select('location_country, location_region, severity_level, verification_status')
        .not('location_country', 'is', null)
        .limit(1000);

      const reports = result.data || [];
      
      // Aggregate by country
      const countryMap = new Map<string, { count: number; critical: number }>();
      
      reports.forEach((r: any) => {
        const country = r.location_country || 'Unknown';
        const existing = countryMap.get(country) || { count: 0, critical: 0 };
        existing.count++;
        if (r.severity_level === 'critical' || r.severity_level === 'high') {
          existing.critical++;
        }
        countryMap.set(country, existing);
      });

      const stats: RegionalStat[] = Array.from(countryMap.entries()).map(([country, data]) => ({
        region: country,
        country,
        reportCount: data.count,
        criticalCount: data.critical,
        peaceScore: Math.max(1, 10 - (data.critical / Math.max(1, data.count)) * 10),
      })).sort((a, b) => b.reportCount - a.reportCount).slice(0, 10);

      return stats;
    },
  });
};

export const useReportTrends = () => {
  return useQuery({
    queryKey: ['report-trends'],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      
      const result = await (supabase as any)
        .from('citizen_reports')
        .select('created_at, status, severity_level')
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: true });

      const reports = result.data || [];
      
      // Group by date
      const dateMap = new Map<string, { reports: number; resolved: number; critical: number }>();
      
      reports.forEach((r: any) => {
        const date = format(new Date(r.created_at), 'MMM dd');
        const existing = dateMap.get(date) || { reports: 0, resolved: 0, critical: 0 };
        existing.reports++;
        if (r.status === 'resolved') existing.resolved++;
        if (r.severity_level === 'critical' || r.severity_level === 'high') existing.critical++;
        dateMap.set(date, existing);
      });

      return Array.from(dateMap.entries()).map(([date, data]) => ({
        date,
        ...data,
      }));
    },
  });
};

export const useCriticalAlerts = () => {
  return useQuery({
    queryKey: ['critical-alerts'],
    queryFn: async () => {
      const result = await (supabase as any)
        .from('citizen_reports')
        .select('id, title, description, location_country, location_region, severity_level, created_at, category')
        .in('severity_level', ['critical', 'high'])
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);

      return result.data || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useRecentReports = () => {
  return useQuery({
    queryKey: ['recent-reports-gov'],
    queryFn: async () => {
      const result = await (supabase as any)
        .from('citizen_reports')
        .select('id, title, description, location_country, location_region, status, verification_status, severity_level, created_at, category')
        .order('created_at', { ascending: false })
        .limit(20);

      return result.data || [];
    },
    refetchInterval: 60000,
  });
};

export const usePendingProposals = () => {
  return useQuery({
    queryKey: ['pending-proposals-gov'],
    queryFn: async () => {
      const result = await (supabase as any)
        .from('proposals')
        .select('id, title, description, status, created_at, category, vote_count')
        .in('status', ['active', 'pending'])
        .order('vote_count', { ascending: false })
        .limit(10);

      return result.data || [];
    },
  });
};
