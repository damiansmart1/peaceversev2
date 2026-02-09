import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Shield,
  UserCheck,
  UserX,
  AlertTriangle,
  RefreshCw,
  Eye,
  Send,
} from 'lucide-react';
import { useElectionObservers, type ElectionObserver } from '@/hooks/useElections';
import { useObserverAccreditation } from '@/hooks/useElectionAuditLog';

interface ElectionObserverAccreditationProps {
  electionId: string;
}

const STATUS_CONFIG: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  pending: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  approved: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
  rejected: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  suspended: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: AlertTriangle },
};

const DEPLOYMENT_CONFIG: Record<string, string> = {
  standby: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  in_transit: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  deployed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  recalled: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export default function ElectionObserverAccreditation({ electionId }: ElectionObserverAccreditationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedObserver, setSelectedObserver] = useState<ElectionObserver | null>(null);

  const { data: observers, isLoading, refetch } = useElectionObservers(electionId);
  const accreditMutation = useObserverAccreditation();

  const filteredObservers = useMemo(() => {
    if (!observers) return [];
    return observers.filter(o => {
      const matchesSearch = o.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.organization || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.accreditation_number || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || o.accreditation_status === statusFilter;
      const matchesRole = roleFilter === 'all' || o.observer_role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [observers, searchTerm, statusFilter, roleFilter]);

  const stats = useMemo(() => {
    if (!observers) return { total: 0, pending: 0, approved: 0, rejected: 0, deployed: 0 };
    return {
      total: observers.length,
      pending: observers.filter(o => o.accreditation_status === 'pending').length,
      approved: observers.filter(o => o.accreditation_status === 'approved').length,
      rejected: observers.filter(o => o.accreditation_status === 'rejected').length,
      deployed: observers.filter(o => o.deployment_status === 'deployed').length,
    };
  }, [observers]);

  const handleAccredit = async (id: string, status: string) => {
    await accreditMutation.mutateAsync({ id, accreditation_status: status });
    setSelectedObserver(null);
    refetch();
  };

  const handleDeploy = async (id: string, status: string) => {
    await accreditMutation.mutateAsync({ id, deployment_status: status });
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Observer Accreditation
          </h3>
          <p className="text-sm text-muted-foreground">
            Approve, reject, and manage observer credentials
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </Card>
        <Card className={`p-3 cursor-pointer ${statusFilter === 'pending' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
        <Card className={`p-3 cursor-pointer ${statusFilter === 'approved' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setStatusFilter(statusFilter === 'approved' ? 'all' : 'approved')}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-xl font-bold">{stats.approved}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </div>
        </Card>
        <Card className={`p-3 cursor-pointer ${statusFilter === 'rejected' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setStatusFilter(statusFilter === 'rejected' ? 'all' : 'rejected')}>
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-xl font-bold">{stats.rejected}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-xl font-bold">{stats.deployed}</p>
              <p className="text-xs text-muted-foreground">Deployed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search observers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="domestic_observer">Domestic Observer</SelectItem>
                <SelectItem value="international_observer">International Observer</SelectItem>
                <SelectItem value="party_agent">Party Agent</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="election_official">Election Official</SelectItem>
                <SelectItem value="security_personnel">Security Personnel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ScrollArea className="h-[450px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Observer</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Accreditation</TableHead>
                    <TableHead>Deployment</TableHead>
                    <TableHead>Checks</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredObservers.map((observer) => {
                    const statusConf = STATUS_CONFIG[observer.accreditation_status] || STATUS_CONFIG.pending;
                    const StatusIcon = statusConf.icon;
                    return (
                      <TableRow key={observer.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{observer.full_name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{observer.accreditation_number}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">
                            {observer.observer_role.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{observer.organization || '—'}</TableCell>
                        <TableCell>
                          <Badge className={statusConf.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {observer.accreditation_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={DEPLOYMENT_CONFIG[observer.deployment_status] || ''}>
                            {observer.deployment_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Badge variant={observer.id_verified ? 'default' : 'secondary'} className="text-[10px]">
                              ID {observer.id_verified ? '✓' : '✗'}
                            </Badge>
                            <Badge variant={observer.training_completed ? 'default' : 'secondary'} className="text-[10px]">
                              Train {observer.training_completed ? '✓' : '✗'}
                            </Badge>
                            <Badge variant={observer.oath_signed ? 'default' : 'secondary'} className="text-[10px]">
                              Oath {observer.oath_signed ? '✓' : '✗'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {observer.accreditation_status === 'pending' && (
                              <>
                                <Button size="sm" variant="outline" className="h-7 text-green-600 hover:bg-green-50"
                                  onClick={() => handleAccredit(observer.id, 'approved')}
                                  disabled={accreditMutation.isPending}>
                                  <CheckCircle2 className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 text-red-600 hover:bg-red-50"
                                  onClick={() => handleAccredit(observer.id, 'rejected')}
                                  disabled={accreditMutation.isPending}>
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            {observer.accreditation_status === 'approved' && (
                              <Select value={observer.deployment_status} onValueChange={(v) => handleDeploy(observer.id, v)}>
                                <SelectTrigger className="h-7 w-24 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="standby">Standby</SelectItem>
                                  <SelectItem value="in_transit">In Transit</SelectItem>
                                  <SelectItem value="deployed">Deploy</SelectItem>
                                  <SelectItem value="recalled">Recall</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            <Button size="sm" variant="ghost" className="h-7" onClick={() => setSelectedObserver(observer)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedObserver} onOpenChange={() => setSelectedObserver(null)}>
        <DialogContent className="max-w-lg">
          {selectedObserver && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedObserver.full_name}</DialogTitle>
                <DialogDescription>Observer Details — {selectedObserver.accreditation_number}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-muted-foreground">Role</p><p className="capitalize">{selectedObserver.observer_role.replace(/_/g, ' ')}</p></div>
                  <div><p className="text-muted-foreground">Organization</p><p>{selectedObserver.organization || '—'}</p></div>
                  <div><p className="text-muted-foreground">Email</p><p>{selectedObserver.email || '—'}</p></div>
                  <div><p className="text-muted-foreground">Phone</p><p>{selectedObserver.phone || '—'}</p></div>
                  <div><p className="text-muted-foreground">Assigned Regions</p><p>{selectedObserver.assigned_regions?.join(', ') || '—'}</p></div>
                  <div><p className="text-muted-foreground">Assigned Stations</p><p>{selectedObserver.assigned_stations?.length || 0} stations</p></div>
                </div>
                <div className="border-t pt-3">
                  <p className="text-muted-foreground mb-2">Compliance Checks</p>
                  <div className="flex gap-2">
                    <Badge variant={selectedObserver.id_verified ? 'default' : 'destructive'}>ID Verified: {selectedObserver.id_verified ? 'Yes' : 'No'}</Badge>
                    <Badge variant={selectedObserver.training_completed ? 'default' : 'destructive'}>Training: {selectedObserver.training_completed ? 'Yes' : 'No'}</Badge>
                    <Badge variant={selectedObserver.oath_signed ? 'default' : 'destructive'}>Oath: {selectedObserver.oath_signed ? 'Yes' : 'No'}</Badge>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedObserver(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
