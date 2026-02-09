import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
  Search,
  Shield,
  Clock,
  FileText,
  Users,
  MapPin,
  Vote,
  AlertTriangle,
  CheckCircle2,
  Hash,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { useElectionAuditLog, type AuditLogEntry } from '@/hooks/useElectionAuditLog';

interface ElectionAuditLogProps {
  electionId?: string;
}

const ACTION_ICONS: Record<string, typeof Shield> = {
  INSERT: CheckCircle2,
  UPDATE: FileText,
  DELETE: AlertTriangle,
};

const ENTITY_COLORS: Record<string, string> = {
  elections: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  election_incidents: 'bg-orange-500/20 text-orange-700 dark:text-orange-300',
  election_observers: 'bg-green-500/20 text-green-700 dark:text-green-300',
  polling_stations: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
  election_results: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
  result_signatures: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300',
};

export default function ElectionAuditLog({ electionId }: ElectionAuditLogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const { data: auditLogs, isLoading, refetch } = useElectionAuditLog(electionId);

  const filteredLogs = useMemo(() => {
    if (!auditLogs) return [];
    return auditLogs.filter(log => {
      const matchesSearch = searchTerm === '' || 
        log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(log.action_details).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEntity = entityFilter === 'all' || log.entity_type === entityFilter;
      const matchesAction = actionFilter === 'all' || log.action_type === actionFilter;
      return matchesSearch && matchesEntity && matchesAction;
    });
  }, [auditLogs, searchTerm, entityFilter, actionFilter]);

  const entityTypes = [...new Set(auditLogs?.map(l => l.entity_type) || [])];
  const actionTypes = [...new Set(auditLogs?.map(l => l.action_type) || [])];

  const getChangesSummary = (details: Record<string, any>): string => {
    if (details.changes) {
      const keys = Object.keys(details.changes);
      if (keys.length <= 3) return keys.join(', ');
      return `${keys.slice(0, 3).join(', ')} +${keys.length - 3} more`;
    }
    if (details.new_data) return 'New record created';
    return 'Action recorded';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Immutable Audit Trail
          </h3>
          <p className="text-sm text-muted-foreground">
            Cryptographically chained log of all election actions — {auditLogs?.length || 0} entries
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search audit log..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {entityTypes.map(e => (
                  <SelectItem key={e} value={e}>{e.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actionTypes.map(a => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Log entries */}
      <Card>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audit log entries found</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {filteredLogs.map((log, idx) => {
                  const ActionIcon = ACTION_ICONS[log.action_type] || FileText;
                  const entityColor = ENTITY_COLORS[log.entity_type] || 'bg-muted text-muted-foreground';

                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={`p-1.5 rounded-md mt-0.5 ${
                        log.action_type === 'INSERT' ? 'bg-green-100 dark:bg-green-900/30' :
                        log.action_type === 'DELETE' ? 'bg-red-100 dark:bg-red-900/30' :
                        'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        <ActionIcon className={`h-4 w-4 ${
                          log.action_type === 'INSERT' ? 'text-green-600' :
                          log.action_type === 'DELETE' ? 'text-red-600' :
                          'text-blue-600'
                        }`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={entityColor} variant="secondary">
                            {log.entity_type.replace(/_/g, ' ')}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {log.action_type}
                          </Badge>
                          {log.log_hash && (
                            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              {log.log_hash.slice(0, 12)}...
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {getChangesSummary(log.action_details as Record<string, any>)}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {log.performed_at ? format(new Date(log.performed_at), 'MMM dd, HH:mm:ss') : 'N/A'}
                          </span>
                          {log.entity_id && (
                            <span className="font-mono">{log.entity_id.slice(0, 8)}</span>
                          )}
                        </div>
                      </div>

                      {/* Chain indicator */}
                      {idx < filteredLogs.length - 1 && (
                        <div className="absolute left-[26px] bottom-0 w-px h-2 bg-border" />
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
