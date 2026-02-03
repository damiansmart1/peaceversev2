import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { format, differenceInMinutes } from 'date-fns';
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Eye,
  Shield,
  Filter,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  MessageSquare,
  Flag,
  TrendingUp,
  Users,
} from 'lucide-react';
import { 
  useElectionIncidents,
  useUpdateIncidentStatus,
  type ElectionIncident,
  type Election,
} from '@/hooks/useElections';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ElectionVerificationQueueProps {
  election: Election;
}

const SEVERITY_CONFIG = {
  minor: { color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', priority: 1 },
  moderate: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', priority: 2 },
  serious: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', priority: 3 },
  critical: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', priority: 4 },
  emergency: { color: 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300', priority: 5 },
};

const VERIFICATION_STATUS_CONFIG = {
  pending: { color: 'bg-amber-100 text-amber-700', icon: Clock },
  verified: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  unverified: { color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  disputed: { color: 'bg-purple-100 text-purple-700', icon: Flag },
};

export default function ElectionVerificationQueue({ election }: ElectionVerificationQueueProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'time' | 'severity' | 'credibility'>('severity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIncident, setSelectedIncident] = useState<ElectionIncident | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');

  const { data: incidents, isLoading, refetch } = useElectionIncidents(election.id);
  const updateStatus = useUpdateIncidentStatus();

  const filteredIncidents = useMemo(() => {
    if (!incidents) return [];

    let filtered = incidents.filter(incident => {
      const matchesSearch = 
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.incident_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || incident.verification_status === statusFilter;
      const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;

      return matchesSearch && matchesStatus && matchesSeverity;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'time') {
        comparison = new Date(b.incident_datetime).getTime() - new Date(a.incident_datetime).getTime();
      } else if (sortBy === 'severity') {
        comparison = (SEVERITY_CONFIG[b.severity as keyof typeof SEVERITY_CONFIG]?.priority || 0) -
                    (SEVERITY_CONFIG[a.severity as keyof typeof SEVERITY_CONFIG]?.priority || 0);
      } else if (sortBy === 'credibility') {
        comparison = (b.credibility_score || 0) - (a.credibility_score || 0);
      }

      return sortOrder === 'asc' ? -comparison : comparison;
    });

    return filtered;
  }, [incidents, searchTerm, statusFilter, severityFilter, sortBy, sortOrder]);

  const stats = useMemo(() => {
    if (!incidents) return { pending: 0, verified: 0, unverified: 0, disputed: 0, critical: 0 };
    
    return {
      pending: incidents.filter(i => i.verification_status === 'pending').length,
      verified: incidents.filter(i => i.verification_status === 'verified').length,
      unverified: incidents.filter(i => i.verification_status === 'unverified').length,
      disputed: incidents.filter(i => i.verification_status === 'disputed').length,
      critical: incidents.filter(i => (i.severity === 'critical' || i.severity === 'emergency') && i.verification_status === 'pending').length,
    };
  }, [incidents]);

  const handleVerify = async (status: 'verified' | 'unverified' | 'disputed') => {
    if (!selectedIncident) return;

    await updateStatus.mutateAsync({
      id: selectedIncident.id,
      verification_status: status,
      resolution_notes: verificationNotes,
    });

    setSelectedIncident(null);
    setVerificationNotes('');
    refetch();
  };

  const getTimeAgo = (datetime: string) => {
    const minutes = differenceInMinutes(new Date(), new Date(datetime));
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification Queue
          </h3>
          <p className="text-sm text-muted-foreground">
            Review and verify election incident reports
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className={`cursor-pointer transition-colors ${statusFilter === 'pending' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setStatusFilter('pending')}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={`cursor-pointer transition-colors ${statusFilter === 'verified' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setStatusFilter('verified')}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.verified}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={`cursor-pointer transition-colors ${statusFilter === 'unverified' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setStatusFilter('unverified')}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.unverified}</p>
                <p className="text-xs text-muted-foreground">Unverified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={`cursor-pointer transition-colors ${statusFilter === 'disputed' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setStatusFilter('disputed')}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.disputed}</p>
                <p className="text-xs text-muted-foreground">Disputed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                <p className="text-xs text-muted-foreground">Critical Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="serious">Serious</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="severity">Severity</SelectItem>
                <SelectItem value="time">Time</SelectItem>
                <SelectItem value="credibility">Credibility</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'desc' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Incident List */}
      <Card>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No incidents match your filters</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredIncidents.map((incident) => {
                  const severityConfig = SEVERITY_CONFIG[incident.severity as keyof typeof SEVERITY_CONFIG];
                  const verificationConfig = VERIFICATION_STATUS_CONFIG[incident.verification_status as keyof typeof VERIFICATION_STATUS_CONFIG];
                  const StatusIcon = verificationConfig?.icon || Clock;

                  return (
                    <div
                      key={incident.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        incident.severity === 'critical' || incident.severity === 'emergency'
                          ? 'border-l-4 border-l-red-500'
                          : ''
                      }`}
                      onClick={() => setSelectedIncident(incident)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge className={severityConfig?.color}>
                              {incident.severity}
                            </Badge>
                            <Badge variant="outline" className="font-mono text-xs">
                              {incident.incident_code}
                            </Badge>
                            <Badge className={verificationConfig?.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {incident.verification_status}
                            </Badge>
                            {incident.requires_immediate_action && (
                              <Badge className="bg-red-600 text-white animate-pulse">
                                URGENT
                              </Badge>
                            )}
                          </div>
                          
                          <h4 className="font-medium line-clamp-1">{incident.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {incident.description}
                          </p>
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {incident.region || election.country_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getTimeAgo(incident.incident_datetime)}
                            </span>
                            {incident.has_witnesses && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {incident.witness_count} witnesses
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right shrink-0">
                          {incident.credibility_score && (
                            <div className="mb-2">
                              <p className="text-xs text-muted-foreground">Credibility</p>
                              <div className="flex items-center gap-2">
                                <Progress value={incident.credibility_score} className="w-16 h-2" />
                                <span className="text-sm font-medium">{incident.credibility_score}%</span>
                              </div>
                            </div>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedIncident && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Verify Incident
                </DialogTitle>
                <DialogDescription>
                  Review the incident details and provide verification
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={SEVERITY_CONFIG[selectedIncident.severity as keyof typeof SEVERITY_CONFIG]?.color}>
                    {selectedIncident.severity}
                  </Badge>
                  <Badge variant="outline" className="font-mono">
                    {selectedIncident.incident_code}
                  </Badge>
                  <Badge variant="outline">{selectedIncident.category}</Badge>
                </div>

                <div>
                  <h4 className="font-semibold">{selectedIncident.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{selectedIncident.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium">{selectedIncident.region}, {selectedIncident.district}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Time</p>
                    <p className="font-medium">
                      {format(new Date(selectedIncident.incident_datetime), 'PPp')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Witnesses</p>
                    <p className="font-medium">
                      {selectedIncident.has_witnesses ? `Yes (${selectedIncident.witness_count})` : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Voting Disrupted</p>
                    <p className="font-medium">{selectedIncident.voting_disrupted ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Verification Notes</Label>
                  <Textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Add notes about your verification decision..."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleVerify('unverified')}
                  disabled={updateStatus.isPending}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Mark Unverified
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleVerify('disputed')}
                  disabled={updateStatus.isPending}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Mark Disputed
                </Button>
                <Button
                  onClick={() => handleVerify('verified')}
                  disabled={updateStatus.isPending}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Verify Incident
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}