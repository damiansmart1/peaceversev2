import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Plus, MapPin, Clock } from 'lucide-react';
import { useMediationSessions, useAddSession, useUpdateSession } from '@/hooks/useMediation';
import EmptyState from '@/components/EmptyState';

const STATUSES = ['scheduled', 'in_progress', 'completed', 'cancelled', 'postponed'];
const MODALITIES = ['in_person', 'virtual', 'hybrid', 'shuttle'];

const tone: Record<string, string> = {
  scheduled: 'pill-primary', in_progress: 'pill-warning', completed: 'pill-success',
  cancelled: 'pill-destructive', postponed: 'pill-warning',
};

interface Props { caseId: string; canEdit: boolean; }

const SessionsPanel = ({ caseId, canEdit }: Props) => {
  const { data: sessions = [], isLoading } = useMediationSessions(caseId);
  const addSession = useAddSession(caseId);
  const updateSession = useUpdateSession(caseId);
  const [open, setOpen] = useState(false);
  const [minutesFor, setMinutesFor] = useState<string | null>(null);
  const [minutesDraft, setMinutesDraft] = useState({ minutes: '', outcomes: '', next_steps: '', climate_rating: '3' });
  const [form, setForm] = useState<any>({ title: '', agenda: '', modality: 'in_person', location_name: '', scheduled_at: '', duration_minutes: '120' });

  const submit = () => {
    if (!form.title.trim()) return;
    addSession.mutate({
      title: form.title.trim(),
      agenda: form.agenda || null,
      modality: form.modality,
      location_name: form.location_name || null,
      scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
      session_number: sessions.length + 1,
    }, { onSuccess: () => { setOpen(false); setForm({ title: '', agenda: '', modality: 'in_person', location_name: '', scheduled_at: '', duration_minutes: '120' }); } });
  };

  const saveMinutes = (id: string) => {
    updateSession.mutate({
      id, minutes: minutesDraft.minutes, outcomes: minutesDraft.outcomes,
      next_steps: minutesDraft.next_steps, climate_rating: Number(minutesDraft.climate_rating),
      status: 'completed',
    }, { onSuccess: () => setMinutesFor(null) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="eyebrow">Dialogue sessions</p>
          <p className="text-sm text-muted-foreground">Schedule sittings, capture minutes and record agreed next steps.</p>
        </div>
        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Schedule session</Button></DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85dvh] overflow-y-auto">
              <DialogHeader><DialogTitle>Schedule a session</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Joint session 3 — grazing corridors" /></div>
                <div><Label>Agenda</Label><Textarea rows={3} value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Modality</Label>
                    <Select value={form.modality} onValueChange={(v) => setForm({ ...form, modality: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{MODALITIES.map((m) => <SelectItem key={m} value={m}>{m.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Location</Label><Input value={form.location_name} onChange={(e) => setForm({ ...form, location_name: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><Label>Date & time</Label><Input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} /></div>
                  <div><Label>Duration (min)</Label><Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} /></div>
                </div>
              </div>
              <DialogFooter><Button onClick={submit} disabled={addSession.isPending || !form.title.trim()}>Schedule</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading sessions…</p>
        : sessions.length === 0 ? <EmptyState icon={CalendarDays} title="No sessions scheduled" description="Sessions structure the process and create an auditable record." />
        : (
          <div className="space-y-3">
            {sessions.map((s: any) => (
              <Card key={s.id} className="surface-quiet">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <CardTitle className="truncate">#{s.session_number} · {s.title}</CardTitle>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                        {s.scheduled_at && <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(s.scheduled_at).toLocaleString()}</span>}
                        {s.location_name && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{s.location_name}</span>}
                        <span className="capitalize">{String(s.modality).replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                    <span className={`pill ${tone[s.status] || 'pill-primary'}`}>{String(s.status).replace(/_/g, ' ')}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {s.agenda && <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{s.agenda}</p>}
                  {s.minutes && (
                    <div className="rounded-md border border-border/60 p-3 space-y-2">
                      <p className="eyebrow">Minutes</p>
                      <p className="whitespace-pre-wrap text-muted-foreground">{s.minutes}</p>
                      {s.outcomes && <p><span className="font-medium">Outcomes: </span>{s.outcomes}</p>}
                      {s.next_steps && <p><span className="font-medium">Next steps: </span>{s.next_steps}</p>}
                      {s.climate_rating && <p className="text-xs text-muted-foreground">Room climate: {s.climate_rating}/5</p>}
                    </div>
                  )}
                  {canEdit && (
                    minutesFor === s.id ? (
                      <div className="space-y-2 rounded-md border border-border/60 p-3">
                        <Textarea rows={4} placeholder="Minutes of the session…" value={minutesDraft.minutes} onChange={(e) => setMinutesDraft({ ...minutesDraft, minutes: e.target.value })} />
                        <Input placeholder="Agreed outcomes" value={minutesDraft.outcomes} onChange={(e) => setMinutesDraft({ ...minutesDraft, outcomes: e.target.value })} />
                        <Input placeholder="Next steps" value={minutesDraft.next_steps} onChange={(e) => setMinutesDraft({ ...minutesDraft, next_steps: e.target.value })} />
                        <div className="flex items-center gap-2">
                          <Label className="text-xs">Room climate (1-5)</Label>
                          <Input type="number" min={1} max={5} className="w-20 h-8" value={minutesDraft.climate_rating} onChange={(e) => setMinutesDraft({ ...minutesDraft, climate_rating: e.target.value })} />
                          <Button size="sm" onClick={() => saveMinutes(s.id)}>Save & complete</Button>
                          <Button size="sm" variant="ghost" onClick={() => setMinutesFor(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setMinutesFor(s.id); setMinutesDraft({ minutes: s.minutes || '', outcomes: s.outcomes || '', next_steps: s.next_steps || '', climate_rating: String(s.climate_rating || 3) }); }}>
                          {s.minutes ? 'Edit minutes' : 'Record minutes'}
                        </Button>
                        <Select value={s.status} onValueChange={(v) => updateSession.mutate({ id: s.id, status: v })}>
                          <SelectTrigger className="h-9 w-[150px] text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{STATUSES.map((st) => <SelectItem key={st} value={st}>{st.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
};

export default SessionsPanel;
