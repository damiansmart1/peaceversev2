import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, MapPin, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import RecommendedActionsPanel from './RecommendedActionsPanel';
import { useEffect, useRef, useState } from 'react';
import { preloadGoogleMaps, isGoogleMapsReady } from '@/hooks/useGoogleMapsPreloader';

interface PredictiveHotspotMapProps {
  selectedCountry?: string;
}

const PredictiveHotspotMap = ({ selectedCountry = 'ALL' }: PredictiveHotspotMapProps) => {
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const circlesRef = useRef<google.maps.Circle[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<any>(null);
  const initAttemptedRef = useRef(false);

  const { data: hotspots, isLoading, refetch } = useQuery({
    queryKey: ['predictive-hotspots', selectedCountry],
    queryFn: async () => {
      let query = supabase
        .from('predictive_hotspots')
        .select('*')
        .eq('status', 'active')
        .gte('valid_until', new Date().toISOString())
        .order('hotspot_score', { ascending: false });

      if (selectedCountry !== 'ALL') {
        query = query.eq('country', selectedCountry);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Initialize map
  useEffect(() => {
    if (initAttemptedRef.current || !mapRef.current) return;
    initAttemptedRef.current = true;

    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_MAPS_API_KEY) {
      setMapError('Google Maps API key is not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your environment secrets.');
      return;
    }

    const initMap = async () => {
      try {
        if (!isGoogleMapsReady()) {
          await preloadGoogleMaps();
        }

        if (!window.google || !mapRef.current) {
          setMapError('Failed to load Google Maps. Please check your API key configuration.');
          return;
        }

        const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        await google.maps.importLibrary("marker");

        mapInstanceRef.current = new Map(mapRef.current, {
          center: { lat: 0, lng: 20 }, // Center on Africa
          zoom: 3,
          mapTypeId: 'terrain',
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#8892b0' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a192f' }] },
            { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#112240' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1d3461' }] },
            { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
          ],
          mapId: 'hotspot-map',
        });

        setMapLoaded(true);
      } catch (error) {
        console.error('Map initialization error:', error);
        setMapError('Failed to initialize the map. Please try refreshing the page.');
      }
    };

    initMap();
  }, []);

  // Update markers when hotspots change
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !hotspots) return;

    // Clear existing markers and circles
    markersRef.current.forEach(marker => marker.map = null);
    markersRef.current = [];
    circlesRef.current.forEach(circle => circle.setMap(null));
    circlesRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    let hasValidLocations = false;

    hotspots.forEach((hotspot: any) => {
      if (!hotspot.latitude || !hotspot.longitude) return;
      
      const position = { lat: Number(hotspot.latitude), lng: Number(hotspot.longitude) };
      bounds.extend(position);
      hasValidLocations = true;

      // Get color based on risk level
      const riskColors: Record<string, string> = {
        critical: '#dc2626',
        severe: '#ef4444',
        high: '#f97316',
        moderate: '#eab308',
        low: '#22c55e',
      };
      const color = riskColors[hotspot.risk_level] || '#22c55e';

      // Create circle to show radius
      const circle = new google.maps.Circle({
        map: mapInstanceRef.current,
        center: position,
        radius: (hotspot.radius_km || 10) * 1000, // Convert km to meters
        fillColor: color,
        fillOpacity: 0.2,
        strokeColor: color,
        strokeOpacity: 0.6,
        strokeWeight: 2,
      });
      circlesRef.current.push(circle);

      // Create marker
      const markerDiv = document.createElement('div');
      markerDiv.innerHTML = `
        <div style="
          background: ${color};
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          cursor: pointer;
          transition: transform 0.2s;
        ">
          ${hotspot.hotspot_score}%
        </div>
      `;
      markerDiv.addEventListener('mouseenter', () => {
        markerDiv.firstElementChild?.setAttribute('style', markerDiv.firstElementChild.getAttribute('style')?.replace('transform: scale(1)', 'transform: scale(1.2)') || '');
      });

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapInstanceRef.current,
        position,
        content: markerDiv,
        title: `${hotspot.region_name}, ${hotspot.country}`,
      });

      marker.addListener('click', () => {
        setSelectedHotspot(hotspot);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if we have valid locations
    if (hasValidLocations && markersRef.current.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, 50);
      if (markersRef.current.length === 1) {
        mapInstanceRef.current.setZoom(8);
      }
    }
  }, [hotspots, mapLoaded]);

  const handleRunPrediction = async () => {
    toast({
      title: 'Running Hotspot Analysis',
      description: 'Analyzing historical patterns to predict future conflict hotspots...',
    });

    try {
      const { error } = await supabase.functions.invoke('predict-hotspots', {
        body: { predictionDays: 14 }
      });

      if (error) throw error;

      toast({
        title: 'Analysis Complete',
        description: 'Hotspot predictions have been updated.',
      });

      refetch();
    } catch (error) {
      console.error('Prediction error:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Failed to run hotspot prediction. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-600 text-white';
      case 'severe': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'moderate': return 'bg-yellow-500 text-black';
      default: return 'bg-green-500 text-white';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading Hotspot Predictions...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Interactive Map */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Predictive Conflict Hotspots Map</CardTitle>
              <CardDescription>
                AI-powered visualization of areas with elevated risk of conflict escalation
              </CardDescription>
            </div>
            <Button onClick={handleRunPrediction}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Run Analysis
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {mapError ? (
            <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center space-y-2">
                <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
                <p className="text-destructive font-medium">{mapError}</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div 
                ref={mapRef} 
                className="w-full h-[400px] rounded-lg overflow-hidden"
                style={{ minHeight: '400px' }}
              />
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/80 rounded-lg">
                  <div className="text-center space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground">Loading map...</p>
                  </div>
                </div>
              )}
              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg border">
                <p className="font-semibold text-xs mb-2">Risk Level</p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-600" />
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Hotspot Details */}
      {selectedHotspot && (
        <Card className="border-2 border-primary">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4" />
                  <CardTitle className="text-lg">
                    {selectedHotspot.region_name}, {selectedHotspot.country}
                  </CardTitle>
                </div>
                <CardDescription>
                  Radius: {selectedHotspot.radius_km}km | Coverage: {selectedHotspot.prediction_window?.replace('_', ' ')}
                </CardDescription>
              </div>
              <Badge className={getRiskColor(selectedHotspot.risk_level)}>
                {selectedHotspot.risk_level?.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-muted p-3 rounded">
                <p className="text-muted-foreground">Hotspot Score</p>
                <p className="text-2xl font-bold">{selectedHotspot.hotspot_score}%</p>
              </div>
              <div className="bg-muted p-3 rounded">
                <p className="text-muted-foreground">Confidence</p>
                <p className="text-2xl font-bold">{selectedHotspot.confidence_level}%</p>
              </div>
              <div className="bg-muted p-3 rounded">
                <p className="text-muted-foreground">Incidents (30d)</p>
                <p className="text-2xl font-bold">{selectedHotspot.incident_count_30d}</p>
              </div>
              <div className="bg-muted p-3 rounded">
                <p className="text-muted-foreground">Trend</p>
                <p className="text-xl font-bold capitalize">{selectedHotspot.incident_trend}</p>
              </div>
            </div>

            {selectedHotspot.prediction_factors && (
              <div className="bg-muted/50 p-4 rounded space-y-2">
                <p className="font-semibold text-sm">Prediction Factors:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {Object.entries(selectedHotspot.prediction_factors).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-semibold">{value as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedHotspot.recommended_interventions && selectedHotspot.recommended_interventions.length > 0 && (
              <RecommendedActionsPanel 
                actions={selectedHotspot.recommended_interventions.map((intervention: any) => ({
                  action: intervention.action || intervention.intervention,
                  priority: intervention.priority || 'medium',
                  target: intervention.target || 'Government Authorities',
                  category: intervention.category || 'government',
                  timeframe: intervention.timeframe || intervention.timing || 'Within 1 week',
                  rationale: intervention.rationale,
                  resources: intervention.resources,
                  kpis: intervention.kpis
                }))}
                threatLevel={selectedHotspot.risk_level}
              />
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Valid until: {new Date(selectedHotspot.valid_until).toLocaleDateString()}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedHotspot(null)}>
                Close Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hotspot List */}
      {hotspots && hotspots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Active Hotspots ({hotspots.length})</CardTitle>
            <CardDescription>Click on a hotspot for detailed information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hotspots.map((hotspot: any) => (
                <div 
                  key={hotspot.id} 
                  className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedHotspot(hotspot)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="font-semibold">{hotspot.region_name}</span>
                    </div>
                    <Badge className={getRiskColor(hotspot.risk_level)} variant="secondary">
                      {hotspot.risk_level}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{hotspot.country}</p>
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span>Score: <strong>{hotspot.hotspot_score}%</strong></span>
                    <span>Incidents: <strong>{hotspot.incident_count_30d}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {(!hotspots || hotspots.length === 0) && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="font-semibold text-lg">No Active Hotspots Detected</h3>
                <p className="text-muted-foreground">
                  Click "Run Analysis" to generate new predictions based on recent incident data
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PredictiveHotspotMap;