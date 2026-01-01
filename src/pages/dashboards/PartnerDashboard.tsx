import { useState, useMemo } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { usePartnerAnalytics, usePartnerCountries } from '@/hooks/usePartnerAnalytics';
import { PartnerReportExporter } from '@/components/partner/PartnerReportExporter';
import { PartnerAnalyticsCharts } from '@/components/partner/PartnerAnalyticsCharts';
import LoadingSpinner from '@/components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays, subMonths } from 'date-fns';
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Target, 
  Heart, 
  Globe, 
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Activity,
  BarChart3,
  FileText,
  Filter,
  RefreshCw,
  Calendar,
  MapPin,
  Zap,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Search,
  Bell,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

// Date range presets
const DATE_PRESETS = [
  { value: '7d', label: 'Last 7 Days', from: () => format(subDays(new Date(), 7), 'yyyy-MM-dd') },
  { value: '30d', label: 'Last 30 Days', from: () => format(subDays(new Date(), 30), 'yyyy-MM-dd') },
  { value: '90d', label: 'Last 90 Days', from: () => format(subDays(new Date(), 90), 'yyyy-MM-dd') },
  { value: '6m', label: 'Last 6 Months', from: () => format(subMonths(new Date(), 6), 'yyyy-MM-dd') },
  { value: '1y', label: 'Last Year', from: () => format(subMonths(new Date(), 12), 'yyyy-MM-dd') },
  { value: 'all', label: 'All Time', from: () => undefined },
];

