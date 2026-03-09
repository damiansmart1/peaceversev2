import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Search, 
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  RefreshCw,
  Download
} from 'lucide-react';
import { useAllElectionIncidents, useUpdateIncidentStatus, type IncidentSeverity } from '@/hooks/useElections';
import { format } from 'date-fns';

const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  minor: 'bg-slate-500',
  moderate: 'bg-yellow-500',
  serious: 'bg-orange-500',
  critical: 'bg-red-500',
  emergency: 'bg-red-700',
};

export default function ElectionIncidentsManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: incidents, isLoading, refetch } = useAllElectionIncidents();
  const updateStatus = useUpdateIncidentStatus();

  const filteredIncidents = incidents?.filter((incident: any) => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.incident_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleStatusUpdate = async (incidentId: string, newStatus: string) => {
    await updateStatus.mutateAsync({ id: incidentId, status: newStatus });
  };

  const handleVerificationUpdate = async (incidentId: string, verificationStatus: string) => {
    await updateStatus.mutateAsync({ id: incidentId, verification_status: verificationStatus });
  };

  const stats = {
    total: incidents?.length || 0,
    critical: incidents?.filter((i: any) => i.severity === 'critical' || i.severity === 'emergency').length || 0,
    pendingVerification: incidents?.filter((i: any) => i.verification_status === 'pending').length || 0,
    needsAction: incidents?.filter((i: any) => i.requires_immediate_action).length || 0,
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">All Incidents</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              <p className="text-xs text-muted-foreground">Critical/Emergency</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.pendingVerification}</p>
              <p className="text-xs text-muted-foreground">Pending Verification</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-2xl font-bold text-orange-600">{stats.needsAction}</p>
              <p className="text-xs text-muted-foreground">Needs Immediate Action</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Election Incidents</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                if (!filteredIncidents || filteredIncidents.length === 0) return;
                const csvRows = [
                  ['Code', 'Election', 'Title', 'Category', 'Severity', 'Location', 'Status', 'Verification', 'Date'].join(','),
                  ...filteredIncidents.map((i: any) => [
                    i.incident_code,
                    (i.elections?.name || 'Unknown').replace(/,/g, ' '),
                    i.title.replace(/,/g, ' '),
                    i.category,
                    i.severity,
                    (i.region || i.elections?.country_name || '').replace(/,/g, ' '),
                    i.status,
                    i.verification_status,
                    format(new Date(i.created_at), 'yyyy-MM-dd HH:mm'),
                  ].join(','))
                ];
                const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `election-incidents-${format(new Date(), 'yyyy-MM-dd')}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-36">
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
              <SelectTrigger className="w-36">
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

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredIncidents?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No incidents found matching your filters</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Election</TableHead>
                    <TableHead>Incident</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents?.map((incident: any) => (
                    <TableRow 
                      key={incident.id} 
                      className={incident.requires_immediate_action ? 'bg-red-50 dark:bg-red-950/20' : ''}
                    >
                      <TableCell className="font-mono text-xs">{incident.incident_code}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {incident.elections?.name || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="font-medium line-clamp-1">{incident.title}</p>
                          <p className="text-xs text-muted-foreground">{incident.category}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${SEVERITY_COLORS[incident.severity as IncidentSeverity]} text-white text-xs`}>
                          {incident.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs">
                          <MapPin className="h-3 w-3" />
                          {incident.region || incident.elections?.country_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={incident.status}
                          onValueChange={(value) => handleStatusUpdate(incident.id, value)}
                        >
                          <SelectTrigger className="h-7 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="reported">Reported</SelectItem>
                            <SelectItem value="investigating">Investigating</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="dismissed">Dismissed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={incident.verification_status}
                          onValueChange={(value) => handleVerificationUpdate(incident.id, value)}
                        >
                          <SelectTrigger className="h-7 w-24 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {incident.verification_status === 'verified' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : incident.verification_status === 'rejected' ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
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
