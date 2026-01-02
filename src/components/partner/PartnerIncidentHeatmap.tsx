import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Map as MapIcon, 
  ZoomIn, 
  ZoomOut, 
  Layers,
  Target,
  AlertTriangle,
  TrendingUp,
  Globe
} from 'lucide-react';
import type { GeographicDistribution, HotspotData } from '@/hooks/usePartnerAnalytics';

interface PartnerIncidentHeatmapProps {
  geographicData: GeographicDistribution[];
  hotspots: HotspotData[];
  onRegionClick?: (region: string, country: string) => void;
}

// African countries with approximate coordinates for visualization
const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
  'Kenya': { lat: 0.0236, lng: 37.9062 },
  'Nigeria': { lat: 9.0820, lng: 8.6753 },
  'South Africa': { lat: -30.5595, lng: 22.9375 },
  'Ethiopia': { lat: 9.1450, lng: 40.4897 },
  'Tanzania': { lat: -6.3690, lng: 34.8888 },
  'Uganda': { lat: 1.3733, lng: 32.2903 },
  'Ghana': { lat: 7.9465, lng: -1.0232 },
  'Rwanda': { lat: -1.9403, lng: 29.8739 },
  'DRC': { lat: -4.0383, lng: 21.7587 },
  'Sudan': { lat: 12.8628, lng: 30.2176 },
  'Somalia': { lat: 5.1521, lng: 46.1996 },
  'Mali': { lat: 17.5707, lng: -3.9962 },
  'Niger': { lat: 17.6078, lng: 8.0817 },
  'Cameroon': { lat: 7.3697, lng: 12.3547 },
  'Senegal': { lat: 14.4974, lng: -14.4524 },
};