const PartnerDashboard = () => {
  const navigate = useNavigate();
  
  // Filter states
  const [datePreset, setDatePreset] = useState('30d');
  const [countryFilter, setCountryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Compute date range from preset
  const dateRange = useMemo(() => {
    const preset = DATE_PRESETS.find(p => p.value === datePreset);
    const from = preset?.from();
    return { from, to: format(new Date(), 'yyyy-MM-dd') };
  }, [datePreset]);

  // Fetch data
  const { data: countries = [] } = usePartnerCountries();
  const { data: analytics, isLoading, refetch, isRefetching } = usePartnerAnalytics(
    dateRange.from ? dateRange : undefined, 
    countryFilter !== 'all' ? countryFilter : undefined
  );

  // Filtered recent incidents
  const filteredIncidents = useMemo(() => {
    if (!analytics?.recentIncidents) return [];
    if (!searchQuery) return analytics.recentIncidents;
    
    const query = searchQuery.toLowerCase();
    return analytics.recentIncidents.filter(incident => 
      incident.title?.toLowerCase().includes(query) ||
      incident.description?.toLowerCase().includes(query) ||
      incident.category?.toLowerCase().includes(query) ||
      incident.location_country?.toLowerCase().includes(query)
    );
  }, [analytics?.recentIncidents, searchQuery]);

  const handleRefresh = () => {
    refetch();
    toast.success('Data refreshed');
  };

  const getChangeIndicator = (value: number, threshold: number = 0) => {
    if (value > threshold) return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (value < threshold) return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500/10 text-red-500 border-red-500/20',
      high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      low: 'bg-green-500/10 text-green-500 border-green-500/20',
    };
    return colors[severity] || 'bg-muted text-muted-foreground';
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      verified: 'bg-green-500/10 text-green-500 border-green-500/20',
      resolved: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      escalated: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const overview = analytics?.overview || {
    totalIncidents: 0,
    verifiedIncidents: 0,
    resolvedIncidents: 0,
    criticalIncidents: 0,
    highPriorityIncidents: 0,
    pendingVerification: 0,
    escalatedIncidents: 0,
    averageResolutionDays: null,
    verificationRate: 0,
    resolutionRate: 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    Partner Analytics Dashboard
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive incident monitoring and analysis platform
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefetching}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/dashboard/early-warning')}
              >
                <Bell className="w-4 h-4 mr-2" />
                Early Warning
              </Button>
            </div>
          </motion.div>

          {/* Filters Bar */}
          <Card className="border-primary/10">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="w-4 h-4" />
                  <span>Filters:</span>
                </div>

                {/* Date Range */}
                <Select value={datePreset} onValueChange={setDatePreset}>
                  <SelectTrigger className="w-[160px] h-9">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Date range" />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_PRESETS.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Country Filter */}
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger className="w-[180px] h-9">
                    <Globe className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countries.map((country: any) => (
                      <SelectItem key={country.code} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search incidents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>

                {/* Active Filters Badge */}
                {(countryFilter !== 'all' || datePreset !== '30d' || searchQuery) && (
                  <Badge variant="secondary" className="text-xs">
                    {[
                      countryFilter !== 'all' && countryFilter,
                      datePreset !== '30d' && DATE_PRESETS.find(p => p.value === datePreset)?.label,
                      searchQuery && `"${searchQuery}"`
                    ].filter(Boolean).join(' • ')}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Total Incidents */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <Badge variant="outline" className="text-xs">Total</Badge>
                  </div>
                  <p className="text-2xl font-bold">{overview.totalIncidents.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Incidents Reported</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Critical */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    {getChangeIndicator(overview.criticalIncidents, 10)}
                  </div>
                  <p className="text-2xl font-bold text-red-500">{overview.criticalIncidents}</p>
                  <p className="text-xs text-muted-foreground">Critical Cases</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pending */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-l-4 border-l-amber-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <Badge variant="outline" className="text-xs">{overview.verificationRate}%</Badge>
                  </div>
                  <p className="text-2xl font-bold text-amber-500">{overview.pendingVerification}</p>
                  <p className="text-xs text-muted-foreground">Pending Verification</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Verified */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {getChangeIndicator(overview.verificationRate, 50)}
                  </div>
                  <p className="text-2xl font-bold text-green-500">{overview.verifiedIncidents}</p>
                  <p className="text-xs text-muted-foreground">Verified</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Resolved */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <Badge variant="outline" className="text-xs">{overview.resolutionRate}%</Badge>
                  </div>
                  <p className="text-2xl font-bold text-blue-500">{overview.resolvedIncidents}</p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Avg Resolution */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold text-purple-500">
                    {overview.averageResolutionDays ? `${overview.averageResolutionDays}d` : 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Resolution</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full md:w-auto grid grid-cols-4 md:flex">
              <TabsTrigger value="overview" className="gap-2">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="incidents" className="gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Incidents</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              {analytics && <PartnerAnalyticsCharts data={analytics} />}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Category Analysis</CardTitle>
                    <CardDescription>Incident distribution by category with severity breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {analytics?.categoryBreakdown.slice(0, 15).map((cat) => (
                          <div key={cat.category} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{cat.category}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">{cat.count}</Badge>
                                <span className="text-xs text-muted-foreground">{cat.percentage}%</span>
                              </div>
                            </div>
                            <Progress value={cat.percentage} className="h-2" />
                            <div className="flex gap-1 flex-wrap">
                              {Object.entries(cat.severityBreakdown).map(([severity, count]) => (
                                <Badge 
                                  key={severity} 
                                  variant="outline"
                                  className={`text-[10px] ${getSeverityBadge(severity)}`}
                                >
                                  {severity}: {count}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Geographic Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Geographic Distribution</CardTitle>
                    <CardDescription>Incident hotspots by region and country</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {analytics?.geographicDistribution.slice(0, 20).map((geo, index) => (
                          <div 
                            key={`${geo.country}-${geo.region}-${index}`}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{geo.country}</p>
                                {geo.region && (
                                  <p className="text-xs text-muted-foreground">{geo.region}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{geo.incidentCount}</Badge>
                              {geo.criticalCount > 0 && (
                                <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                                  {geo.criticalCount} critical
                                </Badge>
                              )}
                              <Badge 
                                className={
                                  geo.riskLevel === 'critical' ? 'bg-red-500 text-white' :
                                  geo.riskLevel === 'high' ? 'bg-orange-500 text-white' :
                                  geo.riskLevel === 'moderate' ? 'bg-yellow-500 text-black' :
                                  'bg-green-500 text-white'
                                }
                              >
                                {geo.riskLevel}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              {analytics?.riskAssessment && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      AI-Powered Recommendations
                    </CardTitle>
                    <CardDescription>Data-driven suggestions based on current analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analytics.riskAssessment.recommendations.map((rec, index) => (
                        <div 
                          key={index}
                          className="p-4 rounded-lg bg-primary/5 border border-primary/10"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 rounded-full bg-primary/10">
                              <CheckCircle className="w-4 h-4 text-primary" />
                            </div>
                            <p className="text-sm">{rec}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Incidents Tab */}
            <TabsContent value="incidents" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Recent Incidents</CardTitle>
                      <CardDescription>
                        Showing {filteredIncidents.length} of {analytics?.recentIncidents.length || 0} incidents
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate('/incidents')}>
                      View All
                      <ArrowUpRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-3">
                      <AnimatePresence>
                        {filteredIncidents.map((incident, index) => (
                          <motion.div
                            key={incident.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => navigate(`/incidents`)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={getSeverityBadge(incident.severity_level)}>
                                    {incident.severity_level || 'unknown'}
                                  </Badge>
                                  <Badge className={getStatusBadge(incident.status)}>
                                    {incident.status}
                                  </Badge>
                                </div>
                                <h4 className="font-medium truncate">{incident.title}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                  {incident.description}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {incident.location_country || 'Unknown'}
                                    {incident.location_region && `, ${incident.location_region}`}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {format(new Date(incident.created_at), 'MMM d, yyyy')}
                                  </span>
                                  {incident.category && (
                                    <Badge variant="outline" className="text-[10px]">
                                      {incident.category}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="shrink-0">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {filteredIncidents.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No incidents found matching your criteria</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Export Reports */}
                {analytics && (
                  <PartnerReportExporter 
                    analyticsData={analytics}
                    dateRange={dateRange}
                    countryFilter={countryFilter}
                  />
                )}

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                    <CardDescription>Navigate to key platform features</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-auto py-3"
                      onClick={() => navigate('/peace-pulse')}
                    >
                      <Globe className="w-5 h-5 mr-3 text-primary" />
                      <div className="text-left">
                        <p className="font-medium">Peace Pulse Metrics</p>
                        <p className="text-xs text-muted-foreground">View continental peace indicators</p>
                      </div>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-auto py-3"
                      onClick={() => navigate('/incidents')}
                    >
                      <AlertTriangle className="w-5 h-5 mr-3 text-orange-500" />
                      <div className="text-left">
                        <p className="font-medium">Incident Reporting</p>
                        <p className="text-xs text-muted-foreground">Submit or review incident reports</p>
                      </div>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-auto py-3"
                      onClick={() => navigate('/proposals')}
                    >
                      <MessageSquare className="w-5 h-5 mr-3 text-blue-500" />
                      <div className="text-left">
                        <p className="font-medium">Community Proposals</p>
                        <p className="text-xs text-muted-foreground">View and vote on initiatives</p>
                      </div>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-auto py-3"
                      onClick={() => navigate('/community')}
                    >
                      <Users className="w-5 h-5 mr-3 text-green-500" />
                      <div className="text-left">
                        <p className="font-medium">Community Engagement</p>
                        <p className="text-xs text-muted-foreground">Connect with peacebuilders</p>
                      </div>
                    </Button>

                    <Separator />

                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-auto py-3"
                      onClick={() => navigate('/dashboard/early-warning')}
                    >
                      <Bell className="w-5 h-5 mr-3 text-red-500" />
                      <div className="text-left">
                        <p className="font-medium">Early Warning System</p>
                        <p className="text-xs text-muted-foreground">Monitor predictive hotspots</p>
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Report Standards Info */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Data Standards & Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-muted/30">
                      <h4 className="font-medium mb-1">ISO/IEC 27001</h4>
                      <p className="text-sm text-muted-foreground">Information security management standards</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <h4 className="font-medium mb-1">GDPR Compliant</h4>
                      <p className="text-sm text-muted-foreground">Data protection and privacy regulations</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <h4 className="font-medium mb-1">UN Data Standards</h4>
                      <p className="text-sm text-muted-foreground">Humanitarian data exchange format</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;
