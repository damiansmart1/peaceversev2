import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useIncidents, useUpdateIncident, Incident } from '@/hooks/useIncidents';
import DataTable from '@/components/DataTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle2, XCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const AdminIncidentsManager = () => {
  const { data: incidents = [], isLoading } = useIncidents();
  const updateIncident = useUpdateIncident();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleUpdateStatus = async () => {
    if (!selectedIncident || !newStatus) {
      toast.error('Please select a status');
      return;
    }

    await updateIncident.mutateAsync({
      id: selectedIncident.id,
      updates: {
        status: newStatus as any,
        resolution_notes: resolutionNotes || undefined,
        resolved_at: newStatus === 'resolved' ? new Date().toISOString() : undefined,
      },
    });

    setSelectedIncident(null);
    setNewStatus('');
    setResolutionNotes('');
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'default',
      low: 'secondary',
    };
    return <Badge variant={colors[severity] as any}>{severity}</Badge>;
  };

  const columns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
    },
    {
      key: 'incident_type',
      label: 'Type',
      sortable: true,
    },
    {
      key: 'severity',
      label: 'Severity',
      sortable: true,
      render: (incident: Incident) => getSeverityBadge(incident.severity),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (incident: Incident) => (
        <Badge variant="outline">{incident.status}</Badge>
      ),
    },
    {
      key: 'location_name',
      label: 'Location',
      sortable: true,
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (incident: Incident) => new Date(incident.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (incident: Incident) => (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedIncident(incident);
                setNewStatus(incident.status);
              }}
            >
              Manage
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Incident</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">{incident.title}</h4>
                <p className="text-sm text-muted-foreground">{incident.description}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Update Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reported">Reported</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Resolution Notes</label>
                <Textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Add notes about the incident resolution..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUpdateStatus} className="flex-1">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Update Status
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Enhanced Stats
  const stats = {
    total: incidents?.length || 0,
    pending: incidents?.filter(i => i.status === 'reported').length || 0,
    verified: incidents?.filter(i => i.status === 'verified').length || 0,
    inProgress: incidents?.filter(i => i.status === 'in_progress').length || 0,
    resolved: incidents?.filter(i => i.status === 'resolved').length || 0,
    critical: incidents?.filter(i => i.severity === 'critical').length || 0,
    high: incidents?.filter(i => i.severity === 'high').length || 0,
    avgResolutionTime: incidents?.filter(i => i.status === 'resolved' && i.resolved_at).length > 0 
      ? (incidents.filter(i => i.status === 'resolved' && i.resolved_at)
          .reduce((sum, i) => sum + (new Date(i.resolved_at!).getTime() - new Date(i.created_at).getTime()), 0) / 
         incidents.filter(i => i.status === 'resolved' && i.resolved_at).length / (1000 * 60 * 60 * 24)).toFixed(1)
      : '0',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Incidents Management</h2>
        <p className="text-muted-foreground">Monitor and respond to reported incidents</p>
      </div>

      {/* Enhanced Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{stats.pending + stats.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pending} pending, {stats.inProgress} in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg resolution: {stats.avgResolutionTime} days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{stats.critical + stats.high}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.critical} critical, {stats.high} high severity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.verified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Resolution Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incidents Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Incidents</CardTitle>
          <CardDescription>Manage incident status and responses</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={incidents || []}
            columns={columns}
            searchable
            searchPlaceholder="Search incidents..."
          />
        </CardContent>
      </Card>
    </div>
  );
};