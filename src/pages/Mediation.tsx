import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Handshake, Plus, ShieldCheck, MapPin } from 'lucide-react';
import { useMediationCases, useCreateMediationCase } from '@/hooks/useMediation';
import EmptyState from '@/components/EmptyState';

const STATUS_TONE: Record<string, string> = {
  intake: 'pill-primary', assessment: 'pill-primary', party_onboarding: 'pill-primary',
  dialogue: 'pill-warning', negotiation: 'pill-warning', drafting: 'pill-warning',
  agreement_reached: 'pill-success', implementation: 'pill-success', monitoring: 'pill-success',
  closed: 'pill', suspended: 'pill-destructive', failed: 'pill-destructive',
};

const Mediation = () => {
  const navigate = useNavigate();
  const { data: cases = [], isLoading } = useMediationCases();
  const createCase = useCreateMediationCase();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ title: '', summary: '', conflict_type: 'land_and_resources', confidentiality: 'restricted', location_name: '', country_code: '', organization: '' });

  const active = cases.filter((c) => !['closed', 'failed'].includes(c.status)).length;
  const agreements = cases.filter((c) => ['agreement_reached', 'implementation', 'monitoring'].includes(c.status)).length;

  const submit = () => {
    if (!form.title.trim()) return;
    createCase.mutate({ ...form, title: form.title.trim() }, {
      onSuccess: (c: any) => { setOpen(false); navigate(`/mediation/${c.id}`); },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="space-y-2">
            <p className="eyebrow">Mediation Suite</p>
            <h1 className="text-3xl font-semibold tracking-tight">Structured dialogue, documented outcomes</h1>
            <p className="text-muted-foreground max-w-2xl">
              A confidential workspace where parties, mediators and observers convene, record positions,
              track commitments and monitor implementation of agreements.
            </p>
          </header>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Cases', value: cases.length },
              { label: 'Active processes', value: active },
              { label: 'At agreement stage', value: agreements },
              { label: 'Avg progress', value: `${cases.length ? Math.round(cases.reduce((a, c) => a + (c.progress_percent || 0), 0) / cases.length) : 0}%` },
            ].map((s) => (
              <Card key={s.label} className="surface-quiet">
                <CardContent className="pt-4">
                  <p className="text-2xl font-semibold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Cases are visible only to invited members.
            </p>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Open a case</Button></DialogTrigger>
              <DialogContent className="max-w-lg max-h-[85dvh] overflow-y-auto">
                <DialogHeader><DialogTitle>Open a mediation case</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Case title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Boundary dispute — Kerio Valley" /></div>
                  <div><Label>Summary</Label><Textarea rows={3} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Conflict type</Label>
                      <Select value={form.conflict_type} onValueChange={(v) => setForm({ ...form, conflict_type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['land_and_resources', 'inter_communal', 'electoral', 'political', 'labour', 'family_and_gbv', 'business', 'other'].map((t) => (
                            <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Confidentiality</Label>
                      <Select value={form.confidentiality} onValueChange={(v) => setForm({ ...form, confidentiality: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="confidential">Confidential</SelectItem>
                          <SelectItem value="restricted">Restricted</SelectItem>
                          <SelectItem value="public">Public</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><Label>Location</Label><Input value={form.location_name} onChange={(e) => setForm({ ...form, location_name: e.target.value })} /></div>
                    <div><Label>Convening organisation</Label><Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} /></div>
                  </div>
                </div>
                <DialogFooter><Button onClick={submit} disabled={createCase.isPending || !form.title.trim()}>Open case</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? <p className="text-sm text-muted-foreground">Loading cases…</p>
            : cases.length === 0 ? <EmptyState icon={Handshake} title="No mediation cases yet" description="Open your first case to convene parties and begin structured dialogue." />
            : (
              <div className="grid gap-4 md:grid-cols-2">
                {cases.map((c) => (
                  <Card key={c.id} className="surface-quiet cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate(`/mediation/${c.id}`)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground font-mono">{c.case_ref}</p>
                          <CardTitle className="truncate">{c.title}</CardTitle>
                        </div>
                        <span className={`pill ${STATUS_TONE[c.status] || 'pill-primary'}`}>{c.status.replace(/_/g, ' ')}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {c.summary && <p className="text-muted-foreground line-clamp-2">{c.summary}</p>}
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {c.location_name && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{c.location_name}</span>}
                        {c.conflict_type && <span className="capitalize">{c.conflict_type.replace(/_/g, ' ')}</span>}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground"><span>Process progress</span><span>{c.progress_percent}%</span></div>
                        <Progress value={c.progress_percent} className="h-1.5" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Mediation;
