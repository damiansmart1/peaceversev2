import { useEffect, useRef, useState, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, MapPin, AlertTriangle, Activity, Users, Calendar, FileText, MapPinned, Globe } from 'lucide-react';
import { useIncidentHeatmapData, HeatmapIncident } from '@/hooks/useIncidentHeatmapData';
import { useIncidentNotifications } from '@/hooks/useIncidentNotifications';
import { useCountriesByBlock } from '@/hooks/usePeaceMetrics';
import { exportToJSON, exportToCSV, exportToPDF, exportToWord } from '@/lib/exportUtils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const SEVERITY_LEVELS = [
  { value: 'all', label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const InteractiveHeatmap = memo(() => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);

  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedIncident, setSelectedIncident] = useState<HeatmapIncident | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<'markers' | 'heatmap'>('markers');

  const { data: countriesByBlock, isLoading: countriesLoading } = useCountriesByBlock();

  const { data: incidents, isLoading } = useIncidentHeatmapData(
    selectedCountry === 'all' ? undefined : selectedCountry,
    selectedSeverity === 'all' ? undefined : selectedSeverity
  );
  
  const { userLocation, locationPermission } = useIncidentNotifications(50);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [0, 20],
      zoom: 4,
      minZoom: 2,
      maxZoom: 18,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    // Add OpenStreetMap tiles (free, no billing required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    mapInstanceRef.current = map;
    setMapLoaded(true);

    return () => {
      // Don't destroy map on cleanup to prevent flickering
    };
  }, []);
  
  // Update user location marker when location changes
  useEffect(() => {
    if (userLocation && mapInstanceRef.current && mapLoaded && !userMarkerRef.current) {
      userMarkerRef.current = L.circleMarker([userLocation.latitude, userLocation.longitude], {
        radius: 10,
        fillColor: '#4F46E5',
        fillOpacity: 1,
        color: '#ffffff',
        weight: 2,
      }).addTo(mapInstanceRef.current);

      userMarkerRef.current.bindPopup(`
        <div style="padding: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 18px;">📍</span>
            <strong style="color: #4F46E5;">Your Location</strong>
          </div>
          <p style="color: #666; font-size: 14px; margin: 0;">
            Monitoring critical incidents within 50km radius
          </p>
        </div>
      `);
    }
  }, [userLocation, mapLoaded]);

  // Update markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !incidents || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Create markers
    incidents.forEach(incident => {
      if (!incident.geo_location?.latitude || !incident.geo_location?.longitude) return;

      const marker = L.circleMarker(
        [incident.geo_location.latitude, incident.geo_location.longitude],
        {
          radius: getSeverityScale(incident.severity),
          fillColor: getSeverityColor(incident.severity),
          fillOpacity: 0.8,
          color: '#ffffff',
          weight: 2,
        }
      ).addTo(mapInstanceRef.current!);

      const popupContent = `
        <div style="padding: 12px; max-width: 320px; font-family: system-ui, -apple-system, sans-serif;">
          <h3 style="font-weight: 700; margin-bottom: 12px; color: #1a1a1a; font-size: 16px; line-height: 1.4;">${incident.title}</h3>
          <div style="display: grid; gap: 8px;">
            <div style="display: flex; gap: 8px;">
              <span style="font-weight: 600; color: #666; min-width: 80px;">Type:</span>
              <span style="color: #1a1a1a;">${incident.incident_type}</span>
            </div>
            <div style="display: flex; gap: 8px;">
              <span style="font-weight: 600; color: #666; min-width: 80px;">Severity:</span>
              <span style="color: ${getSeverityColor(incident.severity)}; font-weight: 700; text-transform: uppercase;">${incident.severity}</span>
            </div>
            <div style="display: flex; gap: 8px;">
              <span style="font-weight: 600; color: #666; min-width: 80px;">Status:</span>
              <span style="color: #1a1a1a; text-transform: capitalize;">${incident.status.replace('_', ' ')}</span>
            </div>
            <div style="display: flex; gap: 8px;">
              <span style="font-weight: 600; color: #666; min-width: 80px;">Location:</span>
              <span style="color: #1a1a1a;">${incident.geo_location?.location_name || 'Unknown'}</span>
            </div>
            ${incident.affected_population ? `
            <div style="display: flex; gap: 8px;">
              <span style="font-weight: 600; color: #666; min-width: 80px;">Affected:</span>
              <span style="color: #1a1a1a;">${incident.affected_population.toLocaleString()} people</span>
            </div>` : ''}
            <div style="display: flex; gap: 8px;">
              <span style="font-weight: 600; color: #666; min-width: 80px;">Reported:</span>
              <span style="color: #1a1a1a;">${new Date(incident.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
          ${incident.description ? `<p style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e5e5; color: #666; font-size: 14px; line-height: 1.5;">${incident.description.substring(0, 150)}${incident.description.length > 150 ? '...' : ''}</p>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 320 });
      marker.on('click', () => {
        setSelectedIncident(incident);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all incidents
    if (incidents.length > 0) {
      const validIncidents = incidents.filter(
        i => i.geo_location?.latitude && i.geo_location?.longitude
      );
      if (validIncidents.length > 0) {
        const bounds = L.latLngBounds(
          validIncidents.map(i => [i.geo_location.latitude, i.geo_location.longitude] as [number, number])
        );
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [incidents, mapLoaded, viewMode]);

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#f59e0b';
      case 'low': return '#84cc16';
      default: return '#6b7280';
    }
  };

  const getSeverityScale = (severity: string): number => {
    switch (severity) {
      case 'critical': return 14;
      case 'high': return 11;
      case 'medium': return 8;
      case 'low': return 6;
      default: return 5;
    }
  };

  const handleExport = async (format: 'json' | 'csv' | 'pdf' | 'word') => {
    if (!incidents || incidents.length === 0) {
      toast.error('No data to export');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `peace-pulse-heatmap-${timestamp}`;

    try {
      switch (format) {
        case 'json':
          exportToJSON(incidents, filename);
          break;
        case 'csv':
          exportToCSV(incidents, filename);
          break;
        case 'pdf':
          exportToPDF(incidents, filename);
          break;
        case 'word':
          await exportToWord(incidents, filename);
          break;
      }
      toast.success(`Data exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const severityStats = incidents?.reduce((acc, incident) => {
    acc[incident.severity] = (acc[incident.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const totalAffected = incidents?.reduce((sum, incident) => sum + (incident.affected_population || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPinned className="w-5 h-5" />
            Interactive Incident Map
          </CardTitle>
          <CardDescription>
            Real-time visualization of reported incidents across Africa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {/* Country Filter */}
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-[200px]">
                <Globe className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countriesByBlock && Object.entries(countriesByBlock).map(([block, blockData]) => (
                  <SelectGroup key={block}>
                    <SelectLabel>{block}</SelectLabel>
                    {((blockData as any)?.countries || []).map((country: any) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>

            {/* Severity Filter */}
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-[180px]">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Severity Level" />
              </SelectTrigger>
              <SelectContent>
                {SEVERITY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'markers' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('markers')}
              >
                <MapPin className="w-4 h-4 mr-1" />
                Markers
              </Button>
            </div>

            {/* Export Dropdown */}
            <Select onValueChange={(value) => handleExport(value as any)}>
              <SelectTrigger className="w-[140px]">
                <Download className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Export" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF Report</SelectItem>
                <SelectItem value="word">Word Document</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <Card className="p-3 bg-muted/50">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Total Incidents</span>
              </div>
              <p className="text-2xl font-bold">{incidents?.length || 0}</p>
            </Card>
            <Card className="p-3 bg-red-500/10 border-red-500/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-600">Critical</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{severityStats.critical || 0}</p>
            </Card>
            <Card className="p-3 bg-orange-500/10 border-orange-500/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-600">High</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">{severityStats.high || 0}</p>
            </Card>
            <Card className="p-3 bg-yellow-500/10 border-yellow-500/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-600">Medium</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{severityStats.medium || 0}</p>
            </Card>
            <Card className="p-3 bg-green-500/10 border-green-500/20">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">Affected</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{totalAffected.toLocaleString()}</p>
            </Card>
          </div>

          {/* Map Container */}
          <div className="relative rounded-lg overflow-hidden border bg-muted">
            <div 
              ref={mapRef} 
              className="w-full h-[500px]"
              style={{ zIndex: 1 }}
            />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <LoadingSpinner />
                <span className="ml-2">Loading map...</span>
              </div>
            )}
            {/* Legend */}
            {mapLoaded && (
              <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm p-3 rounded-lg border shadow-lg z-[1000]">
                <p className="font-semibold text-xs mb-2">Severity Level</p>
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
                    <span>Medium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-lime-500" />
                    <span>Low</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Location Permission Notice */}
          {locationPermission === 'prompt' && (
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Enable location to receive alerts for nearby incidents</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Incident Details */}
      {selectedIncident && (
        <Card className="border-primary">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <Badge 
                  className="mb-2"
                  variant={selectedIncident.severity === 'critical' ? 'destructive' : 'secondary'}
                >
                  {selectedIncident.severity.toUpperCase()}
                </Badge>
                <CardTitle>{selectedIncident.title}</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIncident(null)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedIncident.geo_location?.location_name || 'Unknown location'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{new Date(selectedIncident.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span>Type: {selectedIncident.incident_type}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{selectedIncident.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

InteractiveHeatmap.displayName = 'InteractiveHeatmap';

export default InteractiveHeatmap;
