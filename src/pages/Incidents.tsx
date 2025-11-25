import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { IncidentStatsCards } from '@/components/IncidentStatsCards';
import InteractiveHeatmap from '@/components/InteractiveHeatmap';
import { ReportSubmissionForm } from '@/components/ReportSubmissionForm';
import { useIncidentNotifications } from '@/hooks/useIncidentNotifications';
import Navigation from '@/components/Navigation';
import { AlertTriangle } from 'lucide-react';

export default function Incidents() {
  const { locationPermission } = useIncidentNotifications(50);
  const [activeTab, setActiveTab] = useState('tracking');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-foreground">
              Incident Hub
            </h1>
            <Button 
              onClick={() => setActiveTab('report')}
              size="lg"
              className="gap-2"
            >
              <AlertTriangle className="h-5 w-5" />
              Submit Report
            </Button>
          </div>
          <p className="text-muted-foreground">
            Report incidents, track real-time monitoring, and view early warning visualizations
          </p>
          {locationPermission === 'denied' && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
              Enable location permissions to receive alerts for nearby critical incidents
            </p>
          )}
        </div>

        <IncidentStatsCards />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="tracking">Tracking & Map</TabsTrigger>
            <TabsTrigger value="report">Submit Report</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="tracking" className="mt-6">
            <Card className="p-6">
              <InteractiveHeatmap />
            </Card>
          </TabsContent>

          <TabsContent value="report" className="mt-6">
            <ReportSubmissionForm />
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
