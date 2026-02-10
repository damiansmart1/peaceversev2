import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Shield, 
  Users, 
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { useElectionIncidents, useUpdateIncidentStatus, type ElectionIncident } from '@/hooks/useElections';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ElectionBulkActionsProps {
  electionId: string;
}

export default function ElectionBulkActions({ electionId }: ElectionBulkActionsProps) {
  const { toast } = useToast();
  const { data: incidents, isLoading } = useElectionIncidents(electionId);
  const updateStatus = useUpdateIncidentStatus();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredIncidents = (incidents || []).filter(i => {
    if (filterSeverity !== 'all' && i.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && i.verification_status !== filterStatus) return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredIncidents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredIncidents.map(i => i.id)));
    }
  };

  const handleBulkAction = async () => {
    if (selectedIds.size === 0 || !bulkAction) return;
    setIsProcessing(true);

    let success = 0;
    let failed = 0;

    for (const id of selectedIds) {
      try {
        const updates: any = {};
        if (bulkAction === 'verify') {
          updates.verification_status = 'verified';
        } else if (bulkAction === 'reject') {
          updates.verification_status = 'rejected';
        } else if (bulkAction === 'resolve') {
          updates.status = 'resolved';
        } else if (bulkAction === 'escalate') {
          updates.status = 'escalated';
        }

        await updateStatus.mutateAsync({ id, ...updates });
        success++;
      } catch {
        failed++;
      }
    }

    toast({
      title: `Bulk action completed`,
      description: `${success} succeeded, ${failed} failed`,
      variant: failed > 0 ? 'destructive' : 'default',
    });

    setSelectedIds(new Set());
    setBulkAction('');
    setIsProcessing(false);
  };

  const severityColor = (severity: string) => {
    const colors: Record<string, string> = {
      minor: 'bg-muted text-muted-foreground',
      moderate: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
      serious: 'bg-orange-500/20 text-orange-700 dark:text-orange-300',
      critical: 'bg-red-500/20 text-red-700 dark:text-red-300',
      emergency: 'bg-red-800/20 text-red-900 dark:text-red-200',
    };
    return colors[severity] || 'bg-muted';
  };

  return (
    <div className="space-y-4">
      {/* Filters & Actions Bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Bulk Incident Management
          </CardTitle>
          <CardDescription>
            Select incidents and apply bulk actions for efficient processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Severity</span>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="serious">Serious</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Verification</span>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1" />

            {selectedIds.size > 0 && (
              <>
                <Badge variant="secondary" className="h-9 px-3">
                  {selectedIds.size} selected
                </Badge>
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Choose action..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verify">✓ Mark Verified</SelectItem>
                    <SelectItem value="reject">✗ Mark Rejected</SelectItem>
                    <SelectItem value="resolve">🔒 Mark Resolved</SelectItem>
                    <SelectItem value="escalate">⚡ Escalate</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleBulkAction}
                  disabled={!bulkAction || isProcessing}
                  size="sm"
                >
                  {isProcessing ? (
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                  )}
                  Apply
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Incidents Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedIds.size === filteredIncidents.length && filteredIncidents.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents.map(incident => (
                  <TableRow key={incident.id} className={selectedIds.has(incident.id) ? 'bg-primary/5' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(incident.id)}
                        onCheckedChange={() => toggleSelect(incident.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{incident.incident_code}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{incident.title}</TableCell>
                    <TableCell>
                      <Badge className={severityColor(incident.severity)} variant="secondary">
                        {incident.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{incident.region || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{incident.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={incident.verification_status === 'verified' ? 'default' : 'secondary'}>
                        {incident.verification_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {format(new Date(incident.incident_datetime), 'MMM dd, HH:mm')}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredIncidents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No incidents matching filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