export const PartnerIncidentHeatmap = ({ 
  geographicData, 
  hotspots,
  onRegionClick 
}: PartnerIncidentHeatmapProps) => {
  const [viewMode, setViewMode] = useState<'heatmap' | 'hotspots' | 'list'>('heatmap');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Aggregate data by country
  const countryData = useMemo(() => {
    const aggregated: Record<string, {
      country: string;
      totalIncidents: number;
      criticalCount: number;
      verifiedCount: number;
      regions: GeographicDistribution[];
      riskLevel: string;
    }> = {};

    geographicData.forEach((geo) => {
      if (!aggregated[geo.country]) {
        aggregated[geo.country] = {
          country: geo.country,
          totalIncidents: 0,
          criticalCount: 0,
          verifiedCount: 0,
          regions: [],
          riskLevel: 'low',
        };
      }
      aggregated[geo.country].totalIncidents += geo.incidentCount;
      aggregated[geo.country].criticalCount += geo.criticalCount;
      aggregated[geo.country].verifiedCount += geo.verifiedCount;
      aggregated[geo.country].regions.push(geo);
    });

    // Calculate risk level
    Object.values(aggregated).forEach((country) => {
      const criticalRatio = country.criticalCount / country.totalIncidents;
      if (criticalRatio > 0.2 || country.criticalCount >= 5) {
        country.riskLevel = 'critical';
      } else if (criticalRatio > 0.1 || country.criticalCount >= 2) {
        country.riskLevel = 'high';
      } else if (country.totalIncidents >= 10) {
        country.riskLevel = 'moderate';
      }
    });

    return Object.values(aggregated).sort((a, b) => b.totalIncidents - a.totalIncidents);
  }, [geographicData]);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'moderate': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'moderate': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-green-500/10 text-green-500 border-green-500/20';
    }
  };

  const maxIncidents = Math.max(...countryData.map(c => c.totalIncidents), 1);

  return (
    <Card className="border-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-sm font-medium">Interactive Geographic Analysis</CardTitle>
              <CardDescription className="text-xs">
                Incident distribution and risk hotspots across Africa
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="heatmap" className="text-xs">
              <Layers className="w-3.5 h-3.5 mr-1" />
              Heatmap
            </TabsTrigger>
            <TabsTrigger value="hotspots" className="text-xs">
              <Target className="w-3.5 h-3.5 mr-1" />
              Hotspots
            </TabsTrigger>
            <TabsTrigger value="list" className="text-xs">
              <Globe className="w-3.5 h-3.5 mr-1" />
              Countries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="heatmap" className="mt-0">
            {/* Visual Heatmap Grid */}
            <div 
              className="relative bg-muted/30 rounded-lg p-4 overflow-hidden"
              style={{ height: '400px', transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
            >
              <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                {countryData.slice(0, 15).map((country) => {
                  const intensity = country.totalIncidents / maxIncidents;
                  const coords = COUNTRY_COORDS[country.country];
                  
                  return (
                    <div
                      key={country.country}
                      className={`relative p-3 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                        selectedCountry === country.country ? 'ring-2 ring-primary' : ''
                      }`}
                      style={{
                        backgroundColor: `rgba(${
                          country.riskLevel === 'critical' ? '239,68,68' :
                          country.riskLevel === 'high' ? '234,88,12' :
                          country.riskLevel === 'moderate' ? '202,138,4' : '34,197,94'
                        }, ${0.1 + intensity * 0.5})`,
                      }}
                      onClick={() => {
                        setSelectedCountry(country.country === selectedCountry ? null : country.country);
                        onRegionClick?.(country.regions[0]?.region || '', country.country);
                      }}
                    >
                      <p className="text-xs font-medium truncate">{country.country}</p>
                      <p className="text-lg font-bold">{country.totalIncidents}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className={`w-2 h-2 rounded-full ${getRiskColor(country.riskLevel)}`} />
                        <span className="text-[10px] text-muted-foreground capitalize">
                          {country.riskLevel}
                        </span>
                      </div>
                      {country.criticalCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 text-[10px] px-1">
                          {country.criticalCount}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="absolute bottom-2 left-2 flex items-center gap-4 p-2 rounded bg-background/80 text-[10px]">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-green-500/30" />
                  <span>Low</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-yellow-500/40" />
                  <span>Moderate</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-orange-500/50" />
                  <span>High</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-red-500/60" />
                  <span>Critical</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hotspots" className="mt-0">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {hotspots.map((hotspot) => (
                  <div
                    key={hotspot.id}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => onRegionClick?.(hotspot.region, hotspot.country)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${getRiskBadge(hotspot.riskLevel)}`}>
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{hotspot.region}</p>
                          <p className="text-xs text-muted-foreground">{hotspot.country}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge variant="outline" className={`text-[10px] ${getRiskBadge(hotspot.riskLevel)}`}>
                          Score: {hotspot.riskScore}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{hotspot.incidentCount} incidents (30d)</span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {hotspot.trend}
                      </span>
                      <span>{hotspot.primaryCategory}</span>
                    </div>
                  </div>
                ))}
                
                {hotspots.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Target className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">No active hotspots</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="list" className="mt-0">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {countryData.map((country) => (
                  <div
                    key={country.country}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedCountry(country.country === selectedCountry ? null : country.country)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getRiskBadge(country.riskLevel)}`}>
                          <Globe className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{country.country}</p>
                          <p className="text-xs text-muted-foreground">
                            {country.regions.length} region{country.regions.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold">{country.totalIncidents}</p>
                        <div className="flex items-center gap-2">
                          {country.criticalCount > 0 && (
                            <Badge variant="destructive" className="text-[10px]">
                              {country.criticalCount} critical
                            </Badge>
                          )}
                          <Badge variant="outline" className={`text-[10px] ${getRiskBadge(country.riskLevel)}`}>
                            {country.riskLevel}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {selectedCountry === country.country && (
                      <div className="mt-3 pt-3 border-t space-y-1">
                        {country.regions.map((region, i) => (
                          <div key={i} className="flex items-center justify-between text-xs p-2 rounded bg-muted/50">
                            <span>{region.region || 'Unknown Region'}</span>
                            <div className="flex items-center gap-2">
                              <span>{region.incidentCount} incidents</span>
                              <Badge variant="outline" className={`text-[10px] ${getRiskBadge(region.riskLevel)}`}>
                                {region.riskLevel}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
