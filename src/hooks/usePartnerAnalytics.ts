import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PartnerOverviewMetrics {
  totalIncidents: number;
  verifiedIncidents: number;
  resolvedIncidents: number;
  criticalIncidents: number;
  highPriorityIncidents: number;
  pendingVerification: number;
  escalatedIncidents: number;
  averageResolutionDays: number | null;
  verificationRate: number;
  resolutionRate: number;
}

export interface GeographicDistribution {
  country: string;
  region: string | null;
  incidentCount: number;
  verifiedCount: number;
  criticalCount: number;
  riskLevel: string;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  severityBreakdown: Record<string, number>;
}

export interface TimeSeriesData {
  date: string;
  incidents: number;
  verified: number;
  resolved: number;
  critical: number;
}

export interface RiskAssessment {
  riskScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  factors: string[];
  recommendations: string[];
}

export interface HotspotData {
  id: string;
  region: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  incidentCount: number;
  riskScore: number;
  riskLevel: string;
  primaryCategory: string;
  trend: string;
}

export interface PartnerAnalyticsData {
  overview: PartnerOverviewMetrics;
  geographicDistribution: GeographicDistribution[];
  categoryBreakdown: CategoryBreakdown[];
  timeSeriesData: TimeSeriesData[];
  hotspots: HotspotData[];
  riskAssessment: RiskAssessment;
  recentIncidents: any[];
  alerts: any[];
  correlations: any[];
}

// ============================================================================
// ANALYTICS HOOK
// ============================================================================

