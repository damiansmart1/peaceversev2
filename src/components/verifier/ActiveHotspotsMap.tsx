import { useState, useEffect, useRef, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MapPin, AlertTriangle, TrendingUp, Eye, Flame, 
  ChevronRight, RefreshCw, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { preloadGoogleMaps, getGoogleMaps } from '@/hooks/useGoogleMapsPreloader';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface Hotspot {
  id: string;
  name: string;
  country: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  incidentCount: number;
  trend: 'rising' | 'stable' | 'falling';
  lat: number;
  lng: number;
  lastUpdate: string;
}

export const ActiveHotspotsMap = memo(() => {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circlesRef = useRef<any[]>([]);

  useEffect(() => {
    const fetchHotspots = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from('predictive_hotspots')
          .select('*')
          .eq('status', 'active')
          .order('hotspot_score', { ascending: false })
          .limit(10);

        if (data) {
          setHotspots(data.map(h => ({
            id: h.id,
            name: h.region_name,
            country: h.country,
            riskLevel: h.risk_level as any,
            incidentCount: h.incident_count_30d || 0,
            trend: h.incident_trend === 'increasing' ? 'rising' : 
                   h.incident_trend === 'decreasing' ? 'falling' : 'stable',
            lat: Number(h.latitude),
            lng: Number(h.longitude),
            lastUpdate: new Date(h.last_updated || h.predicted_at).toLocaleString(),
          })));
        }
      } catch (error) {
        console.error('Error fetching hotspots:', error);
        // Use mock data if no data exists
        setHotspots([
          {
            id: '1',
            name: 'Nairobi Central',
            country: 'Kenya',
            riskLevel: 'high',
            incidentCount: 45,
            trend: 'rising',
            lat: -1.2921,
            lng: 36.8219,
            lastUpdate: new Date().toLocaleString(),
          },
          {
            id: '2',
            name: 'Lagos Island',
            country: 'Nigeria',
            riskLevel: 'critical',
            incidentCount: 78,
            trend: 'stable',
            lat: 6.4541,
            lng: 3.3947,
            lastUpdate: new Date().toLocaleString(),
          },
          {
            id: '3',
            name: 'Kampala Metro',
            country: 'Uganda',
            riskLevel: 'medium',
            incidentCount: 23,
            trend: 'falling',
            lat: 0.3476,
            lng: 32.5825,
            lastUpdate: new Date().toLocaleString(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotspots();
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRiskBorderColor = (level: string) => {
    switch (level) {
      case 'critical': return 'border-red-500/50 bg-red-500/5';
      case 'high': return 'border-orange-500/50 bg-orange-500/5';
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/5';
      case 'low': return 'border-green-500/50 bg-green-500/5';
      default: return 'border-gray-500/50 bg-gray-500/5';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'falling': return <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />;
      default: return <div className="w-4 h-1 bg-gray-400 rounded" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="w-5 h-5 text-orange-500" />
            Active Hotspots
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsLoading(true)}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-6 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Loading hotspots...</p>
            </div>
          ) : hotspots.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No active hotspots detected</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {hotspots.map((hotspot, index) => (
                <motion.div
                  key={hotspot.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md ${getRiskBorderColor(hotspot.riskLevel)} ${
                    selectedHotspot === hotspot.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedHotspot(hotspot.id === selectedHotspot ? null : hotspot.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getRiskColor(hotspot.riskLevel)}>
                          {hotspot.riskLevel.toUpperCase()}
                        </Badge>
                        {getTrendIcon(hotspot.trend)}
                      </div>
                      <h4 className="font-medium">{hotspot.name}</h4>
                      <p className="text-sm text-muted-foreground">{hotspot.country}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm font-bold">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        {hotspot.incidentCount}
                      </div>
                      <p className="text-xs text-muted-foreground">incidents</p>
                    </div>
                  </div>
                  
                  {selectedHotspot === hotspot.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t space-y-2"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Coordinates</span>
                        <span className="font-mono text-xs">
                          {hotspot.lat.toFixed(4)}, {hotspot.lng.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span className="text-xs">{hotspot.lastUpdate}</span>
                      </div>
                      <Button size="sm" className="w-full mt-2 gap-2">
                        <Eye className="w-4 h-4" />
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
});
