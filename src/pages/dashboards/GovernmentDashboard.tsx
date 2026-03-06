import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardHeroBanner from '@/components/DashboardHeroBanner';
import { 
  LayoutDashboard, 
  FileText, 
  Map, 
  Users, 
  Building2
} from 'lucide-react';
import { 
  useGovernmentStats, 
  useRegionalStats, 
  useReportTrends,
  useCriticalAlerts,
  useRecentReports,
  usePendingProposals
} from '@/hooks/useGovernmentDashboard';
import { GovernmentStatsCards } from '@/components/government/GovernmentStatsCards';
import { CriticalAlertsPanel } from '@/components/government/CriticalAlertsPanel';
import { RegionalOverview } from '@/components/government/RegionalOverview';
import { ReportTrendsChart } from '@/components/government/ReportTrendsChart';
import { RecentReportsTable } from '@/components/government/RecentReportsTable';
import { QuickActionsPanel } from '@/components/government/QuickActionsPanel';
import { PendingProposalsPanel } from '@/components/government/PendingProposalsPanel';
import InteractiveHeatmap from '@/components/InteractiveHeatmap';

const GovernmentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useGovernmentStats();
  const { data: regionalStats, isLoading: regionalLoading } = useRegionalStats();
  const { data: trendData, isLoading: trendsLoading } = useReportTrends();
  const { data: criticalAlerts, isLoading: alertsLoading } = useCriticalAlerts();
  const { data: recentReports, isLoading: reportsLoading } = useRecentReports();
  const { data: pendingProposals, isLoading: proposalsLoading } = usePendingProposals();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Hero Banner */}
          <DashboardHeroBanner
            icon={<Building2 className="h-8 w-8 text-secondary" />}
            title="Government Dashboard"
            subtitle="Comprehensive oversight, monitoring, and response management"
            onRefresh={() => refetchStats()}
            accentColor="secondary"
          />

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-card/80 backdrop-blur-sm border border-border/50 p-1 rounded-xl grid w-full md:w-auto md:inline-grid grid-cols-4 gap-1">
              <TabsTrigger value="overview" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                <Map className="h-4 w-4" />
                <span className="hidden sm:inline">Map</span>
              </TabsTrigger>
              <TabsTrigger value="proposals" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Proposals</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <GovernmentStatsCards stats={stats} isLoading={statsLoading} />
              <QuickActionsPanel />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CriticalAlertsPanel alerts={criticalAlerts} isLoading={alertsLoading} />
                <PendingProposalsPanel proposals={pendingProposals} isLoading={proposalsLoading} />
              </div>
              <ReportTrendsChart data={trendData} isLoading={trendsLoading} />
              <RegionalOverview stats={regionalStats} isLoading={regionalLoading} />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <GovernmentStatsCards stats={stats} isLoading={statsLoading} />
              <RecentReportsTable reports={recentReports} isLoading={reportsLoading} />
              <ReportTrendsChart data={trendData} isLoading={trendsLoading} />
            </TabsContent>

            <TabsContent value="map" className="space-y-6">
              <div className="h-[600px]">
                <InteractiveHeatmap />
              </div>
              <RegionalOverview stats={regionalStats} isLoading={regionalLoading} />
            </TabsContent>

            <TabsContent value="proposals" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <PendingProposalsPanel proposals={pendingProposals} isLoading={proposalsLoading} />
                </div>
                <div className="space-y-6">
                  <RegionalOverview stats={regionalStats} isLoading={regionalLoading} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default GovernmentDashboard;