export const usePartnerAnalytics = (dateRange?: { from?: string; to?: string }, countryFilter?: string) => {
  return useQuery({
    queryKey: ['partner-analytics', dateRange, countryFilter],
    queryFn: async (): Promise<PartnerAnalyticsData> => {
      // Parallel fetch for performance
      const [
        { data: incidents, error: incidentsError },
        { data: hotspots, error: hotspotsError },
        { data: alerts, error: alertsError },
        { data: correlations, error: correlationsError },
      ] = await Promise.all([
        supabase
          .from('citizen_reports_safe' as any)
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('predictive_hotspots')
          .select('*')
          .eq('status', 'active')
          .order('hotspot_score', { ascending: false })
          .limit(20),
        supabase
          .from('alert_logs')
          .select('*')
          .order('triggered_at', { ascending: false })
          .limit(50),
        supabase
          .from('incident_correlations')
          .select('*')
          .order('detected_at', { ascending: false })
          .limit(30),
      ]);

      if (incidentsError) throw incidentsError;

      let filteredIncidents = (incidents || []) as any[];

      // Apply filters
      if (dateRange?.from) {
        filteredIncidents = filteredIncidents.filter(
          (i) => new Date(i.created_at) >= new Date(dateRange.from!)
        );
      }
      if (dateRange?.to) {
        filteredIncidents = filteredIncidents.filter(
          (i) => new Date(i.created_at) <= new Date(dateRange.to! + 'T23:59:59')
        );
      }
      if (countryFilter && countryFilter !== 'all') {
        filteredIncidents = filteredIncidents.filter(
          (i) => i.location_country === countryFilter
        );
      }

      // Calculate overview metrics
      const totalIncidents = filteredIncidents.length;
      const verifiedIncidents = filteredIncidents.filter(
        (i) => i.verification_status === 'verified'
      ).length;
      const resolvedIncidents = filteredIncidents.filter(
        (i) => i.status === 'resolved'
      ).length;
      const criticalIncidents = filteredIncidents.filter(
        (i) => i.severity_level === 'critical'
      ).length;
      const highPriorityIncidents = filteredIncidents.filter(
        (i) => i.severity_level === 'high' || i.severity_level === 'critical'
      ).length;
      const pendingVerification = filteredIncidents.filter(
        (i) => i.verification_status === 'pending' || i.verification_status === 'unverified'
      ).length;
      const escalatedIncidents = filteredIncidents.filter(
        (i) => i.status === 'escalated'
      ).length;

      // Calculate average resolution time
      const resolvedWithDates = filteredIncidents.filter(
        (i) => i.resolution_date && i.created_at
      );
      let averageResolutionDays: number | null = null;
      if (resolvedWithDates.length > 0) {
        const totalDays = resolvedWithDates.reduce((sum, i) => {
          const created = new Date(i.created_at);
          const resolved = new Date(i.resolution_date);
          return sum + (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        }, 0);
        averageResolutionDays = Math.round((totalDays / resolvedWithDates.length) * 10) / 10;
      }

      const overview: PartnerOverviewMetrics = {
        totalIncidents,
        verifiedIncidents,
        resolvedIncidents,
        criticalIncidents,
        highPriorityIncidents,
        pendingVerification,
        escalatedIncidents,
        averageResolutionDays,
        verificationRate: totalIncidents > 0 ? Math.round((verifiedIncidents / totalIncidents) * 100) : 0,
        resolutionRate: totalIncidents > 0 ? Math.round((resolvedIncidents / totalIncidents) * 100) : 0,
      };

      // Geographic distribution
      const geoMap: Record<string, GeographicDistribution> = {};
      filteredIncidents.forEach((incident) => {
        const country = incident.location_country || 'Unknown';
        const region = incident.location_region || null;
        const key = `${country}-${region || 'unknown'}`;

        if (!geoMap[key]) {
          geoMap[key] = {
            country,
            region,
            incidentCount: 0,
            verifiedCount: 0,
            criticalCount: 0,
            riskLevel: 'low',
          };
        }

        geoMap[key].incidentCount++;
        if (incident.verification_status === 'verified') geoMap[key].verifiedCount++;
        if (incident.severity_level === 'critical') geoMap[key].criticalCount++;
      });

      const geographicDistribution = Object.values(geoMap)
        .map((geo) => ({
          ...geo,
          riskLevel:
            geo.criticalCount >= 5 ? 'critical' :
            geo.criticalCount >= 2 ? 'high' :
            geo.incidentCount >= 10 ? 'moderate' : 'low',
        }))
        .sort((a, b) => b.incidentCount - a.incidentCount);

      // Category breakdown
      const categoryMap: Record<string, { count: number; severities: Record<string, number> }> = {};
      filteredIncidents.forEach((incident) => {
        const category = incident.category || 'Other';
        if (!categoryMap[category]) {
          categoryMap[category] = { count: 0, severities: {} };
        }
        categoryMap[category].count++;
        const severity = incident.severity_level || 'unknown';
        categoryMap[category].severities[severity] = (categoryMap[category].severities[severity] || 0) + 1;
      });

      const categoryBreakdown: CategoryBreakdown[] = Object.entries(categoryMap)
        .map(([category, data]) => ({
          category,
          count: data.count,
          percentage: totalIncidents > 0 ? Math.round((data.count / totalIncidents) * 1000) / 10 : 0,
          trend: 'stable' as const,
          severityBreakdown: data.severities,
        }))
        .sort((a, b) => b.count - a.count);

      // Time series data (last 30 days)
      const timeSeriesMap: Record<string, TimeSeriesData> = {};
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = format(subDays(today, i), 'yyyy-MM-dd');
        timeSeriesMap[date] = {
          date,
          incidents: 0,
          verified: 0,
          resolved: 0,
          critical: 0,
        };
      }

      filteredIncidents.forEach((incident) => {
        const date = format(new Date(incident.created_at), 'yyyy-MM-dd');
        if (timeSeriesMap[date]) {
          timeSeriesMap[date].incidents++;
          if (incident.verification_status === 'verified') timeSeriesMap[date].verified++;
          if (incident.status === 'resolved') timeSeriesMap[date].resolved++;
          if (incident.severity_level === 'critical') timeSeriesMap[date].critical++;
        }
      });

      const timeSeriesData = Object.values(timeSeriesMap);

      // Process hotspots
      const processedHotspots: HotspotData[] = ((hotspots || []) as any[]).map((h) => ({
        id: h.id,
        region: h.region_name,
        country: h.country,
        latitude: h.latitude,
        longitude: h.longitude,
        incidentCount: h.incident_count_30d || 0,
        riskScore: h.hotspot_score || 0,
        riskLevel: h.risk_level || 'low',
        primaryCategory: h.primary_category || 'Unknown',
        trend: h.incident_trend || 'stable',
      }));

      // Risk assessment
      const criticalRatio = totalIncidents > 0 ? criticalIncidents / totalIncidents : 0;
      const escalationRatio = totalIncidents > 0 ? escalatedIncidents / totalIncidents : 0;
      const pendingRatio = totalIncidents > 0 ? pendingVerification / totalIncidents : 0;

      let riskScore = 0;
      const factors: string[] = [];
      const recommendations: string[] = [];

      if (criticalRatio > 0.1) {
        riskScore += 30;
        factors.push('High proportion of critical incidents');
        recommendations.push('Prioritize critical incident response and verification');
      }
      if (escalationRatio > 0.15) {
        riskScore += 25;
        factors.push('Elevated escalation rate');
        recommendations.push('Review escalation protocols and partner coordination');
      }
      if (pendingRatio > 0.3) {
        riskScore += 20;
        factors.push('Large verification backlog');
        recommendations.push('Increase verification capacity and streamline processes');
      }
      if (criticalIncidents >= 10) {
        riskScore += 25;
        factors.push('Significant number of critical cases');
        recommendations.push('Deploy additional resources to high-impact regions');
      }

      const riskLevel: RiskAssessment['riskLevel'] =
        riskScore >= 70 ? 'critical' :
        riskScore >= 50 ? 'high' :
        riskScore >= 25 ? 'moderate' : 'low';

      const riskAssessment: RiskAssessment = {
        riskScore: Math.min(riskScore, 100),
        riskLevel,
        factors: factors.length > 0 ? factors : ['No significant risk factors identified'],
        recommendations: recommendations.length > 0 ? recommendations : ['Continue monitoring and standard operations'],
      };

      return {
        overview,
        geographicDistribution,
        categoryBreakdown,
        timeSeriesData,
        hotspots: processedHotspots,
        riskAssessment,
        recentIncidents: filteredIncidents.slice(0, 20),
        alerts: (alerts || []) as any[],
        correlations: (correlations || []) as any[],
      };
    },
    refetchInterval: 60000,
  });
};

// ============================================================================
// COUNTRIES HOOK
// ============================================================================

export const usePartnerCountries = () => {
  return useQuery({
    queryKey: ['partner-countries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('african_countries')
        .select('code, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });
};
