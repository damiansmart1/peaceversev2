/// <reference types="google.maps" />
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, MapPin, AlertTriangle, Activity, Users, Calendar, FileText } from 'lucide-react';
import { useIncidentHeatmapData, HeatmapIncident } from '@/hooks/useIncidentHeatmapData';
import { exportToJSON, exportToCSV, exportToPDF, exportToWord } from '@/lib/exportUtils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBpQxxxxxXXXXXXxxxXXXXXXxXXXxxxxxx'; // Temporary - should be from environment

const COMESA_COUNTRIES = [
  { code: 'all', name: 'All COMESA' },
  { code: 'KE', name: 'Kenya' },
  { code: 'UG', name: 'Uganda' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' },
  { code: 'MW', name: 'Malawi' },
  { code: 'SO', name: 'Somalia' },
  { code: 'SD', name: 'Sudan' },
];

const SEVERITY_LEVELS = [
  { value: 'all', label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const InteractiveHeatmap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const heatmapLayerRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedIncident, setSelectedIncident] = useState<HeatmapIncident | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<'markers' | 'heatmap'>('markers');

  const { data: incidents, isLoading } = useIncidentHeatmapData(
    selectedCountry === 'all' ? undefined : selectedCountry,
    selectedSeverity === 'all' ? undefined : selectedSeverity
  );

  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;

    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['visualization', 'marker'],
    });

    loader.load().then(() => {
      if (!mapRef.current) return;

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 0, lng: 35 }, // Center on COMESA region
        zoom: 5,
        mapTypeId: 'roadmap',
        styles: [
          {
            featureType: 'poi',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      mapInstanceRef.current = map;
      infoWindowRef.current = new google.maps.InfoWindow();
      setMapLoaded(true);
    }).catch(error => {
      console.error('Error loading Google Maps:', error);
      toast.error('Failed to load map. Please check your API key.');
    });
  }, [mapLoaded]);

  // Update markers and heatmap when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !incidents || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Clear existing heatmap
    if (heatmapLayerRef.current) {
      heatmapLayerRef.current.setMap(null);
    }

    if (viewMode === 'markers') {
      // Create markers
      incidents.forEach(incident => {
        if (!incident.geo_location?.latitude || !incident.geo_location?.longitude) return;

        const marker = new google.maps.Marker({
          position: {
            lat: incident.geo_location.latitude,
            lng: incident.geo_location.longitude,
          },
          map: mapInstanceRef.current,
          title: incident.title,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: getSeverityScale(incident.severity),
            fillColor: getSeverityColor(incident.severity),
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        marker.addListener('click', () => {
          setSelectedIncident(incident);
          showInfoWindow(marker, incident);
        });

        markersRef.current.push(marker);
      });
    } else {
      // Create heatmap
      const heatmapData = incidents
        .filter(incident => incident.geo_location?.latitude && incident.geo_location?.longitude)
        .map(incident => ({
          location: new google.maps.LatLng(
            incident.geo_location.latitude,
            incident.geo_location.longitude
          ),
          weight: getSeverityWeight(incident.severity),
        }));

      heatmapLayerRef.current = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: mapInstanceRef.current,
        radius: 30,
        opacity: 0.7,
      });
    }

    // Fit bounds to show all incidents
    if (incidents.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      incidents.forEach(incident => {
        if (incident.geo_location?.latitude && incident.geo_location?.longitude) {
          bounds.extend({
            lat: incident.geo_location.latitude,
            lng: incident.geo_location.longitude,
          });
        }
      });
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [incidents, mapLoaded, viewMode]);

  const showInfoWindow = (marker: google.maps.Marker, incident: HeatmapIncident) => {
    if (!infoWindowRef.current) return;

    const content = `
      <div style="padding: 8px; max-width: 300px;">
        <h3 style="font-weight: bold; margin-bottom: 8px; color: #1a1a1a;">${incident.title}</h3>
        <p style="margin-bottom: 4px;"><strong>Type:</strong> ${incident.incident_type}</p>
        <p style="margin-bottom: 4px;"><strong>Severity:</strong> <span style="color: ${getSeverityColor(incident.severity)}; font-weight: bold;">${incident.severity.toUpperCase()}</span></p>
        <p style="margin-bottom: 4px;"><strong>Status:</strong> ${incident.status}</p>
        <p style="margin-bottom: 4px;"><strong>Location:</strong> ${incident.geo_location?.location_name || 'Unknown'}</p>
        ${incident.affected_population ? `<p style="margin-bottom: 4px;"><strong>Affected:</strong> ${incident.affected_population} people</p>` : ''}
        <p style="margin-bottom: 4px;"><strong>Reported:</strong> ${new Date(incident.created_at).toLocaleDateString()}</p>
      </div>
    `;

    infoWindowRef.current.setContent(content);
    infoWindowRef.current.open(mapInstanceRef.current, marker);
  };

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

  const getSeverityWeight = (severity: string): number => {
    switch (severity) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 1;
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

  if (isLoading && !mapLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Interactive Heatmap Controls
          </CardTitle>
          <CardDescription>Filter and export incident data for early response planning</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                {COMESA_COUNTRIES.map(country => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="Select Severity" />
              </SelectTrigger>
              <SelectContent>
                {SEVERITY_LEVELS.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={viewMode} onValueChange={(value: 'markers' | 'heatmap') => setViewMode(value)}>
              <SelectTrigger>
                <SelectValue placeholder="View Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="markers">Markers</SelectItem>
                <SelectItem value="heatmap">Heatmap</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button onClick={() => handleExport('json')} variant="outline" size="sm" className="flex-1">
                <Download className="w-4 h-4 mr-1" /> JSON
              </Button>
              <Button onClick={() => handleExport('csv')} variant="outline" size="sm" className="flex-1">
                <Download className="w-4 h-4 mr-1" /> CSV
              </Button>
              <Button onClick={() => handleExport('pdf')} variant="outline" size="sm" className="flex-1">
                <Download className="w-4 h-4 mr-1" /> PDF
              </Button>
              <Button onClick={() => handleExport('word')} variant="outline" size="sm" className="flex-1">
                <Download className="w-4 h-4 mr-1" /> Word
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Total Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{incidents?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active hotspots</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Critical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{severityStats.critical || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{severityStats.high || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Urgent response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              People Affected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalAffected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Estimated impact</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Last Updated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {incidents?.[0] ? new Date(incidents[0].created_at).toLocaleDateString() : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Real-time sync</p>
          </CardContent>
        </Card>
      </div>

      {/* Map Container */}
      <Card>
        <CardHeader>
          <CardTitle>Live Incident Map</CardTitle>
          <CardDescription>
            Click on markers for detailed information. Red indicates critical severity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div ref={mapRef} className="w-full h-[600px] rounded-lg" />
        </CardContent>
      </Card>

      {/* Selected Incident Details */}
      {selectedIncident && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Incident Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-bold text-lg mb-2">{selectedIncident.title}</h3>
              <Badge className={`${getSeverityColor(selectedIncident.severity)}`}>
                {selectedIncident.severity.toUpperCase()}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">{selectedIncident.incident_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{selectedIncident.status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{selectedIncident.geo_location?.location_name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Country</p>
                <p className="font-medium">{selectedIncident.country_code || 'N/A'}</p>
              </div>
              {selectedIncident.affected_population && (
                <div>
                  <p className="text-sm text-muted-foreground">Affected Population</p>
                  <p className="font-medium">{selectedIncident.affected_population.toLocaleString()} people</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Reported</p>
                <p className="font-medium">{new Date(selectedIncident.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Description</p>
              <p className="text-sm">{selectedIncident.description}</p>
            </div>

            {selectedIncident.response_actions && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Response Actions</p>
                <div className="bg-muted p-3 rounded-lg">
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(selectedIncident.response_actions, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Severity Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {[
              { severity: 'critical', label: 'Critical - Immediate Action Required' },
              { severity: 'high', label: 'High - Urgent Response Needed' },
              { severity: 'medium', label: 'Medium - Monitor Closely' },
              { severity: 'low', label: 'Low - Routine Follow-up' },
            ].map(item => (
              <div key={item.severity} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border-2 border-white"
                  style={{ backgroundColor: getSeverityColor(item.severity) }}
                />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveHeatmap;
