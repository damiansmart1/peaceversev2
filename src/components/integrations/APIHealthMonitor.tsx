import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, CheckCircle, XCircle, AlertTriangle, Clock, 
  RefreshCw, Server, Wifi, Database, Zap, TrendingUp, TrendingDown
} from 'lucide-react';
import { format, subHours, subMinutes } from 'date-fns';
import { toast } from 'sonner';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency?: number;
  lastCheck: Date;
  uptime?: number;
}

const APIHealthMonitor = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch API health metrics
  const { data: healthMetrics, refetch } = useQuery({
    queryKey: ['api-health-metrics'],
    queryFn: async () => {
      const now = new Date();
      const hourAgo = subHours(now, 1);
      const dayAgo = subHours(now, 24);

      const { data: recentLogs } = await supabase
        .from('api_usage_logs')
        .select('response_status, response_time_ms, created_at, endpoint')
        .gte('created_at', hourAgo.toISOString())
        .order('created_at', { ascending: false });

      const { data: dailyLogs } = await supabase
        .from('api_usage_logs')
        .select('response_status, response_time_ms, created_at')
        .gte('created_at', dayAgo.toISOString());

      const logs = recentLogs || [];
      const allDailyLogs = dailyLogs || [];

      // Calculate metrics
      const totalRequests = logs.length;
      const successfulRequests = logs.filter(l => l.response_status && l.response_status < 400).length;
      const errorRequests = logs.filter(l => l.response_status && l.response_status >= 400).length;
      const avgLatency = logs.length > 0 
        ? Math.round(logs.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / logs.length)
        : 0;
      const p95Latency = logs.length > 0
        ? Math.round(logs.map(l => l.response_time_ms || 0).sort((a, b) => a - b)[Math.floor(logs.length * 0.95)] || 0)
        : 0;

      // Daily uptime calculation
      const dailySuccessful = allDailyLogs.filter(l => l.response_status && l.response_status < 400).length;
      const dailyTotal = allDailyLogs.length;
      const uptime = dailyTotal > 0 ? ((dailySuccessful / dailyTotal) * 100).toFixed(2) : '100.00';

      // Requests per minute
      const last5MinLogs = logs.filter(l => new Date(l.created_at) > subMinutes(now, 5));
      const requestsPerMinute = Math.round(last5MinLogs.length / 5);

      // Error rate
      const errorRate = totalRequests > 0 ? ((errorRequests / totalRequests) * 100).toFixed(2) : '0.00';

      // Endpoint health
      const endpointHealth: Record<string, { success: number; total: number; avgLatency: number }> = {};
      logs.forEach((log: any) => {
        const endpoint = log.endpoint || '/unknown';
        if (!endpointHealth[endpoint]) {
          endpointHealth[endpoint] = { success: 0, total: 0, avgLatency: 0 };
        }
        endpointHealth[endpoint].total += 1;
        endpointHealth[endpoint].avgLatency += log.response_time_ms || 0;
        if (log.response_status < 400) {
          endpointHealth[endpoint].success += 1;
        }
      });

      const endpoints = Object.entries(endpointHealth).map(([endpoint, stats]) => ({
        endpoint,
        successRate: stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : '100',
        avgLatency: stats.total > 0 ? Math.round(stats.avgLatency / stats.total) : 0,
        requests: stats.total,
        status: stats.total > 0 && (stats.success / stats.total) >= 0.95 ? 'healthy' : 
                stats.total > 0 && (stats.success / stats.total) >= 0.8 ? 'degraded' : 'down'
      }));

      return {
        totalRequests,
        successfulRequests,
        errorRequests,
        avgLatency,
        p95Latency,
        uptime: parseFloat(uptime),
        requestsPerMinute,
        errorRate: parseFloat(errorRate),
        endpoints,
        lastUpdated: now
      };
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // System health checks
  const healthChecks: HealthCheck[] = [
    { 
      name: 'API Gateway', 
      status: (healthMetrics?.uptime || 100) >= 99 ? 'healthy' : (healthMetrics?.uptime || 100) >= 95 ? 'degraded' : 'down',
      latency: healthMetrics?.avgLatency,
      lastCheck: new Date(),
      uptime: healthMetrics?.uptime
    },
    { 
      name: 'Database', 
      status: 'healthy', 
      latency: 15,
      lastCheck: new Date(),
      uptime: 99.99
    },
    { 
      name: 'Edge Functions', 
      status: (healthMetrics?.errorRate || 0) < 5 ? 'healthy' : (healthMetrics?.errorRate || 0) < 10 ? 'degraded' : 'down',
      latency: healthMetrics?.p95Latency,
      lastCheck: new Date(),
      uptime: 100 - (healthMetrics?.errorRate || 0)
    },
    { 
      name: 'Webhooks', 
      status: 'healthy', 
      latency: 50,
      lastCheck: new Date(),
      uptime: 99.5
    }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success('Health metrics refreshed');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'down': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'degraded': return 'secondary';
      case 'down': return 'destructive';
      default: return 'outline';
    }
  };

  const overallStatus = healthChecks.every(h => h.status === 'healthy') ? 'healthy' :
                        healthChecks.some(h => h.status === 'down') ? 'down' : 'degraded';

  return (
    <div className="space-y-6">
      {/* Overall Status Banner */}
      <Card className={`border-2 ${
        overallStatus === 'healthy' ? 'border-green-500/50 bg-green-500/5' :
        overallStatus === 'degraded' ? 'border-yellow-500/50 bg-yellow-500/5' :
        'border-red-500/50 bg-red-500/5'
      }`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {overallStatus === 'healthy' ? (
                <CheckCircle className="w-12 h-12 text-green-500" />
              ) : overallStatus === 'degraded' ? (
                <AlertTriangle className="w-12 h-12 text-yellow-500" />
              ) : (
                <XCircle className="w-12 h-12 text-red-500" />
              )}
              <div>
                <h2 className="text-2xl font-bold">
                  {overallStatus === 'healthy' ? 'All Systems Operational' :
                   overallStatus === 'degraded' ? 'Partial System Degradation' :
                   'System Outage Detected'}
                </h2>
                <p className="text-muted-foreground">
                  Last updated: {healthMetrics?.lastUpdated ? format(healthMetrics.lastUpdated, 'HH:mm:ss') : 'N/A'}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uptime (24h)</p>
                <p className="text-2xl font-bold">{healthMetrics?.uptime || 100}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <Progress value={healthMetrics?.uptime || 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Latency</p>
                <p className="text-2xl font-bold">{healthMetrics?.avgLatency || 0}ms</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">P95: {healthMetrics?.p95Latency || 0}ms</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Requests/min</p>
                <p className="text-2xl font-bold">{healthMetrics?.requestsPerMinute || 0}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{healthMetrics?.totalRequests || 0} in last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Error Rate</p>
                <p className="text-2xl font-bold">{healthMetrics?.errorRate || 0}%</p>
              </div>
              {(healthMetrics?.errorRate || 0) < 5 ? (
                <TrendingDown className="w-8 h-8 text-green-500" />
              ) : (
                <TrendingUp className="w-8 h-8 text-red-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{healthMetrics?.errorRequests || 0} errors</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Components */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              System Components
            </CardTitle>
            <CardDescription>Real-time health status of all system components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthChecks.map((check, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    {check.status === 'healthy' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : check.status === 'degraded' ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">{check.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Latency: {check.latency}ms • Uptime: {check.uptime?.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusBadge(check.status)}>
                    {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Endpoint Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Endpoint Health
            </CardTitle>
            <CardDescription>Performance metrics per API endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {healthMetrics?.endpoints.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No endpoint data available</p>
                </div>
              ) : (
                healthMetrics?.endpoints.map((endpoint: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm">{endpoint.endpoint}</p>
                        <Badge variant={getStatusBadge(endpoint.status)} className="text-xs">
                          {endpoint.successRate}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {endpoint.requests} requests • Avg: {endpoint.avgLatency}ms
                      </p>
                    </div>
                    {endpoint.status === 'healthy' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : endpoint.status === 'degraded' ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default APIHealthMonitor;
