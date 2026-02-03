import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Globe,
  Shield,
  FileText,
  Download,
  RefreshCw,
  Eye,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import { 
  useElectionStats, 
  useElectionIncidents,
  usePollingStations,
  useElectionObservers,
  useElectionResults,
  type Election 
} from '@/hooks/useElections';
import { format, differenceInHours } from 'date-fns';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

interface ElectionRealTimeDashboardProps {
  election: Election;
}

const SEVERITY_COLORS = {
  minor: '#94a3b8',
  moderate: '#eab308',
  serious: '#f97316',
  critical: '#ef4444',
  emergency: '#991b1b',
};

const STATUS_COLORS = {
  pending: '#94a3b8',
  verified: '#22c55e',
  unverified: '#ef4444',
  disputed: '#f97316',
};

export default function ElectionRealTimeDashboard({ election }: ElectionRealTimeDashboardProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const { data: stats, refetch: refetchStats } = useElectionStats(election.id);
  const { data: incidents } = useElectionIncidents(election.id);
  const { data: stations } = usePollingStations(election.id);
  const { data: observers } = useElectionObservers(election.id);
  const { data: results } = useElectionResults(election.id);

  // Calculate real-time metrics
  const metrics = useMemo(() => {
    if (!incidents || !stations || !observers || !results) {
      return null;
    }

    const now = new Date();
    const last24h = incidents.filter(i => 
      differenceInHours(now, new Date(i.incident_datetime)) <= 24
    );
    const lastHour = incidents.filter(i => 
      differenceInHours(now, new Date(i.incident_datetime)) <= 1
    );

    // Calculate turnout
    const totalRegistered = stations.reduce((sum, s) => sum + s.registered_voters, 0);
    const totalVotesCast = results.reduce((sum, r) => sum + r.total_votes_cast, 0);
    const turnoutPercentage = totalRegistered > 0 ? (totalVotesCast / totalRegistered) * 100 : 0;

    // Calculate incident severity distribution
    const severityDist = incidents.reduce((acc, i) => {
      acc[i.severity] = (acc[i.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate regional breakdown
    const regionalIncidents = incidents.reduce((acc, i) => {
      const region = i.region || 'Unknown';
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Hourly incident trend (last 12 hours)
    const hourlyTrend = Array.from({ length: 12 }, (_, i) => {
      const hour = new Date();
      hour.setHours(hour.getHours() - (11 - i));
      const hourStart = new Date(hour);
      hourStart.setMinutes(0, 0, 0);
      const hourEnd = new Date(hourStart);
      hourEnd.setHours(hourEnd.getHours() + 1);
      
      const count = incidents.filter(inc => {
        const incTime = new Date(inc.incident_datetime);
        return incTime >= hourStart && incTime < hourEnd;
      }).length;

      return {
        hour: format(hourStart, 'HH:mm'),
        incidents: count,
        critical: incidents.filter(inc => {
          const incTime = new Date(inc.incident_datetime);
          return incTime >= hourStart && incTime < hourEnd && 
                 (inc.severity === 'critical' || inc.severity === 'emergency');
        }).length,
      };
    });

    return {
      totalIncidents: incidents.length,
      last24hIncidents: last24h.length,
      lastHourIncidents: lastHour.length,
      criticalCount: incidents.filter(i => i.severity === 'critical' || i.severity === 'emergency').length,
      pendingVerification: incidents.filter(i => i.verification_status === 'pending').length,
      resolvedCount: incidents.filter(i => i.status === 'resolved').length,
      activeStations: stations.filter(s => s.is_active).length,
      totalStations: stations.length,
      deployedObservers: observers.filter(o => o.deployment_status === 'deployed').length,
      totalObservers: observers.length,
      turnoutPercentage,
      verifiedResults: results.filter(r => r.fully_verified).length,
      totalResults: results.length,
      severityDist,
      regionalIncidents,
      hourlyTrend,
    };
  }, [incidents, stations, observers, results]);

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
    refetchStats();
  }, [refetchStats]);

  // Listen for online/offline status
  useState(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });

  const severityPieData = metrics ? Object.entries(metrics.severityDist).map(([name, value]) => ({
    name,
    value,
    color: SEVERITY_COLORS[name as keyof typeof SEVERITY_COLORS] || '#94a3b8',
  })) : [];

  const regionalBarData = metrics ? Object.entries(metrics.regionalIncidents)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([region, count]) => ({ region, count })) : [];

  return (
    <div className="space-y-6" key={refreshKey}>
      {/* Header with status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${election.status === 'voting' ? 'bg-amber-500/20 animate-pulse' : 'bg-primary/20'}`}>
            <Activity className={`h-5 w-5 ${election.status === 'voting' ? 'text-amber-600' : 'text-primary'}`} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Real-Time Dashboard</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3 text-green-500" />
                  <span>Live updates enabled</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-red-500" />
                  <span>Offline - cached data</span>
                </>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Last Hour</p>
                <p className="text-2xl font-bold">{metrics?.lastHourIncidents || 0}</p>
              </div>
              <Zap className="h-6 w-6 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">{metrics?.criticalCount || 0}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{metrics?.pendingVerification || 0}</p>
              </div>
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Turnout</p>
                <p className="text-2xl font-bold">{metrics?.turnoutPercentage.toFixed(1) || 0}%</p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Observers</p>
                <p className="text-2xl font-bold">{metrics?.deployedObservers || 0}</p>
              </div>
              <Users className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold">{metrics?.verifiedResults || 0}/{metrics?.totalResults || 0}</p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Incident Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Incident Trend (12h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics?.hourlyTrend || []}>
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="incidents" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary) / 0.2)" 
                    name="All Incidents"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="critical" 
                    stroke="#ef4444" 
                    fill="#ef444433" 
                    name="Critical"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Severity Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {severityPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Regional Breakdown */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Regional Incident Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalBarData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="region" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Station Status Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Polling Station Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{metrics?.activeStations || 0}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stations?.filter(s => s.setup_verified).length || 0}</p>
              <p className="text-xs text-muted-foreground">Verified Setup</p>
            </div>
            <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">{stations?.filter(s => s.opened_at && !s.closed_at).length || 0}</p>
              <p className="text-xs text-muted-foreground">Open Now</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{stations?.filter(s => s.is_accessible).length || 0}</p>
              <p className="text-xs text-muted-foreground">Accessible</p>
            </div>
          </div>
          
          {/* Progress bar for overall coverage */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Results Received</span>
              <span>{metrics?.totalResults || 0} / {metrics?.totalStations || 0} stations</span>
            </div>
            <Progress 
              value={metrics && metrics.totalStations > 0 ? (metrics.totalResults / metrics.totalStations) * 100 : 0} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}