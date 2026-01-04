import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Map as MapIcon, 
  Layers,
  Target,
  AlertTriangle,
  TrendingUp,
  Globe,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { usePartnerAnalytics } from '@/hooks/usePartnerAnalytics';
import type { GeographicDistribution, HotspotData } from '@/hooks/usePartnerAnalytics';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface PartnerIncidentHeatmapProps {
  geographicData?: GeographicDistribution[];
  hotspots?: HotspotData[];
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

export const PartnerIncidentHeatmap = memo(({ 
  geographicData: propGeoData, 
  hotspots: propHotspots,
  onRegionClick 
}: PartnerIncidentHeatmapProps) => {
  const { data: analytics, refetch } = usePartnerAnalytics();
  
  const geographicData = propGeoData || analytics?.geographicDistribution || [];
  const hotspots = propHotspots || analytics?.hotspots || [];
  const [viewMode, setViewMode] = useState<'map' | 'hotspots' | 'list'>('map');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const circlesRef = useRef<L.Circle[]>([]);

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

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [5, 20],
      zoom: 3,
      minZoom: 2,
      maxZoom: 12,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    // Dark theme tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    mapInstanceRef.current = map;
    setMapLoaded(true);

    return () => {
      // Don't destroy on cleanup
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    // Clear existing markers and circles
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    circlesRef.current.forEach(circle => circle.remove());
    circlesRef.current = [];

    const riskColors: Record<string, string> = {
      critical: '#dc2626',
      high: '#f97316',
      moderate: '#eab308',
      low: '#22c55e',
    };

    const validLocations: [number, number][] = [];

    countryData.forEach((country) => {
      const coords = COUNTRY_COORDS[country.country];
      if (!coords) return;

      validLocations.push([coords.lat, coords.lng]);
      const color = riskColors[country.riskLevel] || '#22c55e';
      const scale = Math.min(30, 10 + (country.totalIncidents / 5));

      // Create circle to show impact area
      const circle = L.circle([coords.lat, coords.lng], {
        radius: Math.min(500000, 100000 + (country.totalIncidents * 10000)),
        fillColor: color,
        fillOpacity: 0.15,
        color: color,
        weight: 2,
      }).addTo(mapInstanceRef.current!);
      circlesRef.current.push(circle);

      // Create marker
      const marker = L.circleMarker([coords.lat, coords.lng], {
        radius: scale,
        fillColor: color,
        fillOpacity: 0.9,
        color: '#ffffff',
        weight: 2,
      }).addTo(mapInstanceRef.current!);

      marker.bindPopup(`
        <div style="padding: 12px; min-width: 220px; font-family: system-ui, sans-serif;">
          <div style="font-weight: 700; font-size: 16px; margin-bottom: 12px; color: #1a1a1a;">
            ${country.country}
          </div>
          <div style="display: grid; gap: 8px; font-size: 13px;">
            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5e5e5;">
              <span style="color: #666;">Total Incidents</span>
              <strong style="color: #1a1a1a;">${country.totalIncidents}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5e5e5;">
              <span style="color: #666;">Critical</span>
              <strong style="color: #dc2626;">${country.criticalCount}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5e5e5;">
              <span style="color: #666;">Verified</span>
              <strong style="color: #22c55e;">${country.verifiedCount}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 6px 0;">
              <span style="color: #666;">Risk Level</span>
              <strong style="color: ${color}; text-transform: uppercase;">${country.riskLevel}</strong>
            </div>
          </div>
          <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666;">
            ${country.regions.length} region${country.regions.length !== 1 ? 's' : ''} affected
          </div>
        </div>
      `, { maxWidth: 320 });

      marker.on('click', () => {
        setSelectedCountry(country.country);
        onRegionClick?.(country.regions[0]?.region || '', country.country);
      });

      // Add label
      const labelIcon = L.divIcon({
        className: 'custom-label',
        html: `<div style="color: white; font-size: 11px; font-weight: bold; text-align: center;">${country.totalIncidents}</div>`,
        iconSize: [scale * 2, scale],
        iconAnchor: [scale, scale / 2],
      });
      L.marker([coords.lat, coords.lng], { icon: labelIcon, interactive: false }).addTo(mapInstanceRef.current!);

      markersRef.current.push(marker);
    });

    if (validLocations.length > 0) {
      const bounds = L.latLngBounds(validLocations);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [countryData, mapLoaded, onRegionClick]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

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
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="map" className="text-xs">
              <Layers className="w-3.5 h-3.5 mr-1" />
              Map
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

          <TabsContent value="map" className="mt-0">
            <div className="relative">
              <div 
                ref={mapRef} 
                className="w-full h-[400px] rounded-lg overflow-hidden bg-muted"
                style={{ zIndex: 1 }}
              />
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
                  <div className="text-center space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground">Loading map...</p>
                  </div>
                </div>
              )}
              {/* Legend */}
              {mapLoaded && (
                <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg border z-[1000]">
                  <p className="font-semibold text-xs mb-2">Risk Level</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span>Critical</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      <span>High</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span>Moderate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span>Low</span>
                    </div>
                  </div>
                </div>
              )}
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
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No active hotspots detected</p>
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
                    onClick={() => onRegionClick?.(country.regions[0]?.region || '', country.country)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-8 rounded-full ${getRiskColor(country.riskLevel)}`} />
                        <div>
                          <p className="text-sm font-medium">{country.country}</p>
                          <p className="text-xs text-muted-foreground">
                            {country.regions.length} region{country.regions.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold">{country.totalIncidents}</p>
                        <p className="text-xs text-muted-foreground">
                          {country.criticalCount} critical
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {countryData.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No geographic data available</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});

PartnerIncidentHeatmap.displayName = 'PartnerIncidentHeatmap';

export default PartnerIncidentHeatmap;
