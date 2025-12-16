import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIncidents, Incident } from '@/hooks/useIncidents';
import LoadingSpinner from '@/components/LoadingSpinner';
import { IncidentDetailDialog } from '@/components/IncidentDetailDialog';
import { 
  exportProfessionalJSON, 
  exportProfessionalCSV, 
  exportProfessionalPDF, 
  exportProfessionalWord,
  ExportConfig 
} from '@/lib/professionalExportUtils';
import { 
  FileJson, 
  FileSpreadsheet, 
  FileText, 
  File,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Search,
  RefreshCw,
  BarChart3,
  ListFilter,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// Stage definitions with icons and colors
const INCIDENT_STAGES = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-amber-500', textColor: 'text-amber-500' },
  { value: 'under_review', label: 'Under Review', icon: Search, color: 'bg-blue-500', textColor: 'text-blue-500' },
  { value: 'verified', label: 'Verified', icon: CheckCircle, color: 'bg-emerald-500', textColor: 'text-emerald-500' },
  { value: 'escalated', label: 'Escalated', icon: AlertTriangle, color: 'bg-red-500', textColor: 'text-red-500' },
  { value: 'rejected', label: 'Rejected', icon: XCircle, color: 'bg-gray-500', textColor: 'text-gray-500' },
  { value: 'resolved', label: 'Resolved', icon: CheckCircle, color: 'bg-green-600', textColor: 'text-green-600' },
];

const SEVERITY_LEVELS = ['critical', 'high', 'medium', 'low'];

