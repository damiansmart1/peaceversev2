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

const CrossBorderAnalysis = ({ selectedCountry = 'all' }: CrossBorderAnalysisProps) => {
  const [activeTab, setActiveTab] = useState('correlations');

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
        query = query.contains('countries_involved', [selectedCountry]);
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
        query = query.contains('countries', [selectedCountry]);
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

  return (
    <Card className="border-border bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Cross-Border Intelligence
            </CardTitle>
            <CardDescription>
              Trans-national correlation analysis and threat network mapping
            </CardDescription>
          </div>
          <Badge variant="outline" className="animate-pulse">
            <Zap className="w-3 h-3 mr-1" />
            Live Analysis
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
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
            {correlationsLoading ? (
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
                <p>No cross-border correlations detected</p>
                <p className="text-sm mt-1">System continuously monitors for trans-national patterns</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="networks" className="space-y-4">
            {networksLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading networks...</div>
            ) : actorNetworks && actorNetworks.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {actorNetworks.map((network: any, index: number) => (
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
                          <span>{network.key_actors?.length || 0} Actors</span>
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
                <p>No actor networks identified</p>
                <p className="text-sm mt-1">Network analysis runs continuously on incoming data</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="clusters" className="space-y-4">
            {clustersLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading clusters...</div>
            ) : clusters && clusters.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {clusters.map((cluster: any, index: number) => (
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
                            {cluster.primary_category || 'Multiple Categories'} • {cluster.radius_km?.toFixed(0) || 0} km radius
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
                <p>No geographic clusters identified</p>
                <p className="text-sm mt-1">Cluster detection runs on incident density analysis</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CrossBorderAnalysis;
