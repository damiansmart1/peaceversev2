import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  Map, 
  Users, 
  Settings,
  RefreshCw,
  Building2
} from 'lucide-react';
import { motion } from 'framer-motion';
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

  // Fetch all dashboard data
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useGovernmentStats();
  const { data: regionalStats, isLoading: regionalLoading } = useRegionalStats();
  const { data: trendData, isLoading: trendsLoading } = useReportTrends();
  const { data: criticalAlerts, isLoading: alertsLoading } = useCriticalAlerts();
  const { data: recentReports, isLoading: reportsLoading } = useRecentReports();
  const { data: pendingProposals, isLoading: proposalsLoading } = usePendingProposals();

  const handleRefresh = () => {
    refetchStats();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  Government Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                  Comprehensive oversight, monitoring, and response management
                </p>
              </div>
            </div>
            <Button onClick={handleRefresh} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
          </motion.div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 gap-2">
              <TabsTrigger value="overview" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="gap-2">
                <Map className="h-4 w-4" />
                <span className="hidden sm:inline">Map</span>
              </TabsTrigger>
              <TabsTrigger value="proposals" className="gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Proposals</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <GovernmentStatsCards stats={stats} isLoading={statsLoading} />

              {/* Quick Actions */}
              <QuickActionsPanel />

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Critical Alerts */}
                <CriticalAlertsPanel alerts={criticalAlerts} isLoading={alertsLoading} />

                {/* Community Proposals */}
                <PendingProposalsPanel proposals={pendingProposals} isLoading={proposalsLoading} />
              </div>

              {/* Trends Chart */}
              <ReportTrendsChart data={trendData} isLoading={trendsLoading} />

              {/* Regional Overview */}
              <RegionalOverview stats={regionalStats} isLoading={regionalLoading} />
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <GovernmentStatsCards stats={stats} isLoading={statsLoading} />
              <RecentReportsTable reports={recentReports} isLoading={reportsLoading} />
              <ReportTrendsChart data={trendData} isLoading={trendsLoading} />
            </TabsContent>

            {/* Map Tab */}
            <TabsContent value="map" className="space-y-6">
              <div className="h-[600px]">
                <InteractiveHeatmap />
              </div>
              <RegionalOverview stats={regionalStats} isLoading={regionalLoading} />
            </TabsContent>

            {/* Proposals Tab */}
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
