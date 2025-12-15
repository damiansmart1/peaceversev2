import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, Activity, BarChart3, Bell, MapPin, 
  TrendingUp, AlertTriangle, Settings, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useVerificationTasks } from '@/hooks/useVerificationTasks';
import { VerifierStatsOverview } from '@/components/verifier/VerifierStatsOverview';
import { ThreatMonitorPanel } from '@/components/verifier/ThreatMonitorPanel';
import { PatternDetectionPanel } from '@/components/verifier/PatternDetectionPanel';
import { VerificationAnalytics } from '@/components/verifier/VerificationAnalytics';
import { ActiveHotspotsMap } from '@/components/verifier/ActiveHotspotsMap';
import { QuickVerificationActions } from '@/components/verifier/QuickVerificationActions';
import { ReporterSafetyAlerts } from '@/components/verifier/ReporterSafetyAlerts';
import { VerificationQueue } from '@/components/VerificationQueue';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const VerifierDashboard = () => {
  const navigate = useNavigate();
  const { tasks, isLoading, refetch } = useVerificationTasks();
  const [activeTab, setActiveTab] = useState('overview');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Real-time sync for verification dashboard
  useEffect(() => {
    const channel = supabase
      .channel('verifier-dashboard-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'verification_tasks' },
        () => {
          refetch();
          setLastRefresh(new Date());
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'citizen_reports' },
        () => {
          refetch();
          setLastRefresh(new Date());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const pendingTasks = tasks?.filter(t => t.status === 'pending').length || 0;
  const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
  const criticalTasks = tasks?.filter(t => t.priority === 'critical' && t.status === 'pending').length || 0;
  const highPriorityTasks = tasks?.filter(t => t.priority === 'high' && t.status === 'pending').length || 0;

  const stats = {
    pendingTasks,
    completedToday: completedTasks,
    criticalAlerts: criticalTasks,
    highPriority: highPriorityTasks,
    verificationRate: completedTasks > 0 ? Math.round((completedTasks / (completedTasks + pendingTasks)) * 100) : 0,
    avgResponseTime: '2.4h',
    activeHotspots: 7,
    patternsDetected: 12,
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setLastRefresh(new Date());
    setIsRefreshing(false);
    toast({
      title: 'Dashboard Refreshed',
      description: 'All data has been synchronized.',
    });
  };

  return (
    <div className="min-h-screen bg-hero-gradient">
      <Navigation />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-[#e1ad40] flex items-center gap-3">
                <Shield className="w-10 h-10" />
                Verification Command Center
              </h1>
              <p className="text-lg text-white/80">
                Early Warning & Incident Verification Dashboard
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-white/60">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <VerifierStatsOverview stats={stats} />
          </motion.div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
              <TabsTrigger 
                value="overview" 
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="queue" 
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Queue</span>
                {pendingTasks > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-orange-500 text-white text-xs">
                    {pendingTasks}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="monitoring" 
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">Monitoring</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Quick Actions & Safety */}
                <div className="space-y-6">
                  <QuickVerificationActions />
                  <ReporterSafetyAlerts />
                </div>

                {/* Middle Column - Threat Monitor */}
                <div className="lg:col-span-1">
                  <ThreatMonitorPanel />
                </div>

                {/* Right Column - Patterns & Hotspots */}
                <div className="space-y-6">
                  <PatternDetectionPanel />
                </div>
              </div>

              {/* Hotspots Section */}
              <div className="grid gap-6 md:grid-cols-2">
                <ActiveHotspotsMap />
                <Card className="bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Verification Insights
                    </CardTitle>
                    <CardDescription>
                      AI-generated insights from recent verifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        Emerging Pattern Detected
                      </h4>
                      <p className="text-sm text-muted-foreground mt-2">
                        Increased protest activity detected in East African urban centers. 
                        Recommend prioritizing verification of related reports.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-500" />
                        Verification Efficiency
                      </h4>
                      <p className="text-sm text-muted-foreground mt-2">
                        Average verification time improved by 18% this week. 
                        AI-assisted pre-screening contributing to faster decisions.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-500" />
                        Cross-Reference Success
                      </h4>
                      <p className="text-sm text-muted-foreground mt-2">
                        73% of verified reports cross-referenced with external sources.
                        Source triangulation remains a key verification strength.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Queue Tab */}
            <TabsContent value="queue" className="mt-6">
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <VerificationQueue />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Monitoring Tab */}
            <TabsContent value="monitoring" className="mt-6 space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <ThreatMonitorPanel />
                <ActiveHotspotsMap />
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <PatternDetectionPanel />
                <ReporterSafetyAlerts />
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-6">
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Verification Analytics
                  </CardTitle>
                  <CardDescription>
                    Comprehensive analytics and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VerificationAnalytics />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default VerifierDashboard;
