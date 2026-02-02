import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Plus, Users, CheckCircle2, XCircle, Search, UserCheck, Shield } from 'lucide-react';
import { useElectionObservers, useCreateObserver, type ObserverRole } from '@/hooks/useElections';

interface ElectionObserversPanelProps {
  electionId: string;
}

const OBSERVER_ROLES: { value: ObserverRole; label: string; color: string }[] = [
  { value: 'domestic_observer', label: 'Domestic Observer', color: 'bg-blue-500' },
  { value: 'international_observer', label: 'International Observer', color: 'bg-purple-500' },
  { value: 'party_agent', label: 'Party Agent', color: 'bg-orange-500' },
  { value: 'media', label: 'Media', color: 'bg-cyan-500' },
  { value: 'election_official', label: 'Election Official', color: 'bg-green-500' },
  { value: 'security_personnel', label: 'Security Personnel', color: 'bg-red-500' },
];

export default function ElectionObserversPanel({ electionId }: ElectionObserversPanelProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [newObserver, setNewObserver] = useState({
    full_name: '',
    email: '',
    phone: '',
    organization: '',
    observer_role: 'domestic_observer' as ObserverRole,
    accreditation_number: '',
    id_verified: false,
    training_completed: false,
    oath_signed: false,
  });

  const { data: observers, isLoading } = useElectionObservers(electionId);
  const createObserver = useCreateObserver();

  const filteredObservers = observers?.filter(observer => {
    const matchesSearch = observer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      observer.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      observer.accreditation_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || observer.observer_role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddObserver = async () => {
    await createObserver.mutateAsync({
      ...newObserver,
      election_id: electionId,
    });
    setShowAddDialog(false);
    setNewObserver({
      full_name: '',
      email: '',
      phone: '',
      organization: '',
      observer_role: 'domestic_observer',
      accreditation_number: '',
      id_verified: false,
      training_completed: false,
      oath_signed: false,
    });
  };

  const stats = {
    total: observers?.length || 0,
    approved: observers?.filter(o => o.accreditation_status === 'approved').length || 0,
    deployed: observers?.filter(o => o.deployment_status === 'deployed').length || 0,
    pending: observers?.filter(o => o.accreditation_status === 'pending').length || 0,
  };

  const getRoleColor = (role: ObserverRole) => {
    return OBSERVER_ROLES.find(r => r.value === role)?.color || 'bg-muted';
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total Observers</p>
        </Card>
        <Card className="p-3">
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          <p className="text-xs text-muted-foreground">Accredited</p>
        </Card>
        <Card className="p-3">
          <p className="text-2xl font-bold text-blue-600">{stats.deployed}</p>
          <p className="text-xs text-muted-foreground">Deployed</p>
        </Card>
        <Card className="p-3">
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search observers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {OBSERVER_ROLES.map(role => (
                <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Register Observer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Register Observer</DialogTitle>
              <DialogDescription>
                Register a new observer for accreditation
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Full Name *</Label>
                <Input
                  value={newObserver.full_name}
                  onChange={(e) => setNewObserver({ ...newObserver, full_name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newObserver.email}
                    onChange={(e) => setNewObserver({ ...newObserver, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Input
                    value={newObserver.phone}
                    onChange={(e) => setNewObserver({ ...newObserver, phone: e.target.value })}
                    placeholder="+254..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Organization</Label>
                  <Input
                    value={newObserver.organization}
                    onChange={(e) => setNewObserver({ ...newObserver, organization: e.target.value })}
                    placeholder="Organization name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Observer Role *</Label>
                  <Select
                    value={newObserver.observer_role}
                    onValueChange={(value: ObserverRole) => setNewObserver({ ...newObserver, observer_role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OBSERVER_ROLES.map(role => (
                        <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Accreditation Number</Label>
                <Input
                  value={newObserver.accreditation_number}
                  onChange={(e) => setNewObserver({ ...newObserver, accreditation_number: e.target.value })}
                  placeholder="e.g., OBS-2027-001"
                />
              </div>
              <div className="border-t pt-4 space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Verification Checklist
                </h4>
                <div className="flex items-center justify-between">
                  <Label>ID Verified</Label>
                  <Switch
                    checked={newObserver.id_verified}
                    onCheckedChange={(checked) => setNewObserver({ ...newObserver, id_verified: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Training Completed</Label>
                  <Switch
                    checked={newObserver.training_completed}
                    onCheckedChange={(checked) => setNewObserver({ ...newObserver, training_completed: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Oath Signed</Label>
                  <Switch
                    checked={newObserver.oath_signed}
                    onCheckedChange={(checked) => setNewObserver({ ...newObserver, oath_signed: checked })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button 
                onClick={handleAddObserver}
                disabled={!newObserver.full_name || createObserver.isPending}
              >
                {createObserver.isPending ? 'Registering...' : 'Register Observer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredObservers?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No observers found</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Register First Observer
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Accreditation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredObservers?.map((observer) => (
                    <TableRow key={observer.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{observer.full_name}</p>
                          <p className="text-xs text-muted-foreground">{observer.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getRoleColor(observer.observer_role)} text-white text-xs`}>
                          {observer.observer_role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{observer.organization || '-'}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {observer.accreditation_number || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge 
                            variant="outline" 
                            className={observer.accreditation_status === 'approved' ? 'text-green-600' : 'text-amber-600'}
                          >
                            {observer.accreditation_status}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={observer.deployment_status === 'deployed' ? 'text-blue-600' : 'text-muted-foreground'}
                          >
                            {observer.deployment_status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {observer.id_verified && <UserCheck className="h-4 w-4 text-green-500" />}
                          {observer.training_completed && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
                          {observer.oath_signed && <Shield className="h-4 w-4 text-purple-500" />}
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
