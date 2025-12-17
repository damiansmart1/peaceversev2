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
import { preloadGoogleMaps, getGoogleMaps } from '@/hooks/useGoogleMapsPreloader';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const CommunityMap = memo(() => {
  const [selectedHub, setSelectedHub] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  
  const { data: safeSpaces, isLoading } = useAdminSafeSpaces();
  const { data: isAdmin } = useAdminCheck();
  const { selectedCountry, setSelectedCountry } = useJurisdiction();

  // Get user's current location - only once
  useEffect(() => {
    if (userLocation) return; // Already have location
    
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
          // Default to Nairobi, Kenya
          setUserLocation({ lat: -1.286389, lng: 36.817223 });
        }
      );
    } else {
      // Default to Nairobi, Kenya
      setUserLocation({ lat: -1.286389, lng: 36.817223 });
    }
  }, [userLocation]);

  // Initialize Google Maps - use preloaded instance if available
  useEffect(() => {
    if (!mapRef.current || googleMapRef.current) return;

    if (!GOOGLE_MAPS_API_KEY) {
      setMapError('Google Maps API key is not configured');
      return;
    }

    const defaultCenter = { lat: -1.286389, lng: 36.817223 };
    let isMounted = true;

    const initMap = (google: typeof window.google) => {
      if (!isMounted || !mapRef.current || googleMapRef.current) return;
      
      const map = new google.maps.Map(mapRef.current, {
        center: userLocation || defaultCenter,
        zoom: 12,
        gestureHandling: 'greedy',
        styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
      });
      googleMapRef.current = map;
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

  // Update map center and add user marker when location becomes available
  useEffect(() => {
    if (!googleMapRef.current || !userLocation || !mapLoaded) return;
    
    // Center map on user location
    googleMapRef.current.setCenter(userLocation);
    
    // Add user location marker if not already added
    if (!userMarkerRef.current) {
      userMarkerRef.current = new google.maps.Marker({
        position: userLocation,
        map: googleMapRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#074F98',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
        title: 'Your Location',
        zIndex: 1000,
      });
    }
  }, [userLocation, mapLoaded]);

  // Update markers when safe spaces or filters change
  useEffect(() => {
    if (!googleMapRef.current || !safeSpaces || !mapLoaded) return;

    // Clear existing markers (except user marker)
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Filter safe spaces
    const filtered = safeSpaces.filter(space => {
      if (space.is_archived) return false;
      if (showVerifiedOnly && !space.verified) return false;
      if (selectedType !== 'all' && space.space_type !== selectedType) return false;
      if (searchQuery && !space.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !space.location_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    // Add markers for filtered spaces
    filtered.forEach(space => {
      if (!space.latitude || !space.longitude) return;

      const marker = new google.maps.Marker({
        position: { lat: space.latitude, lng: space.longitude },
        map: googleMapRef.current!,
        title: space.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: space.verified ? '#275432' : '#E1AD40',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      });

      marker.addListener('click', () => {
        setSelectedHub(space.id);
        googleMapRef.current?.panTo({ lat: space.latitude!, lng: space.longitude! });
      });

      markersRef.current.push(marker);
    });
  }, [safeSpaces, selectedType, showVerifiedOnly, searchQuery, mapLoaded]);

  // Calculate distance between two coordinates
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

  // Get filtered and sorted safe spaces
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
    if (userLocation && googleMapRef.current) {
      googleMapRef.current.panTo(userLocation);
      googleMapRef.current.setZoom(14);
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

  if (mapError || !GOOGLE_MAPS_API_KEY) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <Card className="max-w-2xl mx-auto p-8">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Map Loading Failed</h3>
              <p className="text-muted-foreground mb-4">
                {GOOGLE_MAPS_API_KEY 
                  ? 'The Google Maps API failed to load. Please check that the Maps JavaScript API is enabled and billing is configured.'
                  : 'Google Maps API key is not configured.'}
              </p>
            </div>
          </Card>
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
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search safe spaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
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

              {/* Location Button */}
              <Button 
                variant="outline" 
                onClick={handleGoToLocation}
                className="w-full"
              >
                <Navigation className="w-4 h-4 mr-2" />
                My Location
              </Button>

              {/* Verified Filter */}
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
            />
            {!mapLoaded && !mapError && (
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
                    if (space.latitude && space.longitude && googleMapRef.current) {
                      googleMapRef.current.panTo({ lat: space.latitude, lng: space.longitude });
                      googleMapRef.current.setZoom(15);
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

        {/* Admin Add Button */}
        {isAdmin && (
          <div className="text-center">
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90"
              onClick={() => {
                toast.info('Safe space creation dialog coming soon!');
              }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Safe Space
            </Button>
          </div>
        )}
      </div>
    </section>
  );
});

CommunityMap.displayName = 'CommunityMap';

export default CommunityMap;
