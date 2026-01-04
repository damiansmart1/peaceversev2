import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Users, Shield, Clock, Navigation, Search, Filter, Plus, AlertTriangle } from "lucide-react";
import { useAdminSafeSpaces, AdminSafeSpace } from "@/hooks/useAdminSafeSpaces";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useJurisdiction } from "@/contexts/JurisdictionContext";
import { toast } from "sonner";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const CommunityMap = memo(() => {
  const [selectedHub, setSelectedHub] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  
  const { data: safeSpaces, isLoading } = useAdminSafeSpaces();
  const { data: isAdmin } = useAdminCheck();
  const { selectedCountry, setSelectedCountry } = useJurisdiction();

  // Get user's current location - only once
  useEffect(() => {
    if (userLocation) return;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setUserLocation({ lat: -1.286389, lng: 36.817223 });
        }
      );
    } else {
      setUserLocation({ lat: -1.286389, lng: 36.817223 });
    }
  }, [userLocation]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const defaultCenter: [number, number] = [-1.286389, 36.817223];

    const map = L.map(mapRef.current, {
      center: userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter,
      zoom: 12,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    leafletMapRef.current = map;
    setMapLoaded(true);

    return () => {
      // Don't destroy map on cleanup
    };
  }, []);

  // Update map center and add user marker when location becomes available
  useEffect(() => {
    if (!leafletMapRef.current || !userLocation || !mapLoaded) return;
    
    leafletMapRef.current.setView([userLocation.lat, userLocation.lng], 12);
    
    if (!userMarkerRef.current) {
      userMarkerRef.current = L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 10,
        fillColor: '#074F98',
        fillOpacity: 1,
        color: '#fff',
        weight: 2,
      }).addTo(leafletMapRef.current);

      userMarkerRef.current.bindPopup('<strong>Your Location</strong>');
    }
  }, [userLocation, mapLoaded]);

  // Update markers when safe spaces or filters change
  useEffect(() => {
    if (!leafletMapRef.current || !safeSpaces || !mapLoaded) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const filtered = safeSpaces.filter(space => {
      if (space.is_archived) return false;
      if (showVerifiedOnly && !space.verified) return false;
      if (selectedType !== 'all' && space.space_type !== selectedType) return false;
      if (searchQuery && !space.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !space.location_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    filtered.forEach(space => {
      if (!space.latitude || !space.longitude) return;

      const marker = L.circleMarker([space.latitude, space.longitude], {
        radius: 12,
        fillColor: space.verified ? '#275432' : '#E1AD40',
        fillOpacity: 1,
        color: '#fff',
        weight: 2,
      }).addTo(leafletMapRef.current!);

      marker.bindPopup(`
        <div style="padding: 8px; min-width: 180px;">
          <strong style="font-size: 14px;">${space.name}</strong>
          <p style="margin: 4px 0; font-size: 12px; color: #666;">${space.location_name}</p>
          ${space.verified ? '<span style="color: #275432; font-size: 11px;">✓ Verified</span>' : ''}
        </div>
      `);

      marker.on('click', () => {
        setSelectedHub(space.id);
        leafletMapRef.current?.setView([space.latitude!, space.longitude!], 15);
      });

      markersRef.current.push(marker);
    });
  }, [safeSpaces, selectedType, showVerifiedOnly, searchQuery, mapLoaded]);

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): string => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  }, []);

  const getFilteredSpaces = useCallback((): AdminSafeSpace[] => {
    if (!safeSpaces) return [];
    
    return safeSpaces
      .filter(space => {
        if (space.is_archived) return false;
        if (showVerifiedOnly && !space.verified) return false;
        if (selectedType !== 'all' && space.space_type !== selectedType) return false;
        if (searchQuery && !space.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
            !space.location_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        if (!userLocation || !a.latitude || !a.longitude || !b.latitude || !b.longitude) return 0;
        const distA = parseFloat(calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude));
        const distB = parseFloat(calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude));
        return distA - distB;
      });
  }, [safeSpaces, showVerifiedOnly, selectedType, searchQuery, userLocation, calculateDistance]);

  const filteredSpaces = getFilteredSpaces();

  const getSpaceTypeColor = (type: string) => {
    switch (type) {
      case 'community_center': return 'bg-primary text-primary-foreground';
      case 'youth_center': return 'bg-accent text-accent-foreground';
      case 'library': return 'bg-secondary text-secondary-foreground';
      case 'school': return 'bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSpaceTypeName = (type: string) => {
    const types: Record<string, string> = {
      community_center: 'Community Center',
      youth_center: 'Youth Center',
      library: 'Library',
      school: 'School',
      health_center: 'Health Center',
      recreation_center: 'Recreation Center',
    };
    return types[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleGoToLocation = useCallback(() => {
    if (userLocation && leafletMapRef.current) {
      leafletMapRef.current.setView([userLocation.lat, userLocation.lng], 14);
      toast.success('Centered on your location');
    }
  }, [userLocation]);

  if (isLoading && !mapLoaded) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading safe spaces...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Find Safe Spaces Near You</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover verified community dialogue spaces where youth gather to build peace
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="max-w-6xl mx-auto mb-6">
          <Card className="p-6 bg-card border-accent/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search safe spaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="community_center">Community Center</SelectItem>
                  <SelectItem value="youth_center">Youth Center</SelectItem>
                  <SelectItem value="library">Library</SelectItem>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="health_center">Health Center</SelectItem>
                  <SelectItem value="recreation_center">Recreation Center</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={handleGoToLocation}
                className="w-full"
              >
                <Navigation className="w-4 h-4 mr-2" />
                My Location
              </Button>

              <Button
                variant={showVerifiedOnly ? "default" : "outline"}
                onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                className="w-full"
              >
                <Shield className="w-4 h-4 mr-2" />
                {showVerifiedOnly ? 'All' : 'Verified Only'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Interactive Map */}
        <div className="max-w-6xl mx-auto mb-8">
          <Card className="overflow-hidden bg-card border-accent/20 shadow-story relative">
            <div 
              ref={mapRef} 
              className="w-full h-[500px]"
              style={{ zIndex: 1 }}
            />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </Card>
        </div>

        {/* Safe Spaces List */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-foreground">
              {filteredSpaces.length} Safe Space{filteredSpaces.length !== 1 ? 's' : ''} Found
            </h3>
          </div>

          {filteredSpaces.length === 0 ? (
            <Card className="p-12 text-center bg-card border-accent/20">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Safe Spaces Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search in a different area
              </p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpaces.map((space) => (
                <Card
                  key={space.id}
                  className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-warm hover:scale-[1.02] ${
                    selectedHub === space.id
                      ? 'bg-card border-primary shadow-peace ring-2 ring-primary/20'
                      : 'bg-card border-accent/20 shadow-story'
                  }`}
                  onClick={() => {
                    setSelectedHub(selectedHub === space.id ? null : space.id);
                    if (space.latitude && space.longitude && leafletMapRef.current) {
                      leafletMapRef.current.setView([space.latitude, space.longitude], 15);
                    }
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground leading-tight flex-1">
                        {space.name}
                      </h3>
                      {space.verified && (
                        <Badge variant="outline" className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20 flex-shrink-0">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    {space.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {space.description}
                      </p>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{space.location_name}</span>
                      </div>
                      
                      {userLocation && space.latitude && space.longitude && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Navigation className="w-4 h-4 mr-2 flex-shrink-0" />
                          {calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            space.latitude,
                            space.longitude
                          )} away
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Badge className={getSpaceTypeColor(space.space_type)}>
                        {getSpaceTypeName(space.space_type)}
                      </Badge>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (space.latitude && space.longitude) {
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${space.latitude},${space.longitude}`,
                              '_blank'
                            );
                          }
                        }}
                      >
                        Get Directions
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

CommunityMap.displayName = 'CommunityMap';

export default CommunityMap;
