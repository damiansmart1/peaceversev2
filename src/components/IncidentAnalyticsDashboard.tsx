import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, CheckCircle2, TrendingUp, AlertTriangle, MapPin, Users, Shield, Flame, Droplets, Activity } from 'lucide-react';
import { useIncidentStats } from '@/hooks/useIncidentStats';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--earth))', 'hsl(var(--destructive))', '#8884d8', '#82ca9d', '#ffc658'];

const categoryIcons: Record<string, any> = {
  violence: Flame,
  environmental: Droplets,
  security: Shield,
  social: Users,
  displacement: MapPin,
};

export const IncidentAnalyticsDashboard = () => {
  const { data: stats, isLoading } = useIncidentStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-32">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Incidents',
      value: stats.totalIncidents,
      icon: AlertCircle,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Pending Review',
      value: stats.pendingReview,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Verified',
      value: stats.verified,
      icon: CheckCircle2,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'Resolved',
      value: stats.resolved,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Critical Cases',
      value: stats.criticalCases,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      title: 'Escalated',
      value: stats.escalated,
      icon: TrendingUp,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  // Prepare chart data
  const categoryData = Object.entries(stats.byCategory).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const countryData = Object.entries(stats.byCountry)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  const severityData = Object.entries(stats.bySeverity).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-1.5 md:p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-3.5 w-3.5 md:h-4 md:w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className={`text-xl md:text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Category Distribution */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm md:text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              By Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 md:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* By Country */}
        <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm md:text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" />
              Incidents by Country
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 md:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Incidents */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-sm md:text-base flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            Recent Incidents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentIncidents.slice(0, 5).map((incident) => {
              const Icon = categoryIcons[incident.category] || AlertCircle;
              return (
                <div
                  key={incident.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className={`p-2 rounded-lg ${
                    incident.severity_level === 'critical' ? 'bg-destructive/10' :
                    incident.severity_level === 'high' ? 'bg-warning/10' :
                    'bg-primary/10'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      incident.severity_level === 'critical' ? 'text-destructive' :
                      incident.severity_level === 'high' ? 'text-warning' :
                      'text-primary'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm truncate">{incident.title}</p>
                      <Badge variant={
                        incident.severity_level === 'critical' ? 'destructive' :
                        incident.severity_level === 'high' ? 'default' :
                        'secondary'
                      } className="text-xs">
                        {incident.severity_level}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{incident.location_city}, {incident.location_country}</span>
                      <span className="mx-1">•</span>
                      <span>{new Date(incident.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {incident.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
