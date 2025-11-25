import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { IncidentStatsCards } from '@/components/IncidentStatsCards';
import InteractiveHeatmap from '@/components/InteractiveHeatmap';
import { ReportSubmissionForm } from '@/components/ReportSubmissionForm';
import { useIncidentNotifications } from '@/hooks/useIncidentNotifications';
import SectionImageBanner from '@/components/SectionImageBanner';
import Navigation from '@/components/Navigation';
import { AlertTriangle } from 'lucide-react';
import incidentReporting from "@/assets/incident-reporting.jpg";

export default function Incidents() {
  const { locationPermission } = useIncidentNotifications(50);
  const [activeTab, setActiveTab] = useState('tracking');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-20 md:py-24">
        <SectionImageBanner
          image={incidentReporting}
          alt="Map of Africa with incident reporting and early warning system visualization"
          title="Incident Hub"
          subtitle="Report incidents, track real-time monitoring, and view early warning visualizations"
          className="h-96 mb-8"
        />
        
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Button 
              onClick={() => setActiveTab('report')}
              size="lg"
              className="gap-2 w-full sm:w-auto"
            >
              <AlertTriangle className="h-5 w-5" />
              <span className="whitespace-nowrap">Submit Report</span>
            </Button>
          </div>
          {locationPermission === 'denied' && (
            <p className="text-xs md:text-sm text-amber-600 dark:text-amber-400 mt-2">
              Enable location permissions to receive alerts for nearby critical incidents
            </p>
          )}
        </div>

        <IncidentStatsCards />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6 md:mt-8">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 h-auto">
            <TabsTrigger value="tracking" className="text-xs sm:text-sm py-2 px-2">
              <span className="hidden sm:inline">Tracking & Map</span>
              <span className="sm:hidden">Map</span>
            </TabsTrigger>
            <TabsTrigger value="report" className="text-xs sm:text-sm py-2 px-2">
              <span className="hidden sm:inline">Submit Report</span>
              <span className="sm:hidden">Report</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs sm:text-sm py-2 px-2">Timeline</TabsTrigger>
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
