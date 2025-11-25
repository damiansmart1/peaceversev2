import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IncidentStatsCards } from '@/components/IncidentStatsCards';
import InteractiveHeatmap from '@/components/InteractiveHeatmap';
import { useIncidentNotifications } from '@/hooks/useIncidentNotifications';

export default function Incidents() {
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const { locationPermission } = useIncidentNotifications(50);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Incident Tracking & Early Warning
          </h1>
          <p className="text-muted-foreground">
            Real-time monitoring and visualization of incidents across regions
          </p>
          {locationPermission === 'denied' && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
              Enable location permissions to receive alerts for nearby critical incidents
            </p>
          )}
        </div>

        <IncidentStatsCards />

        <Tabs defaultValue="map" className="mt-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="map">Interactive Map</TabsTrigger>
            <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="mt-6">
            <Card className="p-6">
              <InteractiveHeatmap />
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <Card className="p-6">
              <p className="text-muted-foreground text-center py-8">
                Timeline view coming soon - chronological incident tracking
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
