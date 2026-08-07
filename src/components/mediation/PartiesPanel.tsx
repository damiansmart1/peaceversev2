import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, Mail, Phone, Trash2 } from 'lucide-react';
import { useMediationParties, useAddParty, useUpdateParty, useDeleteParty } from '@/hooks/useMediation';
import EmptyState from '@/components/EmptyState';

const PARTY_TYPES = ['community', 'government', 'armed_group', 'political_party', 'business', 'civil_society', 'religious_institution', 'individual', 'other'];
const ENGAGEMENT = ['invited', 'engaged', 'active', 'hesitant', 'withdrawn'];

const engagementTone: Record<string, string> = {
  active: 'pill-success', engaged: 'pill-success', invited: 'pill-primary',
  hesitant: 'pill-warning', withdrawn: 'pill-destructive',
};

interface Props { caseId: string; canEdit: boolean; }

const PartiesPanel = ({ caseId, canEdit }: Props) => {
  const { data: parties = [], isLoading } = useMediationParties(caseId);
  const addParty = useAddParty(caseId);
  const updateParty = useUpdateParty(caseId);
  const deleteParty = useDeleteParty(caseId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ party_name: '', party_type: 'community', representative_name: '', contact_email: '', contact_phone: '', position_summary: '', interests: '', red_lines: '' });

  const submit = () => {
    if (!form.party_name.trim()) return;
    addParty.mutate({
      party_name: form.party_name.trim(),
      party_type: form.party_type,
      representative_name: form.representative_name || null,
      contact_email: form.contact_email || null,
      contact_phone: form.contact_phone || null,
      position_summary: form.position_summary || null,
      interests: form.interests ? form.interests.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      red_lines: form.red_lines ? form.red_lines.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    }, {
      onSuccess: () => {
        setOpen(false);
        setForm({ party_name: '', party_type: 'community', representative_name: '', contact_email: '', contact_phone: '', position_summary: '', interests: '', red_lines: '' });
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="eyebrow">Conflict parties</p>
          <p className="text-sm text-muted-foreground">Positions, interests and red lines for every side at the table.</p>
        </div>
        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add party</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85dvh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add a party</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Party name *</Label><Input value={form.party_name} onChange={(e) => setForm({ ...form, party_name: e.target.value })} placeholder="e.g. Kerio Valley Pastoralist Council" /></div>
                <div>
                  <Label>Party type</Label>
                  <Select value={form.party_type} onValueChange={(v) => setForm({ ...form, party_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PARTY_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><Label>Representative</Label><Input value={form.representative_name} onChange={(e) => setForm({ ...form, representative_name: e.target.value })} /></div>
                  <div><Label>Email</Label><Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} /></div>
                </div>
                <div><Label>Phone</Label><Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} /></div>
                <div><Label>Stated position</Label><Textarea rows={2} value={form.position_summary} onChange={(e) => setForm({ ...form, position_summary: e.target.value })} /></div>
                <div><Label>Underlying interests (comma separated)</Label><Input value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} placeholder="water access, grazing rights" /></div>
                <div><Label>Red lines (comma separated)</Label><Input value={form.red_lines} onChange={(e) => setForm({ ...form, red_lines: e.target.value })} /></div>
              </div>
              <DialogFooter>
                <Button onClick={submit} disabled={addParty.isPending || !form.party_name.trim()}>Add party</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading parties…</p>
        : parties.length === 0 ? (
          <EmptyState icon={Users} title="No parties yet" description="Add each side of the dispute to begin structured dialogue." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {parties.map((p: any) => (
              <Card key={p.id} className="surface-quiet">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="truncate">{p.party_name}</CardTitle>
                      <p className="text-xs text-muted-foreground capitalize">{String(p.party_type).replace(/_/g, ' ')}</p>
                    </div>
                    <span className={`pill ${engagementTone[p.engagement_status] || 'pill-primary'}`}>{p.engagement_status}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {p.representative_name && <p className="font-medium">{p.representative_name}</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {p.contact_email && <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" />{p.contact_email}</span>}
                    {p.contact_phone && <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />{p.contact_phone}</span>}
                  </div>
                  {p.position_summary && <p className="text-muted-foreground leading-relaxed">{p.position_summary}</p>}
                  {p.interests?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {p.interests.map((i: string) => <Badge key={i} variant="secondary" className="text-[11px]">{i}</Badge>)}
                    </div>
                  )}
                  {p.red_lines?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {p.red_lines.map((i: string) => <Badge key={i} variant="destructive" className="text-[11px]">red line: {i}</Badge>)}
                    </div>
                  )}
                  {canEdit && (
                    <div className="flex items-center gap-2 pt-1">
                      <Select value={p.engagement_status} onValueChange={(v) => updateParty.mutate({ id: p.id, engagement_status: v })}>
                        <SelectTrigger className="h-8 text-xs w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>{ENGAGEMENT.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteParty.mutate(p.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
};

export default PartiesPanel;
