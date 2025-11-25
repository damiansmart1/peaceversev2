import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { 
  Download, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Brain,
  Shield,
  BarChart3,
  Calendar as CalendarIcon,
  Filter
} from 'lucide-react';
import {
  useAIAnalyticsSummary,
  useAIAnalysisLogs,
  useGenerateAIReport,
  useAIReportExports,
  type ReportFilters
} from '@/hooks/useAIAnalytics';
import LoadingSpinner from '@/components/LoadingSpinner';
import DataTable from '@/components/DataTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

export function AdminAIAnalytics() {
  const [timeRange, setTimeRange] = useState<number>(30);
  const [filters, setFilters] = useState<ReportFilters>({});
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const { data: summaryData, isLoading: summaryLoading } = useAIAnalyticsSummary(timeRange);
  const { data: logsData, isLoading: logsLoading } = useAIAnalysisLogs(filters);
  const { data: exportsData } = useAIReportExports();
  const generateReport = useGenerateAIReport();

  const latestSummary = summaryData?.[0];

  // Prepare chart data
  const trendData = summaryData?.map(d => ({
    date: format(new Date(d.date), 'MMM dd'),
    analyses: d.total_analyses,
    confidence: d.average_confidence?.toFixed(1),
    critical: d.critical_detections
  })).reverse();

  const typeDistribution = latestSummary?.analysis_type_breakdown 
    ? Object.entries(latestSummary.analysis_type_breakdown).map(([name, value]) => ({
        name: name.replace(/_/g, ' ').toUpperCase(),
        value
      }))
    : [];

  const modelUsage = latestSummary?.model_usage_stats
    ? Object.entries(latestSummary.model_usage_stats).map(([name, value]) => ({
        name,
        value
      }))
    : [];

  const handleGenerateReport = (type: 'comprehensive' | 'summary' | 'security') => {
    const reportFilters: ReportFilters = {
      ...filters,
      dateFrom: dateFrom?.toISOString(),
      dateTo: dateTo?.toISOString(),
    };
    generateReport.mutate({ reportType: type, filters: reportFilters });
  };

  const handleApplyFilters = () => {
    setFilters({
      dateFrom: dateFrom?.toISOString(),
      dateTo: dateTo?.toISOString(),
    });
  };

  if (summaryLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI ANALYTICS</h2>
          <p className="text-muted-foreground">
            Comprehensive AI analysis monitoring and reporting
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange.toString()} onValueChange={(v) => setTimeRange(Number(v))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TOTAL ANALYSES</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestSummary?.total_analyses || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{summaryData?.reduce((sum, d) => sum + d.total_analyses, 0) || 0} this period
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AVG CONFIDENCE</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestSummary?.average_confidence?.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {latestSummary?.high_confidence_count || 0} high confidence
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CRITICAL DETECTIONS</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {latestSummary?.critical_detections || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VALIDATION STATUS</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestSummary?.flagged_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Flagged for review
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">OVERVIEW</TabsTrigger>
          <TabsTrigger value="logs">ANALYSIS LOGS</TabsTrigger>
          <TabsTrigger value="reports">GENERATE REPORTS</TabsTrigger>
          <TabsTrigger value="exports">EXPORT HISTORY</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Trends Chart */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>ANALYSIS TRENDS</CardTitle>
              <CardDescription>Daily analysis volume and confidence scores</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="analyses" stroke="hsl(var(--primary))" strokeWidth={2} name="Analyses" />
                  <Line type="monotone" dataKey="critical" stroke="hsl(var(--destructive))" strokeWidth={2} name="Critical" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Analysis Type Distribution */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>ANALYSIS TYPE DISTRIBUTION</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={typeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {typeDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Model Usage */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>MODEL USAGE</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={modelUsage}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)'
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>RECENT ANALYSIS LOGS</CardTitle>
              <CardDescription>Detailed view of AI analysis activity</CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <LoadingSpinner />
              ) : (
                <DataTable
                  columns={[
                    { key: 'id', label: 'ID' },
                    { key: 'analysis_type', label: 'Type' },
                    { key: 'model_used', label: 'Model' },
                    { 
                      key: 'confidence_score',
                      label: 'Confidence',
                      render: (row: any) => (
                        <Badge variant={row.confidence_score >= 80 ? 'default' : row.confidence_score >= 60 ? 'secondary' : 'destructive'}>
                          {row.confidence_score?.toFixed(1)}%
                        </Badge>
                      )
                    },
                    { 
                      key: 'validation_status',
                      label: 'Status',
                      render: (row: any) => (
                        <Badge variant={row.validation_status === 'validated' ? 'default' : row.validation_status === 'flagged' ? 'destructive' : 'secondary'}>
                          {row.validation_status?.toUpperCase()}
                        </Badge>
                      )
                    },
                    { 
                      key: 'created_at',
                      label: 'Date',
                      render: (row: any) => format(new Date(row.created_at), 'PPp')
                    },
                  ]}
                  data={logsData || []}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>GENERATE ANALYSIS REPORTS</CardTitle>
              <CardDescription>Create comprehensive AI analysis reports with custom filters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">DATE FROM</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">DATE TO</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">ACTIONS</label>
                  <Button onClick={handleApplyFilters} variant="outline" className="w-full">
                    <Filter className="mr-2 h-4 w-4" />
                    APPLY FILTERS
                  </Button>
                </div>
              </div>

              {/* Report Types */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg">COMPREHENSIVE</CardTitle>
                    <CardDescription>Full detailed analysis report</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => handleGenerateReport('comprehensive')}
                      disabled={generateReport.isPending}
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      GENERATE
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg">SUMMARY</CardTitle>
                    <CardDescription>Statistical overview report</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => handleGenerateReport('summary')}
                      disabled={generateReport.isPending}
                      className="w-full"
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      GENERATE
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg">SECURITY</CardTitle>
                    <CardDescription>Threat and security analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => handleGenerateReport('security')}
                      disabled={generateReport.isPending}
                      className="w-full"
                      variant="destructive"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      GENERATE
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exports" className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>EXPORT HISTORY</CardTitle>
              <CardDescription>Previously generated reports and exports</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  { key: 'report_type', label: 'Type' },
                  { 
                    key: 'status',
                    label: 'Status',
                    render: (row: any) => (
                      <Badge variant={row.status === 'completed' ? 'default' : row.status === 'failed' ? 'destructive' : 'secondary'}>
                        {row.status?.toUpperCase()}
                      </Badge>
                    )
                  },
                  { key: 'record_count', label: 'Records' },
                  { 
                    key: 'created_at',
                    label: 'Created',
                    render: (row: any) => format(new Date(row.created_at), 'PPp')
                  },
                  { 
                    key: 'expires_at',
                    label: 'Expires',
                    render: (row: any) => format(new Date(row.expires_at), 'PPp')
                  },
                ]}
                data={exportsData || []}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}