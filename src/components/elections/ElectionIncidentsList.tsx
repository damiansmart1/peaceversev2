import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  AlertTriangle, 
  Search, 
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Calendar
} from 'lucide-react';
import { 
  useElectionIncidents, 
  useIncidentCategories,
  useSubmitElectionIncident,
  useUpdateIncidentStatus,
  type IncidentSeverity,
  type ElectionIncident
} from '@/hooks/useElections';
import { format } from 'date-fns';

interface ElectionIncidentsListProps {
  electionId: string;
}

const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  minor: 'bg-slate-500',
  moderate: 'bg-yellow-500',
  serious: 'bg-orange-500',
  critical: 'bg-red-500',
  emergency: 'bg-red-700',
};

const STATUS_COLORS: Record<string, string> = {
  reported: 'bg-blue-500',
  investigating: 'bg-yellow-500',
  resolved: 'bg-green-500',
  dismissed: 'bg-slate-500',
};

export default function ElectionIncidentsList({ electionId }: ElectionIncidentsListProps) {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<ElectionIncident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    category: '',
    sub_category: '',
    severity: 'moderate' as IncidentSeverity,
    country_code: '',
    region: '',
    district: '',
    location_address: '',
    incident_datetime: new Date().toISOString().slice(0, 16),
    is_anonymous: false,
    voting_disrupted: false,
    requires_immediate_action: false,
  });

  const { data: incidents, isLoading } = useElectionIncidents(electionId);
  const { data: categories } = useIncidentCategories();
  const submitIncident = useSubmitElectionIncident();
  const updateStatus = useUpdateIncidentStatus();

  const filteredIncidents = incidents?.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.incident_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleSubmitIncident = async () => {
    await submitIncident.mutateAsync({
      ...newIncident,
      election_id: electionId,
    });
    setShowReportDialog(false);
    setNewIncident({
      title: '',
      description: '',
      category: '',
      sub_category: '',
      severity: 'moderate',
      country_code: '',
      region: '',
      district: '',
      location_address: '',
      incident_datetime: new Date().toISOString().slice(0, 16),
      is_anonymous: false,
      voting_disrupted: false,
      requires_immediate_action: false,
    });
  };

  const handleStatusUpdate = async (incidentId: string, newStatus: string) => {
    await updateStatus.mutateAsync({ id: incidentId, status: newStatus });
  };

  const handleVerificationUpdate = async (incidentId: string, verificationStatus: string) => {
    await updateStatus.mutateAsync({ id: incidentId, verification_status: verificationStatus });
  };

  const stats = {
    total: incidents?.length || 0,
    critical: incidents?.filter(i => i.severity === 'critical' || i.severity === 'emergency').length || 0,
    pending: incidents?.filter(i => i.verification_status === 'pending').length || 0,
    resolved: incidents?.filter(i => i.status === 'resolved').length || 0,
  };

  const selectedCategory = categories?.find(c => c.name === newIncident.category);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total Incidents</p>
        </Card>
        <Card className="p-3">
          <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
          <p className="text-xs text-muted-foreground">Critical/Emergency</p>
        </Card>
        <Card className="p-3">
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-xs text-muted-foreground">Pending Verification</p>
        </Card>
        <Card className="p-3">
          <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
          <p className="text-xs text-muted-foreground">Resolved</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
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
              <SelectItem value="minor">Minor</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="serious">Serious</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="reported">Reported</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Report Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Report Election Incident</DialogTitle>
              <DialogDescription>
                Document an incident that occurred during the election
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Incident Title *</Label>
                <Input
                  value={newIncident.title}
                  onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                  placeholder="Brief description of the incident"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Category *</Label>
                  <Select
                    value={newIncident.category}
                    onValueChange={(value) => setNewIncident({ ...newIncident, category: value, sub_category: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedCategory && selectedCategory.sub_categories.length > 0 && (
                  <div className="grid gap-2">
                    <Label>Sub-Category</Label>
                    <Select
                      value={newIncident.sub_category}
                      onValueChange={(value) => setNewIncident({ ...newIncident, sub_category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub-category" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCategory.sub_categories.map(sub => (
                          <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label>Severity *</Label>
                <Select
                  value={newIncident.severity}
                  onValueChange={(value: IncidentSeverity) => setNewIncident({ ...newIncident, severity: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor">Minor - No impact on voting</SelectItem>
                    <SelectItem value="moderate">Moderate - Limited impact</SelectItem>
                    <SelectItem value="serious">Serious - Significant disruption</SelectItem>
                    <SelectItem value="critical">Critical - Major disruption</SelectItem>
                    <SelectItem value="emergency">Emergency - Immediate response needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Description *</Label>
                <Textarea
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  placeholder="Detailed description of what happened..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Region</Label>
                  <Input
                    value={newIncident.region}
                    onChange={(e) => setNewIncident({ ...newIncident, region: e.target.value })}
                    placeholder="e.g., Nairobi"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>District</Label>
                  <Input
                    value={newIncident.district}
                    onChange={(e) => setNewIncident({ ...newIncident, district: e.target.value })}
                    placeholder="e.g., Westlands"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Incident Date/Time *</Label>
                <Input
                  type="datetime-local"
                  value={newIncident.incident_datetime}
                  onChange={(e) => setNewIncident({ ...newIncident, incident_datetime: e.target.value })}
                />
              </div>
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Voting Disrupted</Label>
                    <p className="text-xs text-muted-foreground">Did this incident disrupt voting?</p>
                  </div>
                  <Switch
                    checked={newIncident.voting_disrupted}
                    onCheckedChange={(checked) => setNewIncident({ ...newIncident, voting_disrupted: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Requires Immediate Action</Label>
                    <p className="text-xs text-muted-foreground">Flag for urgent response</p>
                  </div>
                  <Switch
                    checked={newIncident.requires_immediate_action}
                    onCheckedChange={(checked) => setNewIncident({ ...newIncident, requires_immediate_action: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Report Anonymously</Label>
                    <p className="text-xs text-muted-foreground">Your identity will be protected</p>
                  </div>
                  <Switch
                    checked={newIncident.is_anonymous}
                    onCheckedChange={(checked) => setNewIncident({ ...newIncident, is_anonymous: checked })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReportDialog(false)}>Cancel</Button>
              <Button 
                onClick={handleSubmitIncident}
                disabled={!newIncident.title || !newIncident.category || !newIncident.description || submitIncident.isPending}
              >
                {submitIncident.isPending ? 'Submitting...' : 'Submit Report'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Incident Detail Dialog */}
      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {selectedIncident?.title}
            </DialogTitle>
            <DialogDescription>
              Reference: {selectedIncident?.incident_code}
            </DialogDescription>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge className={`${SEVERITY_COLORS[selectedIncident.severity]} text-white`}>
                  {selectedIncident.severity.toUpperCase()}
                </Badge>
                <Badge className={`${STATUS_COLORS[selectedIncident.status] || 'bg-muted'} text-white`}>
                  {selectedIncident.status}
                </Badge>
                <Badge variant="outline">
                  {selectedIncident.verification_status}
                </Badge>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm mt-1">{selectedIncident.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <p className="text-sm mt-1">{selectedIncident.category}</p>
                </div>
                <div>
                  <Label>Sub-Category</Label>
                  <p className="text-sm mt-1">{selectedIncident.sub_category || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Location</Label>
                  <p className="text-sm mt-1">{selectedIncident.region}, {selectedIncident.district}</p>
                </div>
                <div>
                  <Label>Date/Time</Label>
                  <p className="text-sm mt-1">{format(new Date(selectedIncident.incident_datetime), 'PPpp')}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <Select
                  value={selectedIncident.status}
                  onValueChange={(value) => handleStatusUpdate(selectedIncident.id, value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Update status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reported">Reported</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={selectedIncident.verification_status}
                  onValueChange={(value) => handleVerificationUpdate(selectedIncident.id, value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Verification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredIncidents?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No incidents reported</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Incident</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents?.map((incident) => (
                    <TableRow key={incident.id} className={incident.requires_immediate_action ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                      <TableCell className="font-mono text-xs">{incident.incident_code}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium line-clamp-1">{incident.title}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {incident.region}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {incident.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${SEVERITY_COLORS[incident.severity]} text-white text-xs`}>
                          {incident.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="text-xs w-fit">
                            {incident.status}
                          </Badge>
                          {incident.verification_status === 'verified' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : incident.verification_status === 'rejected' ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(incident.incident_datetime), 'MMM dd, HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedIncident(incident)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
