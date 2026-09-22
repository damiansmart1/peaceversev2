import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  ArrowRightLeft, 
  AlertTriangle, 
  Network, 
  TrendingUp,
  MapPin,
  Clock,
  Users,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { format } from 'date-fns';

interface CrossBorderAnalysisProps {
  selectedCountry?: string;
  selectedCountryName?: string;
}

interface Correlation {
  id: string;
  primaryCountry: string;
  relatedCountry: string;
  correlationType: string;
  strength: number;
  pattern: string;
  incidentCount: number;
  lastDetected: string;
  riskLevel: string;
}

const CrossBorderAnalysis = ({ selectedCountry = 'all', selectedCountryName = 'All African countries' }: CrossBorderAnalysisProps) => {
  const [activeTab, setActiveTab] = useState('correlations');
  const countryFilter = selectedCountry === 'all' ? null : selectedCountryName;

  // Fetch cross-border correlations from database
  const { data: correlations, isLoading: correlationsLoading } = useQuery({
    queryKey: ['cross-border-correlations', selectedCountry],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incident_correlations')
        .select(`
          *,
          primary_incident:citizen_reports!incident_correlations_primary_incident_id_fkey(
            id, title, location_country, location_city
          ),
          related_incident:citizen_reports!incident_correlations_related_incident_id_fkey(
            id, title, location_country, location_city
          )
        `)
        .eq('cross_border', true)
        .order('detected_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    }
  });

  // Current incident records provide an accurate operational fallback while
  // model-generated correlation, network, and cluster tables are still empty.
  const { data: incidentSignals, isLoading: incidentsLoading } = useQuery({
    queryKey: ['cross-border-incident-signals', countryFilter],
    queryFn: async () => {
      let query = supabase
        .from('citizen_reports')
        .select('id, title, category, severity_level, status, location_country, location_region, location_city, incident_date, created_at, estimated_people_affected')
        .not('location_country', 'is', null)
        .order('incident_date', { ascending: false, nullsFirst: false })
        .limit(250);

      if (countryFilter) query = query.eq('location_country', countryFilter);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 60_000,
  });

  // Fetch actor networks for cross-border analysis
  const { data: actorNetworks, isLoading: networksLoading } = useQuery({
    queryKey: ['actor-networks', selectedCountry],
    queryFn: async () => {
      let query = supabase
        .from('actor_networks')
        .select('*')
        .order('last_activity', { ascending: false })
        .limit(10);

      if (selectedCountry !== 'all') {
        query = query.contains('countries_involved', [selectedCountryName]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch geographic clusters
  const { data: clusters, isLoading: clustersLoading } = useQuery({
    queryKey: ['geographic-clusters', selectedCountry],
    queryFn: async () => {
      let query = supabase
        .from('geographic_clusters')
        .select('*')
        .order('cluster_risk_score', { ascending: false })
        .limit(10);

      if (selectedCountry !== 'all') {
        query = query.contains('countries', [selectedCountryName]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical':
      case 'imminent':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 0.8) return 'text-red-500';
    if (strength >= 0.6) return 'text-orange-500';
    if (strength >= 0.4) return 'text-yellow-500';
    return 'text-green-500';
  };

  const reports = incidentSignals || [];
  const reportCount = reports.length;
  const verifiedCount = reports.filter((report: any) => report.status === 'verified').length;
  const affectedCount = reports.reduce(
    (total: number, report: any) => total + (Number(report.estimated_people_affected) || 0),
    0,
  );
  const lastUpdated = reports
    .map((report: any) => report.incident_date || report.created_at)
    .filter(Boolean)
    .sort()
    .at(-1);

  const derivedClusters = Object.values(
    reports.reduce((groups: Record<string, any>, report: any) => {
      const place = report.location_region || report.location_city || report.location_country || 'Unspecified area';
      const existing = groups[place] || {
        id: place,
        cluster_name: place,
        primary_category: report.category || 'Multiple categories',
        radius_km: null,
        incident_count: 0,
        countries: [] as string[],
        cluster_risk_score: 0,
        affected_population: 0,
        is_expanding: false,
      };
      existing.incident_count += 1;
      existing.affected_population += Number(report.estimated_people_affected) || 0;
      if (report.location_country && !existing.countries.includes(report.location_country)) {
        existing.countries.push(report.location_country);
      }
      const severityScore: Record<string, number> = { critical: 100, high: 75, medium: 50, low: 25 };
      existing.cluster_risk_score = Math.max(existing.cluster_risk_score, severityScore[report.severity_level] || 25);
      existing.is_expanding = existing.incident_count >= 3;
      groups[place] = existing;
      return groups;
    }, {}),
  ).sort((a: any, b: any) => b.cluster_risk_score - a.cluster_risk_score || b.incident_count - a.incident_count).slice(0, 10);

  const derivedNetworks = Object.values(
    reports.reduce((groups: Record<string, any>, report: any) => {
      const category = report.category || 'Unclassified';
      const existing = groups[category] || {
        id: category,
        network_name: `${category.replace(/_/g, ' ')} signal pattern`,
        network_type: 'observed incident',
        countries_involved: [] as string[],
        key_actors: [] as string[],
        primary_locations: [] as string[],
        network_threat_level: 'low',
        last_activity: report.incident_date || report.created_at,
      };
      const location = report.location_region || report.location_city;
      if (report.location_country && !existing.countries_involved.includes(report.location_country)) existing.countries_involved.push(report.location_country);
      if (location && !existing.primary_locations.includes(location)) existing.primary_locations.push(location);
      const severityRank: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
      if ((severityRank[report.severity_level] || 0) > (severityRank[existing.network_threat_level] || 0)) {
        existing.network_threat_level = report.severity_level;
      }
      groups[category] = existing;
      return groups;
    }, {}),
  ).slice(0, 10);

  const displayedNetworks = actorNetworks?.length ? actorNetworks : derivedNetworks;
  const displayedClusters = clusters?.length ? clusters : derivedClusters;

  return (
    <Card className="border-border bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Cross-Border Intelligence
            </CardTitle>
            <CardDescription>
              Trans-national correlation analysis and threat network mapping
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit animate-pulse">
            <Zap className="w-3 h-3 mr-1" />
            Live Analysis
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="rounded-md border border-border bg-muted/20 p-3">
            <p className="text-xl font-bold text-foreground">{reportCount}</p>
            <p className="text-xs text-muted-foreground">Incident records</p>
          </div>
          <div className="rounded-md border border-border bg-muted/20 p-3">
            <p className="text-xl font-bold text-foreground">{verifiedCount}</p>
            <p className="text-xs text-muted-foreground">Verified</p>
          </div>
          <div className="rounded-md border border-border bg-muted/20 p-3">
            <p className="text-xl font-bold text-foreground">{affectedCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">People affected</p>
          </div>
          <div className="rounded-md border border-border bg-muted/20 p-3">
            <p className="text-sm font-semibold text-foreground">{lastUpdated ? format(new Date(lastUpdated), 'MMM d, yyyy') : 'No dated records'}</p>
            <p className="text-xs text-muted-foreground">Latest incident</p>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid h-auto grid-cols-1 gap-1 sm:grid-cols-3 w-full">
            <TabsTrigger value="correlations" className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              Correlations
            </TabsTrigger>
            <TabsTrigger value="networks" className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              Actor Networks
            </TabsTrigger>
            <TabsTrigger value="clusters" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Clusters
            </TabsTrigger>
          </TabsList>

          <TabsContent value="correlations" className="space-y-4">
            {correlationsLoading || incidentsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading correlations...</div>
            ) : correlations && correlations.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {correlations.map((correlation: any, index: number) => (
                    <motion.div
                      key={correlation.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Badge variant="outline" className="bg-primary/10">
                              {correlation.primary_incident?.location_country || 'Unknown'}
                            </Badge>
                            <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                            <Badge variant="outline" className="bg-primary/10">
                              {correlation.related_incident?.location_country || 'Unknown'}
                            </Badge>
                          </div>
                        </div>
                        <Badge className={getRiskColor(correlation.pattern_detected || 'low')}>
                          {correlation.pattern_detected || 'Pattern Detected'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p className="font-medium capitalize">{correlation.correlation_type}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Strength</p>
                          <p className={`font-medium ${getStrengthColor(correlation.correlation_strength || 0)}`}>
                            {((correlation.correlation_strength || 0) * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Distance</p>
                          <p className="font-medium">{correlation.geographic_distance_km?.toFixed(0) || 'N/A'} km</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Time Gap</p>
                          <p className="font-medium">{correlation.temporal_distance_hours?.toFixed(0) || 'N/A'} hrs</p>
                        </div>
                      </div>

                      {correlation.ai_analysis && (
                        <div className="mt-3 p-2 rounded bg-primary/5 text-xs">
                          <p className="text-muted-foreground">AI Insight: {
                            typeof correlation.ai_analysis === 'object' 
                              ? correlation.ai_analysis.summary || JSON.stringify(correlation.ai_analysis).substring(0, 100)
                              : String(correlation.ai_analysis).substring(0, 100)
                          }</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No validated cross-border correlations detected</p>
                <p className="text-sm mt-1">Showing only confirmed analytical links—not inferred relationships</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="networks" className="space-y-4">
            {networksLoading || incidentsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading networks...</div>
            ) : displayedNetworks.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {displayedNetworks.map((network: any, index: number) => (
                    <motion.div
                      key={network.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg border border-border bg-muted/30"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{network.network_name || 'Unknown Network'}</h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            {network.network_type || 'Unclassified'} Network
                          </p>
                        </div>
                        <Badge className={getRiskColor(network.network_threat_level)}>
                          {network.network_threat_level || 'Unknown'} Threat
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {network.countries_involved?.map((country: string) => (
                          <Badge key={country} variant="secondary" className="text-xs">
                            {country}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{network.key_actors?.length || 0} Named actors</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{network.primary_locations?.length || 0} Locations</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{network.last_activity ? format(new Date(network.last_activity), 'MMM d') : 'N/A'}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No incident patterns identified</p>
                <p className="text-sm mt-1">Pattern analysis updates as reports are received</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="clusters" className="space-y-4">
            {clustersLoading || incidentsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading clusters...</div>
            ) : displayedClusters.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {displayedClusters.map((cluster: any, index: number) => (
                    <motion.div
                      key={cluster.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg border border-border bg-muted/30"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{cluster.cluster_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {cluster.primary_category || 'Multiple Categories'}{cluster.radius_km ? ` • ${cluster.radius_km.toFixed(0)} km radius` : ' • Reported area'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{cluster.incident_count || 0}</div>
                          <p className="text-xs text-muted-foreground">Incidents</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {cluster.countries?.map((country: string) => (
                          <Badge key={country} variant="secondary" className="text-xs">
                            {country}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Risk Score</p>
                          <p className={`font-semibold ${getStrengthColor((cluster.cluster_risk_score || 0) / 100)}`}>
                            {cluster.cluster_risk_score?.toFixed(0) || 0}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Affected Pop.</p>
                          <p className="font-semibold">
                            {cluster.affected_population ? (cluster.affected_population / 1000).toFixed(0) + 'K' : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Trend</p>
                          <div className="flex items-center gap-1">
                            {cluster.is_expanding ? (
                              <>
                                <TrendingUp className="w-4 h-4 text-red-500" />
                                <span className="text-red-500 font-semibold">Expanding</span>
                              </>
                            ) : (
                              <>
                                <span className="text-green-500 font-semibold">Stable</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No geographic incident groups identified</p>
                <p className="text-sm mt-1">Location grouping updates as reports are received</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CrossBorderAnalysis;
