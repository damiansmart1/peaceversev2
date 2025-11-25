/// <reference types="google.maps" />
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, MapPin, AlertTriangle, Activity, Users, Calendar, FileText, MapPinned } from 'lucide-react';
import { useIncidentHeatmapData, HeatmapIncident } from '@/hooks/useIncidentHeatmapData';
import { useIncidentNotifications } from '@/hooks/useIncidentNotifications';
import { exportToJSON, exportToCSV, exportToPDF, exportToWord } from '@/lib/exportUtils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

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
  const userMarkerRef = useRef<google.maps.Marker | null>(null);

  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedIncident, setSelectedIncident] = useState<HeatmapIncident | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<'markers' | 'heatmap'>('markers');

  const { data: incidents, isLoading } = useIncidentHeatmapData(
    selectedCountry === 'all' ? undefined : selectedCountry,
    selectedSeverity === 'all' ? undefined : selectedSeverity
  );
  
  const { userLocation, locationPermission } = useIncidentNotifications(50);

  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;

    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key is missing');
      toast.error('Google Maps API key is not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables.');
      return;
    }

    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['visualization', 'marker'],
    });

    loader.load().then(() => {
      if (!mapRef.current) return;

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: -1.2921, lng: 36.8219 }, // Center on Kenya/COMESA region
        zoom: 5,
        minZoom: 3,
        maxZoom: 18,
        mapTypeId: 'roadmap',
        streetViewControl: false,
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'transit',
            stylers: [{ visibility: 'simplified' }],
          },
        ],
      });

      mapInstanceRef.current = map;
      infoWindowRef.current = new google.maps.InfoWindow({
        maxWidth: 320,
      });
      
      // Add user location marker if available
      if (userLocation) {
        userMarkerRef.current = new google.maps.Marker({
          position: { lat: userLocation.latitude, lng: userLocation.longitude },
          map: map,
          title: 'Your Location',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4F46E5',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
          zIndex: 1000,
        });

        const userInfoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 12px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 18px;">📍</span>
                <strong style="color: #4F46E5;">Your Location</strong>
              </div>
              <p style="color: #666; font-size: 14px; margin: 0;">
                Monitoring critical incidents within 50km radius
              </p>
            </div>
          `,
        });

        userMarkerRef.current.addListener('click', () => {
          userInfoWindow.open(map, userMarkerRef.current);
        });
      }
      
      setMapLoaded(true);
      toast.success('Interactive map loaded successfully');
    }).catch(error => {
      console.error('Error loading Google Maps:', error);
      toast.error('Failed to load map. Please check your API key configuration.');
    });
  }, [mapLoaded, userLocation]);
  
  // Update user location marker when location changes
  useEffect(() => {
    if (userLocation && mapInstanceRef.current && mapLoaded && !userMarkerRef.current) {
      userMarkerRef.current = new google.maps.Marker({
        position: { lat: userLocation.latitude, lng: userLocation.longitude },
        map: mapInstanceRef.current,
        title: 'Your Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4F46E5',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        zIndex: 1000,
      });

      const userInfoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 18px;">📍</span>
              <strong style="color: #4F46E5;">Your Location</strong>
            </div>
            <p style="color: #666; font-size: 14px; margin: 0;">
              Monitoring critical incidents within 50km radius
            </p>
          </div>
        `,
      });

      userMarkerRef.current.addListener('click', () => {
        userInfoWindow.open(mapInstanceRef.current, userMarkerRef.current);
      });
    }
  }, [userLocation, mapLoaded]);

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
        radius: 35,
        opacity: 0.75,
        gradient: [
          'rgba(0, 255, 255, 0)',
          'rgba(0, 255, 255, 1)',
          'rgba(0, 191, 255, 1)',
          'rgba(0, 127, 255, 1)',
          'rgba(0, 63, 255, 1)',
          'rgba(0, 0, 255, 1)',
          'rgba(0, 0, 223, 1)',
          'rgba(0, 0, 191, 1)',
          'rgba(0, 0, 159, 1)',
          'rgba(0, 0, 127, 1)',
          'rgba(63, 0, 91, 1)',
          'rgba(127, 0, 63, 1)',
          'rgba(191, 0, 31, 1)',
          'rgba(255, 0, 0, 1)'
        ]
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

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Google Maps API Key Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The interactive map requires a Google Maps API key to function. Please follow these steps:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Visit the <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a></li>
            <li>Create or select a project</li>
            <li>Enable the Maps JavaScript API and Places API</li>
            <li>Create an API key with appropriate restrictions</li>
            <li>Add the API key to your <code className="bg-muted px-2 py-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> environment variable</li>
          </ol>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-xs font-mono">
              # Add to your .env file:<br />
              VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Interactive Heatmap Controls
              </CardTitle>
              <CardDescription>Filter and export incident data for early response planning</CardDescription>
            </div>
            {locationPermission === 'granted' && (
              <Badge variant="secondary" className="flex items-center gap-1.5">
                <MapPinned className="h-3 w-3" />
                <span>Live Alerts Active</span>
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button onClick={() => handleExport('json')} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" /> JSON
            </Button>
            <Button onClick={() => handleExport('csv')} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" /> CSV
            </Button>
            <Button onClick={() => handleExport('pdf')} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" /> PDF
            </Button>
            <Button onClick={() => handleExport('word')} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" /> Word
            </Button>
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
            {viewMode === 'markers' 
              ? 'Click on markers for detailed information. Larger circles indicate higher severity incidents.'
              : 'Heat intensity represents incident concentration and severity. Red areas require immediate attention.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div ref={mapRef} className="w-full h-[600px] rounded-lg border border-border" />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
              <LoadingSpinner />
            </div>
          )}
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
