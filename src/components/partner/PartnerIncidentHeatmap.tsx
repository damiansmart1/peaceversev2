import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Globe,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { usePartnerAnalytics } from '@/hooks/usePartnerAnalytics';
import { preloadGoogleMaps, getGoogleMaps } from '@/hooks/useGoogleMapsPreloader';
import type { GeographicDistribution, HotspotData } from '@/hooks/usePartnerAnalytics';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

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
  const [mapError, setMapError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const circlesRef = useRef<google.maps.Circle[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

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

  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    if (!GOOGLE_MAPS_API_KEY) {
      setMapError('Google Maps API key is not configured');
      return;
    }

    let isMounted = true;

    const mapStyles = [
      { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#8892b0' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a192f' }] },
      { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#112240' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1d3461' }] },
      { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
    ];

    const initMap = (google: typeof window.google) => {
      if (!isMounted || !mapRef.current || mapInstanceRef.current) return;
      
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 5, lng: 20 },
        zoom: 3,
        minZoom: 2,
        maxZoom: 12,
        mapTypeId: 'roadmap',
        gestureHandling: 'greedy',
        styles: mapStyles,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });
      
      mapInstanceRef.current = map;
      infoWindowRef.current = new google.maps.InfoWindow({ maxWidth: 320 });
      setMapLoaded(true);
      setMapError(null);
    };

    // Check if already loaded (from preload)
    const existingGoogle = getGoogleMaps();
    if (existingGoogle) {
      initMap(existingGoogle);
      return;
    }

    // Load if not already loaded
    preloadGoogleMaps().then((google) => {
      if (!isMounted || !google) {
        if (isMounted && !google) {
          setMapError('Failed to load Google Maps');
        }
        return;
      }
      initMap(google);
    }).catch(error => {
      if (!isMounted) return;
      console.error('Error loading Google Maps:', error);
      setMapError('Failed to load map');
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    // Clear existing markers and circles
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    circlesRef.current.forEach(circle => circle.setMap(null));
    circlesRef.current = [];

    const riskColors: Record<string, string> = {
      critical: '#dc2626',
      high: '#f97316',
      moderate: '#eab308',
      low: '#22c55e',
    };

    const bounds = new google.maps.LatLngBounds();
    let hasValidLocations = false;

    countryData.forEach((country) => {
      const coords = COUNTRY_COORDS[country.country];
      if (!coords) return;

      hasValidLocations = true;
      const position = { lat: coords.lat, lng: coords.lng };
      bounds.extend(position);

      const color = riskColors[country.riskLevel] || '#22c55e';
      const scale = Math.min(30, 10 + (country.totalIncidents / 5));

      // Create circle to show impact area
      const circle = new google.maps.Circle({
        map: mapInstanceRef.current,
        center: position,
        radius: Math.min(500000, 100000 + (country.totalIncidents * 10000)),
        fillColor: color,
        fillOpacity: 0.15,
        strokeColor: color,
        strokeOpacity: 0.4,
        strokeWeight: 2,
      });
      circlesRef.current.push(circle);

      // Create marker
      const marker = new google.maps.Marker({
        map: mapInstanceRef.current,
        position,
        title: `${country.country}: ${country.totalIncidents} incidents`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: scale,
          fillColor: color,
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        label: {
          text: String(country.totalIncidents),
          color: '#ffffff',
          fontSize: '11px',
          fontWeight: 'bold',
        },
      });

      marker.addListener('click', () => {
        setSelectedCountry(country.country);
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(`
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
          `);
          infoWindowRef.current.open(mapInstanceRef.current, marker);
        }
        onRegionClick?.(country.regions[0]?.region || '', country.country);
      });

      markersRef.current.push(marker);
    });

    if (hasValidLocations && markersRef.current.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, 50);
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
            {mapError || !GOOGLE_MAPS_API_KEY ? (
              <div className="h-[400px] flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center space-y-2 p-4">
                  <AlertTriangle className="w-12 h-12 mx-auto text-destructive" />
                  <p className="text-sm font-medium text-destructive">
                    {mapError || 'Google Maps API key not configured'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Please configure VITE_GOOGLE_MAPS_API_KEY
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div 
                  ref={mapRef} 
                  className="w-full h-[400px] rounded-lg overflow-hidden bg-muted"
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
                  <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg border">
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
            )}
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
});