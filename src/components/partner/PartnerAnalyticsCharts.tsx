import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, MapPin, Activity } from 'lucide-react';
import type { PartnerAnalyticsData, CategoryBreakdown, TimeSeriesData, GeographicDistribution } from '@/hooks/usePartnerAnalytics';

interface PartnerAnalyticsChartsProps {
  data: PartnerAnalyticsData;
}

const SEVERITY_COLORS = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#ca8a04',
  low: '#16a34a',
  unknown: '#6b7280',
};

const CATEGORY_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', 
  '#6366f1', '#06b6d4', '#84cc16', '#f43f5e', '#22c55e'
];

const STATUS_COLORS = {
  pending: '#f59e0b',
  verified: '#22c55e',
  resolved: '#3b82f6',
  escalated: '#ef4444',
  rejected: '#6b7280',
};

export const PartnerAnalyticsCharts = ({ data }: PartnerAnalyticsChartsProps) => {
  const { overview, categoryBreakdown, timeSeriesData, geographicDistribution, riskAssessment, hotspots } = data;

  // Prepare pie chart data for categories
  const categoryPieData = categoryBreakdown.slice(0, 8).map((cat, index) => ({
    name: cat.category,
    value: cat.count,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  // Prepare severity distribution data
  const severityData = [
    { name: 'Critical', value: overview.criticalIncidents, color: SEVERITY_COLORS.critical },
    { name: 'High', value: overview.highPriorityIncidents - overview.criticalIncidents, color: SEVERITY_COLORS.high },
    { name: 'Pending', value: overview.pendingVerification, color: SEVERITY_COLORS.medium },
    { name: 'Resolved', value: overview.resolvedIncidents, color: SEVERITY_COLORS.low },
  ].filter(d => d.value > 0);

  // Status distribution
  const statusData = [
    { status: 'Pending', count: overview.pendingVerification, fill: STATUS_COLORS.pending },
    { status: 'Verified', count: overview.verifiedIncidents, fill: STATUS_COLORS.verified },
    { status: 'Resolved', count: overview.resolvedIncidents, fill: STATUS_COLORS.resolved },
    { status: 'Escalated', count: overview.escalatedIncidents, fill: STATUS_COLORS.escalated },
  ];

  // Radar data for risk factors
  const radarData = [
    { factor: 'Critical Ratio', score: overview.totalIncidents > 0 ? Math.min((overview.criticalIncidents / overview.totalIncidents) * 100, 100) : 0, fullMark: 100 },
    { factor: 'Escalation Rate', score: overview.totalIncidents > 0 ? Math.min((overview.escalatedIncidents / overview.totalIncidents) * 100, 100) : 0, fullMark: 100 },
    { factor: 'Pending Backlog', score: overview.totalIncidents > 0 ? Math.min((overview.pendingVerification / overview.totalIncidents) * 100, 100) : 0, fullMark: 100 },
    { factor: 'Resolution Rate', score: overview.resolutionRate, fullMark: 100 },
    { factor: 'Verification Rate', score: overview.verificationRate, fullMark: 100 },
  ];

  // Top countries data
  const topCountriesData = geographicDistribution
    .reduce((acc: { country: string; incidents: number; critical: number }[], geo) => {
      const existing = acc.find(c => c.country === geo.country);
      if (existing) {
        existing.incidents += geo.incidentCount;
        existing.critical += geo.criticalCount;
      } else {
        acc.push({ country: geo.country, incidents: geo.incidentCount, critical: geo.criticalCount });
      }
      return acc;
    }, [])
    .sort((a, b) => b.incidents - a.incidents)
    .slice(0, 8);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'moderate': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-green-500 bg-green-500/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Assessment Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score Card */}
        <Card className={`border-l-4 ${
          riskAssessment.riskLevel === 'critical' ? 'border-l-red-500' :
          riskAssessment.riskLevel === 'high' ? 'border-l-orange-500' :
          riskAssessment.riskLevel === 'moderate' ? 'border-l-yellow-500' :
          'border-l-green-500'
        }`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Risk Assessment Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${getRiskLevelColor(riskAssessment.riskLevel)}`}>
                  {riskAssessment.riskScore}
                </div>
              </div>
              <div className="flex-1">
                <Badge className={`mb-2 ${getRiskLevelColor(riskAssessment.riskLevel)}`}>
                  {riskAssessment.riskLevel.toUpperCase()} RISK
                </Badge>
                <div className="space-y-1">
                  {riskAssessment.factors.slice(0, 2).map((factor, i) => (
                    <p key={i} className="text-xs text-muted-foreground">{factor}</p>
                  ))}
                </div>
              </div>
            </div>
            <Progress 
              value={riskAssessment.riskScore} 
              className="mt-4 h-2"
            />
          </CardContent>
        </Card>

        {/* Risk Radar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risk Factor Analysis</CardTitle>
            <CardDescription className="text-xs">Multi-dimensional risk assessment</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis 
                  dataKey="factor" 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Time Series & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Trend Line Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              30-Day Incident Trend
            </CardTitle>
            <CardDescription className="text-xs">Daily incident reporting patterns</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => format(new Date(val), 'MMM d')}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  labelFormatter={(val) => format(new Date(val), 'MMMM d, yyyy')}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area
                  type="monotone"
                  dataKey="incidents"
                  name="Total Incidents"
                  stroke="hsl(var(--primary))"
                  fill="url(#colorIncidents)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="critical"
                  name="Critical"
                  stroke="#dc2626"
                  fill="url(#colorCritical)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resolution & Verification Trends */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolution Progress</CardTitle>
            <CardDescription className="text-xs">Verification and resolution rates over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => format(new Date(val), 'MMM d')}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  labelFormatter={(val) => format(new Date(val), 'MMMM d, yyyy')}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="verified"
                  name="Verified"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category & Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Incident Categories</CardTitle>
            <CardDescription className="text-xs">Distribution by incident type</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Geographic Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Top Affected Countries
            </CardTitle>
            <CardDescription className="text-xs">Incident distribution by country</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCountriesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis 
                  type="category" 
                  dataKey="country" 
                  width={80}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="incidents" name="Total Incidents" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                <Bar dataKey="critical" name="Critical" fill="#dc2626" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Incident Pipeline Status</CardTitle>
          <CardDescription className="text-xs">Current status distribution across all incidents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statusData.map((status) => (
              <div 
                key={status.status} 
                className="p-4 rounded-lg border bg-card"
                style={{ borderLeftColor: status.fill, borderLeftWidth: '4px' }}
              >
                <p className="text-2xl font-bold">{status.count}</p>
                <p className="text-sm text-muted-foreground">{status.status}</p>
                <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${overview.totalIncidents > 0 ? (status.count / overview.totalIncidents) * 100 : 0}%`,
                      backgroundColor: status.fill 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Hotspots Table */}
      {hotspots.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Active Hotspots
            </CardTitle>
            <CardDescription className="text-xs">Predictive high-risk areas requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Region</th>
                    <th className="text-left py-2 px-3 font-medium">Country</th>
                    <th className="text-center py-2 px-3 font-medium">Incidents (30d)</th>
                    <th className="text-center py-2 px-3 font-medium">Risk Score</th>
                    <th className="text-center py-2 px-3 font-medium">Risk Level</th>
                    <th className="text-center py-2 px-3 font-medium">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {hotspots.slice(0, 10).map((hotspot) => (
                    <tr key={hotspot.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-3">{hotspot.region}</td>
                      <td className="py-2 px-3">{hotspot.country}</td>
                      <td className="py-2 px-3 text-center">{hotspot.incidentCount}</td>
                      <td className="py-2 px-3 text-center font-medium">{hotspot.riskScore.toFixed(1)}</td>
                      <td className="py-2 px-3 text-center">
                        <Badge className={getRiskLevelColor(hotspot.riskLevel)}>
                          {hotspot.riskLevel}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-center">
                        {hotspot.trend === 'increasing' ? (
                          <TrendingUp className="w-4 h-4 text-red-500 mx-auto" />
                        ) : hotspot.trend === 'decreasing' ? (
                          <TrendingDown className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <Minus className="w-4 h-4 text-muted-foreground mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
