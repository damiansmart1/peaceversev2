import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldCheck, ShieldX, Trash2, CheckCircle2 } from 'lucide-react';
import { useMediators, useUpdateMediator, MEDIATOR_CATEGORY_LABELS, type Mediator } from '@/hooks/useMediators';

const AdminMediatorsManager = () => {
  const { data: mediators = [], isLoading } = useMediators();
  const update = useUpdateMediator();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = mediators
    .filter((m) => filter === 'all' || m.status === filter)
    .filter((m) => !search || m.full_name.toLowerCase().includes(search.toLowerCase()));

  const setStatus = (m: Mediator, status: 'approved' | 'suspended' | 'pending') =>
    update.mutate({ id: m.id, status });

  const verifyCredentials = (m: Mediator, verified: boolean) =>
    update.mutate({ id: m.id, credential_verified: verified });

  const remove = async (m: Mediator) => {
    if (!window.confirm(`Remove ${m.full_name} from the mediator network?`)) return;
    const { error } = await supabase.from('mediators').delete().eq('id', m.id);
    if (error) {
      toast.error(`Could not remove mediator: ${error.message}`);
      return;
    }
    qc.invalidateQueries({ queryKey: ['mediators'] });
    toast.success('Mediator removed');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Volunteer mediator network</h2>
          <p className="text-sm text-muted-foreground">
            Review applications, verify credentials, and approve or suspend mediators.
            Trained volunteers are never presented as professional mediators.
          </p>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Search mediators…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-44" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading mediators…</p>
        : filtered.length === 0 ? <p className="text-sm text-muted-foreground">No mediator applications in this view.</p>
        : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((m) => (
              <Card key={m.id} className="surface-quiet">
                <CardContent className="pt-4 space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{m.full_name}</p>
                      {m.organization && <p className="text-xs text-muted-foreground">{m.organization}</p>}
                    </div>
                    <Badge variant="outline" className="shrink-0 capitalize">{m.status}</Badge>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-[11px] font-normal">{MEDIATOR_CATEGORY_LABELS[m.mediator_category]}</Badge>
                    {m.credential_verified && <Badge variant="secondary" className="text-[11px] font-normal"><CheckCircle2 className="w-3 h-3 mr-1" />Credentials verified</Badge>}
                    {!m.code_of_conduct_accepted_at && <Badge variant="destructive" className="text-[11px] font-normal">Code of conduct not accepted</Badge>}
                  </div>

                  {m.credentials && <p className="text-xs text-muted-foreground line-clamp-2">{m.credentials}</p>}
                  <div className="text-xs text-muted-foreground">
                    {m.languages.join(', ') || 'No languages listed'} · {m.locations_served.join(', ') || 'No locations listed'}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {m.status !== 'approved' && (
                      <Button size="sm" onClick={() => setStatus(m, 'approved')} disabled={update.isPending}>
                        <ShieldCheck className="w-3.5 h-3.5" /> Approve
                      </Button>
                    )}
                    {m.status === 'approved' && (
                      <Button size="sm" variant="outline" onClick={() => setStatus(m, 'suspended')} disabled={update.isPending}>
                        <ShieldX className="w-3.5 h-3.5" /> Suspend
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => verifyCredentials(m, !m.credential_verified)}
                      disabled={update.isPending}
                    >
                      {m.credential_verified ? 'Unmark verified' : 'Verify credentials'}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(m)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
};

export default AdminMediatorsManager;
