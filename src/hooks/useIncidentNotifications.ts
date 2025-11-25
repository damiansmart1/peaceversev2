import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-typed';
import { toast } from 'sonner';
import type { HeatmapIncident } from './useIncidentHeatmapData';

interface UserLocation {
  latitude: number;
  longitude: number;
}

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const useIncidentNotifications = (radiusKm: number = 50) => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  useEffect(() => {
    // Request user location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationPermission('granted');
        },
        (error) => {
          console.log('Location permission denied:', error);
          setLocationPermission('denied');
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    console.log('Setting up realtime incident notifications...');

    const channel = supabase
      .channel('incident-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'citizen_reports',
        },
        (payload) => {
          const report = payload.new as any;
          
          // Only notify for critical incidents with location
          if (report.severity_level === 'critical' && report.location_latitude && report.location_longitude) {
            const distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              report.location_latitude,
              report.location_longitude
            );

            if (distance <= radiusKm) {
              toast.error(
                `Critical Incident Alert: ${report.title}`,
                {
                  description: `${report.location_name || report.location_city || 'Nearby location'} - ${Math.round(distance)}km away. ${report.description.substring(0, 100)}...`,
                  duration: 10000,
                  action: {
                    label: 'View Map',
                    onClick: () => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    },
                  },
                }
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userLocation, radiusKm]);

  return { userLocation, locationPermission };
};
