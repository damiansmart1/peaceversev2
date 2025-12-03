import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { Activity, Key, Clock, AlertCircle, TrendingUp, Globe, Zap, Server } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#7cd9ff'];

export const AdminAPIUsageAnalytics = () => {
  // Fetch overall API stats
  const { data: apiStats } = useQuery({
    queryKey: ['api-usage-stats'],
    queryFn: async () => {
      const now = new Date();
      const dayAgo = subDays(now, 1);
      const weekAgo = subDays(now, 7);
      const monthAgo = subDays(now, 30);

      const [allLogs, apiKeys] = await Promise.all([
        supabase.from('api_usage_logs').select('*').order('created_at', { ascending: false }),
        supabase.from('api_keys').select('*'),
      ]);

      const logs = allLogs.data || [];
      const keys = apiKeys.data || [];

      const totalCalls = logs.length;
      const callsToday = logs.filter(l => new Date(l.created_at) > dayAgo).length;
      const callsThisWeek = logs.filter(l => new Date(l.created_at) > weekAgo).length;
      const callsThisMonth = logs.filter(l => new Date(l.created_at) > monthAgo).length;

      const avgResponseTime = logs.length > 0
        ? Math.round(logs.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / logs.length)
        : 0;

      const successfulCalls = logs.filter(l => l.response_status && l.response_status < 400).length;
      const errorCalls = logs.filter(l => l.response_status && l.response_status >= 400).length;
      const successRate = totalCalls > 0 ? ((successfulCalls / totalCalls) * 100).toFixed(1) : '0';

      const activeKeys = keys.filter(k => k.is_active).length;
      const totalKeys = keys.length;

      return {
        totalCalls,
        callsToday,
        callsThisWeek,
        callsThisMonth,
        avgResponseTime,
        successRate: parseFloat(successRate),
        errorCalls,
        activeKeys,
        totalKeys,
      };
    },
  });

  // Fetch usage by endpoint
  const { data: endpointData } = useQuery({
    queryKey: ['api-endpoint-usage'],
    queryFn: async () => {
      const { data } = await supabase.from('api_usage_logs').select('endpoint, response_status, response_time_ms');
      
      const endpointStats: Record<string, { calls: number; errors: number; avgTime: number; totalTime: number }> = {};
      
      data?.forEach((log: any) => {
        const endpoint = log.endpoint || '/unknown';
        if (!endpointStats[endpoint]) {
          endpointStats[endpoint] = { calls: 0, errors: 0, avgTime: 0, totalTime: 0 };
        }
        endpointStats[endpoint].calls += 1;
        endpointStats[endpoint].totalTime += log.response_time_ms || 0;
        if (log.response_status >= 400) {
          endpointStats[endpoint].errors += 1;
        }
      });

      return Object.entries(endpointStats).map(([endpoint, stats]) => ({
        endpoint,
        calls: stats.calls,
        errors: stats.errors,
        avgTime: stats.calls > 0 ? Math.round(stats.totalTime / stats.calls) : 0,
        successRate: stats.calls > 0 ? (((stats.calls - stats.errors) / stats.calls) * 100).toFixed(1) : '100',
      })).sort((a, b) => b.calls - a.calls);
    },
  });

  // Fetch usage over time (last 30 days)
  const { data: timeSeriesData } = useQuery({
    queryKey: ['api-usage-timeseries'],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30);
      const { data } = await supabase
        .from('api_usage_logs')
        .select('created_at, response_status, response_time_ms')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      const dailyStats: Record<string, { date: string; calls: number; errors: number; avgTime: number; totalTime: number }> = {};

      // Initialize all 30 days
      for (let i = 29; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'MMM dd');
        dailyStats[date] = { date, calls: 0, errors: 0, avgTime: 0, totalTime: 0 };
      }

      data?.forEach((log: any) => {
        const date = format(new Date(log.created_at), 'MMM dd');
        if (dailyStats[date]) {
          dailyStats[date].calls += 1;
          dailyStats[date].totalTime += log.response_time_ms || 0;
          if (log.response_status >= 400) {
            dailyStats[date].errors += 1;
          }
        }
      });

      return Object.values(dailyStats).map(day => ({
        ...day,
        avgTime: day.calls > 0 ? Math.round(day.totalTime / day.calls) : 0,
      }));
    },
  });

  // Fetch status code distribution
  const { data: statusCodeData } = useQuery({
    queryKey: ['api-status-codes'],
    queryFn: async () => {
      const { data } = await supabase.from('api_usage_logs').select('response_status');
      
      const statusCounts: Record<string, number> = {};
      
      data?.forEach((log: any) => {
        const status = log.response_status?.toString() || 'Unknown';
        const statusGroup = status.startsWith('2') ? '2xx Success' :
                          status.startsWith('3') ? '3xx Redirect' :
                          status.startsWith('4') ? '4xx Client Error' :
                          status.startsWith('5') ? '5xx Server Error' : 'Unknown';
        statusCounts[statusGroup] = (statusCounts[statusGroup] || 0) + 1;
      });

      return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    },
  });

  // Fetch top API keys by usage
  const { data: topApiKeys } = useQuery({
    queryKey: ['top-api-keys'],
    queryFn: async () => {
      const { data: logs } = await supabase.from('api_usage_logs').select('api_key_id');
      const { data: keys } = await supabase.from('api_keys').select('id, name, key_prefix, is_active, organization_name');

      const keyUsage: Record<string, number> = {};
      logs?.forEach((log: any) => {
        if (log.api_key_id) {
          keyUsage[log.api_key_id] = (keyUsage[log.api_key_id] || 0) + 1;
        }
      });

      return keys?.map((key: any) => ({
        ...key,
        usage: keyUsage[key.id] || 0,
      })).sort((a, b) => b.usage - a.usage).slice(0, 10) || [];
    },
  });

  // Fetch recent API logs
  const { data: recentLogs } = useQuery({
    queryKey: ['recent-api-logs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('api_usage_logs')
        .select('*, api_keys(name, key_prefix)')
        .order('created_at', { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">API Usage Analytics</h2>
          <p className="text-muted-foreground">Monitor API performance, usage patterns, and integration health</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Activity className="w-4 h-4 mr-2" />
          Live Monitoring
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
            <Globe className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(apiStats?.totalCalls || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {apiStats?.callsToday || 0} today · {apiStats?.callsThisWeek || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiStats?.avgResponseTime || 0}ms</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all endpoints
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{apiStats?.successRate || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {apiStats?.errorCalls || 0} errors total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
            <Key className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiStats?.activeKeys || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {apiStats?.totalKeys || 0} total keys
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="status">Status Codes</TabsTrigger>
          <TabsTrigger value="logs">Recent Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Usage Over Time</CardTitle>
              <CardDescription>Daily API calls and error rates (last 30 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={timeSeriesData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="calls" stackId="1" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.6} name="Total Calls" />
                  <Area type="monotone" dataKey="errors" stackId="2" stroke={COLORS[6]} fill={COLORS[6]} fillOpacity={0.6} name="Errors" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Response Time Trends</CardTitle>
              <CardDescription>Average response time per day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" unit="ms" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avgTime" stroke={COLORS[1]} strokeWidth={2} name="Avg Response Time (ms)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Endpoint Usage Distribution</CardTitle>
                <CardDescription>API calls by endpoint</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={endpointData?.slice(0, 8) || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="endpoint" type="category" width={100} className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="calls" fill={COLORS[0]} name="Calls" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Endpoint Performance</CardTitle>
                <CardDescription>Response times and success rates</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Endpoint</TableHead>
                      <TableHead className="text-right">Calls</TableHead>
                      <TableHead className="text-right">Avg Time</TableHead>
                      <TableHead className="text-right">Success</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {endpointData?.slice(0, 8).map((endpoint: any) => (
                      <TableRow key={endpoint.endpoint}>
                        <TableCell className="font-mono text-sm">{endpoint.endpoint}</TableCell>
                        <TableCell className="text-right">{endpoint.calls}</TableCell>
                        <TableCell className="text-right">{endpoint.avgTime}ms</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={parseFloat(endpoint.successRate) >= 95 ? 'default' : parseFloat(endpoint.successRate) >= 80 ? 'secondary' : 'destructive'}>
                            {endpoint.successRate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top API Keys by Usage</CardTitle>
              <CardDescription>Most active API keys and their usage statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key Name</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Key Prefix</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total Calls</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topApiKeys?.map((key: any) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell>{key.organization_name || '-'}</TableCell>
                      <TableCell className="font-mono text-sm">{key.key_prefix}...</TableCell>
                      <TableCell>
                        <Badge variant={key.is_active ? 'default' : 'secondary'}>
                          {key.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold">{key.usage.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {(!topApiKeys || topApiKeys.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No API keys found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Response Status Distribution</CardTitle>
                <CardDescription>Breakdown of HTTP status codes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={statusCodeData || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(statusCodeData || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Code Summary</CardTitle>
                <CardDescription>HTTP response codes breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusCodeData?.map((status: any, index: number) => (
                    <div key={status.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{status.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{status.value.toLocaleString()}</span>
                        <span className="text-muted-foreground text-sm">calls</span>
                      </div>
                    </div>
                  ))}
                  {(!statusCodeData || statusCodeData.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent API Requests</CardTitle>
              <CardDescription>Last 50 API calls</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Response Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLogs?.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.endpoint}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.method}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.api_keys?.name || log.api_keys?.key_prefix || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            log.response_status < 300 ? 'default' : 
                            log.response_status < 400 ? 'secondary' : 
                            'destructive'
                          }
                        >
                          {log.response_status || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {log.response_time_ms ? `${log.response_time_ms}ms` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!recentLogs || recentLogs.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No API logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