export const AdminIncidentTimelineTracker = () => {
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Fetch incidents using the existing hook
  const { data: incidents = [], isLoading, refetch } = useIncidents();

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      // Stage filter
      if (stageFilter !== 'all' && incident.status !== stageFilter) return false;
      
      // Severity filter
      if (severityFilter !== 'all' && incident.severity !== severityFilter) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          incident.title?.toLowerCase().includes(query) ||
          incident.description?.toLowerCase().includes(query) ||
          incident.incident_type?.toLowerCase().includes(query) ||
          incident.country_code?.toLowerCase().includes(query) ||
          incident.location_name?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      // Date range filter
      if (dateFrom && new Date(incident.created_at) < new Date(dateFrom)) return false;
      if (dateTo && new Date(incident.created_at) > new Date(dateTo + 'T23:59:59')) return false;
      
      return true;
    });
  }, [incidents, stageFilter, severityFilter, searchQuery, dateFrom, dateTo]);

  // Stage statistics
  const stageStats = useMemo(() => {
    const stats: Record<string, number> = {};
    INCIDENT_STAGES.forEach(stage => {
      stats[stage.value] = incidents.filter(i => i.status === stage.value).length;
    });
    return stats;
  }, [incidents]);

  // Severity statistics
  const severityStats = useMemo(() => {
    const stats: Record<string, number> = {};
    SEVERITY_LEVELS.forEach(level => {
      stats[level] = incidents.filter(i => i.severity === level).length;
    });
    return stats;
  }, [incidents]);

  // Export configuration builder
  const buildExportConfig = (): ExportConfig => {
    const columns = [
      { key: 'title', header: 'Title', format: 'text' as const },
      { key: 'incident_type', header: 'Category', format: 'text' as const },
      { key: 'status', header: 'Stage/Status', format: 'text' as const },
      { key: 'severity', header: 'Severity', format: 'text' as const },
      { key: 'country_code', header: 'Country', format: 'text' as const },
      { key: 'location_name', header: 'Location', format: 'text' as const },
      { key: 'created_at', header: 'Reported Date', format: 'datetime' as const },
      { key: 'verified_at', header: 'Verified Date', format: 'datetime' as const },
      { key: 'resolved_at', header: 'Resolution Date', format: 'datetime' as const },
      { key: 'resolution_notes', header: 'Resolution Notes', format: 'text' as const },
    ];

    const categoryStats: Record<string, number> = {};
    filteredIncidents.forEach(incident => {
      const cat = incident.incident_type || 'Unknown';
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });

    return {
      metadata: {
        title: 'Incident Timeline Report',
        subtitle: 'Stage-wise Incident Analysis',
        reportType: 'incident-timeline',
        generatedBy: 'Peaceverse Admin',
        organization: 'Peaceverse Early Warning System',
        dateRange: dateFrom || dateTo ? { from: dateFrom, to: dateTo } : undefined,
        filters: {
          ...(stageFilter !== 'all' && { stage: stageFilter }),
          ...(severityFilter !== 'all' && { severity: severityFilter }),
          ...(searchQuery && { search: searchQuery }),
        },
      },
      columns,
      data: filteredIncidents,
      summary: {
        totalRecords: filteredIncidents.length,
        categories: categoryStats,
        severities: severityStats,
        statuses: stageStats,
      },
      includeRawData: true,
      includeAnalytics: true,
    };
  };

  // Export handlers
  const handleExportJSON = () => {
    try {
      exportProfessionalJSON(buildExportConfig());
      toast.success('JSON report exported successfully');
    } catch (error) {
      toast.error('Failed to export JSON report');
    }
  };

  const handleExportCSV = () => {
    try {
      exportProfessionalCSV(buildExportConfig());
      toast.success('Excel/CSV report exported successfully');
    } catch (error) {
      toast.error('Failed to export Excel report');
    }
  };

  const handleExportPDF = () => {
    try {
      exportProfessionalPDF(buildExportConfig());
      toast.success('PDF report exported successfully');
    } catch (error) {
      toast.error('Failed to export PDF report');
    }
  };

  const handleExportWord = async () => {
    try {
      await exportProfessionalWord(buildExportConfig());
      toast.success('Word report exported successfully');
    } catch (error) {
      toast.error('Failed to export Word report');
    }
  };

  const getStageInfo = (status: string) => {
    return INCIDENT_STAGES.find(s => s.value === status) || INCIDENT_STAGES[0];
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-black',
      low: 'bg-green-500 text-white',
    };
    return colors[severity] || 'bg-gray-500 text-white';
  };

  const clearFilters = () => {
    setStageFilter('all');
    setSeverityFilter('all');
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Incident Timeline Tracker</h2>
          <p className="text-muted-foreground">Track, filter, and analyze incidents by stage</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stage Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {INCIDENT_STAGES.map(stage => {
          const StageIcon = stage.icon;
          const count = stageStats[stage.value] || 0;
          const percentage = incidents.length > 0 ? (count / incidents.length * 100).toFixed(1) : 0;
          
          return (
            <Card 
              key={stage.value} 
              className={`cursor-pointer transition-all hover:shadow-md ${stageFilter === stage.value ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setStageFilter(stageFilter === stage.value ? 'all' : stage.value)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${stage.color}`}>
                    <StageIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-2xl font-bold">{count}</span>
                </div>
                <p className="text-sm font-medium">{stage.label}</p>
                <p className="text-xs text-muted-foreground">{percentage}%</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search incidents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Stage Filter */}
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {INCIDENT_STAGES.map(stage => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label} ({stageStats[stage.value] || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Severity Filter */}
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                {SEVERITY_LEVELS.map(level => (
                  <SelectItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)} ({severityStats[level] || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button variant="outline" onClick={clearFilters}>
              <ListFilter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">From Date</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">To Date</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
            <span className="text-sm font-medium text-muted-foreground mr-2">
              Export ({filteredIncidents.length} records):
            </span>
            <Button variant="outline" size="sm" onClick={handleExportJSON}>
              <FileJson className="w-4 h-4 mr-2" />
              JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel/CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportWord}>
              <File className="w-4 h-4 mr-2" />
              Word
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold">{filteredIncidents.length}</span> of{' '}
          <span className="font-semibold">{incidents.length}</span> incidents
        </p>
      </div>

      {/* Incidents List */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="divide-y">
                  <AnimatePresence>
                    {filteredIncidents.map((incident, index) => {
                      const stageInfo = getStageInfo(incident.status);
                      const StageIcon = stageInfo.icon;
                      
                      return (
                        <motion.div
                          key={incident.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            {/* Stage indicator */}
                            <div className={`p-2 rounded-lg ${stageInfo.color} shrink-0`}>
                              <StageIcon className="w-5 h-5 text-white" />
                            </div>

                            {/* Main content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h4 className="font-semibold truncate">{incident.title}</h4>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {incident.description}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedIncident(incident)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>

                              {/* Meta info */}
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge variant="outline" className={stageInfo.textColor}>
                                  {stageInfo.label}
                                </Badge>
                                <Badge className={getSeverityColor(incident.severity)}>
                                  {incident.severity}
                                </Badge>
                                {incident.incident_type && (
                                  <Badge variant="secondary">{incident.incident_type}</Badge>
                                )}
                                {incident.country_code && (
                                  <span className="text-xs text-muted-foreground">
                                    📍 {incident.location_name ? `${incident.location_name}, ` : ''}{incident.country_code}
                                  </span>
                                )}
                              </div>

                              {/* Timeline info */}
                              <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Reported: {format(new Date(incident.created_at), 'MMM d, yyyy HH:mm')}
                                </span>
                                {incident.verified_at && (
                                  <span className="flex items-center gap-1 text-emerald-600">
                                    <CheckCircle className="w-3 h-3" />
                                    Verified: {format(new Date(incident.verified_at), 'MMM d, yyyy')}
                                  </span>
                                )}
                                {incident.resolved_at && (
                                  <span className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="w-3 h-3" />
                                    Resolved: {format(new Date(incident.resolved_at), 'MMM d, yyyy')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {filteredIncidents.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>No incidents match your filters</p>
                      <Button variant="link" onClick={clearFilters}>
                        Clear filters
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4 space-y-6">
          {/* Stage Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Stage Distribution
              </CardTitle>
              <CardDescription>Visual breakdown of incidents by processing stage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {INCIDENT_STAGES.map(stage => {
                const count = stageStats[stage.value] || 0;
                const percentage = incidents.length > 0 ? (count / incidents.length * 100) : 0;
                
                return (
                  <div key={stage.value} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{stage.label}</span>
                      <span className="text-muted-foreground">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Severity Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Severity Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {SEVERITY_LEVELS.map(level => {
                  const count = severityStats[level] || 0;
                  const percentage = incidents.length > 0 ? (count / incidents.length * 100) : 0;
                  
                  return (
                    <div key={level} className="text-center p-4 rounded-lg bg-muted/50">
                      <Badge className={getSeverityColor(level) + ' mb-2'}>
                        {level.toUpperCase()}
                      </Badge>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Processing Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Processing Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Pending Rate</p>
                  <p className="text-2xl font-bold text-amber-500">
                    {incidents.length > 0 ? ((stageStats.pending / incidents.length) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Resolution Rate</p>
                  <p className="text-2xl font-bold text-green-500">
                    {incidents.length > 0 ? ((stageStats.resolved / incidents.length) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Verification Rate</p>
                  <p className="text-2xl font-bold text-emerald-500">
                    {incidents.length > 0 ? ((stageStats.verified / incidents.length) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Escalation Rate</p>
                  <p className="text-2xl font-bold text-red-500">
                    {incidents.length > 0 ? ((stageStats.escalated / incidents.length) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Incident Detail Dialog */}
      {selectedIncident && (
        <IncidentDetailDialog
          incident={selectedIncident}
          open={!!selectedIncident}
          onOpenChange={(open) => !open && setSelectedIncident(null)}
        />
      )}
    </div>
  );
};
