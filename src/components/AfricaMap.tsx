import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useJurisdiction } from '@/contexts/JurisdictionContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

// African countries with their coordinates and ISO codes
const AFRICAN_COUNTRIES = [
  { name: 'Kenya', iso: 'KE', center: [37.9062, -0.0236] },
  { name: 'Uganda', iso: 'UG', center: [32.2903, 1.3733] },
  { name: 'Tanzania', iso: 'TZ', center: [34.8888, -6.3690] },
  { name: 'Rwanda', iso: 'RW', center: [29.8739, -1.9403] },
  { name: 'Burundi', iso: 'BI', center: [29.9189, -3.3731] },
  { name: 'South Sudan', iso: 'SS', center: [31.3069, 6.8770] },
  { name: 'Ethiopia', iso: 'ET', center: [40.4897, 9.1450] },
  { name: 'Somalia', iso: 'SO', center: [46.1996, 5.1521] },
  { name: 'Djibouti', iso: 'DJ', center: [42.5903, 11.8251] },
  { name: 'Eritrea', iso: 'ER', center: [39.7823, 15.1794] },
  { name: 'Egypt', iso: 'EG', center: [30.8025, 26.8206] },
  { name: 'Sudan', iso: 'SD', center: [30.2176, 12.8628] },
  { name: 'Nigeria', iso: 'NG', center: [8.6753, 9.0820] },
  { name: 'Ghana', iso: 'GH', center: [-1.0232, 7.9465] },
  { name: 'South Africa', iso: 'ZA', center: [22.9375, -30.5595] },
];

const AfricaMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenInput, setTokenInput] = useState<string>('');
  const { selectedCountry, setSelectedCountry } = useJurisdiction();

  // Fetch incident counts per country
  const { data: incidentCounts } = useQuery({
    queryKey: ['incident-counts-by-country'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('citizen_reports')
        .select('location_country');
      
      if (error) throw error;

      const counts = data.reduce((acc: Record<string, number>, report) => {
        const country = report.location_country || 'Unknown';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {});

      return counts;
    },
  });

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [20, 0],
      zoom: 3,
      minZoom: 2,
      maxZoom: 8,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      // Add markers for each African country
      AFRICAN_COUNTRIES.forEach((country) => {
        const count = incidentCounts?.[country.name] || 0;
        
        const el = document.createElement('div');
        el.className = 'country-marker';
        el.style.cssText = `
          width: ${count > 0 ? Math.min(40 + count * 2, 80) : 30}px;
          height: ${count > 0 ? Math.min(40 + count * 2, 80) : 30}px;
          background: ${count > 0 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'};
          border: 3px solid white;
          border-radius: 50%;
          cursor: pointer;
          opacity: 0.8;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        
        if (count > 0) {
          el.textContent = count.toString();
        }

        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.2)';
          el.style.opacity = '1';
          el.style.zIndex = '1000';
        });

        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
          el.style.opacity = '0.8';
        });

        el.addEventListener('click', () => {
          setSelectedCountry(country.name);
          map.current?.flyTo({
            center: country.center as [number, number],
            zoom: 6,
            duration: 2000,
          });
        });

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div style="padding: 8px;">
            <strong>${country.name}</strong><br/>
            ${count > 0 ? `<span style="color: hsl(var(--destructive))">${count} incidents reported</span>` : 'No incidents'}
          </div>`
        );

        new mapboxgl.Marker(el)
          .setLngLat(country.center as [number, number])
          .setPopup(popup)
          .addTo(map.current!);
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, incidentCounts, setSelectedCountry]);

  if (!mapboxToken) {
    return (
      <Card className="p-8 max-w-md mx-auto">
        <h3 className="text-xl font-bold mb-4">Mapbox Token Required</h3>
        <p className="text-muted-foreground mb-4">
          To display the interactive Africa map, please enter your Mapbox public token.
          Get one at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a>
        </p>
        <input
          type="text"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          placeholder="pk.eyJ1..."
          className="w-full px-4 py-2 border border-border rounded-lg mb-4"
        />
        <button
          onClick={() => setMapboxToken(tokenInput)}
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Load Map
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {selectedCountry && (
        <div className="flex items-center justify-between">
          <Badge variant="default" className="text-base py-2 px-4">
            Selected: {selectedCountry}
          </Badge>
          <button
            onClick={() => {
              setSelectedCountry(null);
              map.current?.flyTo({
                center: [20, 0],
                zoom: 3,
                duration: 2000,
              });
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear Selection
          </button>
        </div>
      )}
      <div className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-lg border-2 border-border">
        <div ref={mapContainer} className="absolute inset-0" />
        <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-border max-w-xs">
          <h4 className="font-semibold mb-2 text-sm">How to Use</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Click on country markers to select jurisdiction</li>
            <li>• Larger markers indicate more incidents</li>
            <li>• Red markers show countries with active incidents</li>
            <li>• Use mouse to pan and zoom the map</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AfricaMap;
