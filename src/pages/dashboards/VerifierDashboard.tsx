import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import DashboardHeroBanner from '@/components/DashboardHeroBanner';
import { Shield, Activity, BarChart3, MapPin, TrendingUp, AlertTriangle, Settings } from 'lucide-react';
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
  const { tasks, isLoading, refetch } = useVerificationTasks();
  const [activeTab, setActiveTab] = useState('overview');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase.channel('verifier-dashboard-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'verification_tasks' }, () => {
        refetch();
        setLastRefresh(new Date());
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'citizen_reports' }, () => {
        refetch();
        setLastRefresh(new Date());
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
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
    verificationRate: completedTasks > 0 ? Math.round(completedTasks / (completedTasks + pendingTasks) * 100) : 0,
    avgResponseTime: '2.4h',
    activeHotspots: 7,
    patternsDetected: 12
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setLastRefresh(new Date());
    setIsRefreshing(false);
    toast({ title: 'Dashboard Refreshed', description: 'All data has been synchronized.' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Hero Banner */}
          <DashboardHeroBanner
            icon={<Shield className="h-8 w-8 text-gold" />}
            title="Verification Command Center"
            subtitle="Early Warning & Incident Verification Dashboard"
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            accentColor="gold"
            actions={
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            }
          />

          {/* Stats Overview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <VerifierStatsOverview stats={stats} />
          </motion.div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            <TabsList className="bg-card/80 backdrop-blur-sm border border-border/50 p-1 rounded-xl grid w-full grid-cols-4 gap-1">
              <TabsTrigger value="overview" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="queue" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Queue</span>
                {pendingTasks > 0 && <Badge variant="secondary" className="ml-1 bg-destructive text-destructive-foreground text-xs">{pendingTasks}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">Monitoring</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6">
                  <QuickVerificationActions />
                  <ReporterSafetyAlerts />
                </div>
                <div className="lg:col-span-1">
                  <ThreatMonitorPanel />
                </div>
                <div className="space-y-6">
                  <PatternDetectionPanel />
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <ActiveHotspotsMap />
                <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Verification Insights
                    </CardTitle>
                    <CardDescription>AI-generated insights from recent verifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-xl bg-warning/5 border border-warning/20">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        Emerging Pattern Detected
                      </h4>
                      <p className="text-sm text-muted-foreground mt-2">
                        Increased protest activity detected in East African urban centers. Recommend prioritizing verification.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <Activity className="w-4 h-4 text-success" />
                        Verification Efficiency
                      </h4>
                      <p className="text-sm text-muted-foreground mt-2">
                        Average verification time improved by 18% this week. AI-assisted pre-screening contributing.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        Cross-Reference Success
                      </h4>
                      <p className="text-sm text-muted-foreground mt-2">
                        73% of verified reports cross-referenced with external sources.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="queue" className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                <CardContent className="pt-6">
                  <VerificationQueue />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <ThreatMonitorPanel />
                <ActiveHotspotsMap />
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <PatternDetectionPanel />
                <ReporterSafetyAlerts />
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Verification Analytics
                  </CardTitle>
                  <CardDescription>Comprehensive analytics and performance metrics</CardDescription>
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
