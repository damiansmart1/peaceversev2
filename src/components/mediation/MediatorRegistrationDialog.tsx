import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Handshake } from 'lucide-react';
import {
  useRegisterMediator, useMyMediatorProfile, SPECIALIZATION_OPTIONS, MEDIATION_FORMATS,
  MEDIATOR_CATEGORY_LABELS, type MediatorCategory,
} from '@/hooks/useMediators';

const AVAILABILITY_OPTIONS = [
  'Weekdays (business hours)',
  'Weekday evenings',
  'Weekends',
  'Flexible / on call',
];

const splitList = (value: string) =>
  value.split(',').map((s) => s.trim()).filter(Boolean);

const MediatorRegistrationDialog = ({ children }: { children?: React.ReactNode }) => {
  const register = useRegisterMediator();
  const { data: existing } = useMyMediatorProfile();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    mediator_category: 'trained_volunteer' as MediatorCategory,
    organization: '',
    bio: '',
    specializations: [] as string[],
    languages: '',
    locations_served: '',
    credentials: '',
    availability: AVAILABILITY_OPTIONS[0],
    preferred_formats: [] as string[],
    max_active_cases: 2,
    code_of_conduct_accepted: false,
    safeguarding_acknowledged: false,
  });

  const toggle = (key: 'specializations' | 'preferred_formats', value: string) => {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));
  };

  const submit = () => {
    if (!form.full_name.trim()) return;
    register.mutate({
      full_name: form.full_name.trim(),
      mediator_category: form.mediator_category,
      organization: form.organization.trim() || null,
      bio: form.bio.trim() || null,
      specializations: form.specializations,
      languages: splitList(form.languages),
      locations_served: splitList(form.locations_served),
      credentials: form.credentials.trim() || null,
      availability: form.availability,
      preferred_formats: form.preferred_formats,
      max_active_cases: Number(form.max_active_cases) || 2,
      code_of_conduct_accepted: form.code_of_conduct_accepted,
      safeguarding_acknowledged: form.safeguarding_acknowledged,
    } as any, { onSuccess: () => setOpen(false) });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button className="gap-2"><Handshake className="w-4 h-4" /> {existing ? 'Update my mediator profile' : 'Become a mediator'}</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90dvh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{existing ? 'Update mediator profile' : 'Register as a volunteer mediator'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 min-h-0 pr-2">
          <div className="space-y-4 pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Full name *</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Your name" />
              </div>
              <div>
                <Label>Mediator category *</Label>
                <Select value={form.mediator_category} onValueChange={(v) => setForm({ ...form, mediator_category: v as MediatorCategory })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(MEDIATOR_CATEGORY_LABELS) as MediatorCategory[]).map((c) => (
                      <SelectItem key={c} value={c}>{MEDIATOR_CATEGORY_LABELS[c]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Only verified professionals are presented as professional mediators.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Organisation / training body</Label>
                <Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} placeholder="e.g. Accredited mediation training provider" />
              </div>
              <div>
                <Label>Availability</Label>
                <Select value={form.availability} onValueChange={(v) => setForm({ ...form, availability: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AVAILABILITY_OPTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Short biography</Label>
              <Textarea rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Experience, background and approach" />
            </div>

            <div>
              <Label>Areas of specialization</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {SPECIALIZATION_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle('specializations', s)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${form.specializations.includes(s) ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Languages spoken * (comma separated)</Label>
                <Input value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} placeholder="English, Swahili, Somali" />
              </div>
              <div>
                <Label>Communities / locations served (comma separated)</Label>
                <Input value={form.locations_served} onChange={(e) => setForm({ ...form, locations_served: e.target.value })} placeholder="Turkana, West Pokot" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Credentials & training</Label>
                <Textarea rows={2} value={form.credentials} onChange={(e) => setForm({ ...form, credentials: e.target.value })} placeholder="Certificates, years of practice, referee contacts" />
              </div>
              <div>
                <Label>Preferred mediation formats</Label>
                <div className="space-y-1.5 mt-1">
                  {MEDIATION_FORMATS.map((f) => (
                    <label key={f} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={form.preferred_formats.includes(f)} onCheckedChange={() => toggle('preferred_formats', f)} />
                      {f}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label>Maximum simultaneous cases</Label>
              <Input type="number" min={1} max={10} value={form.max_active_cases} onChange={(e) => setForm({ ...form, max_active_cases: parseInt(e.target.value) || 2 })} className="w-24" />
            </div>

            <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
              <p className="text-sm font-medium">Commitments</p>
              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <Checkbox checked={form.code_of_conduct_accepted} onCheckedChange={(v) => setForm({ ...form, code_of_conduct_accepted: !!v })} className="mt-0.5" />
                <span>I accept the <strong>Mediator Code of Conduct</strong>: confidentiality, informed consent from all parties, impartiality, clear boundaries on my role, and honest communication.</span>
              </label>
              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <Checkbox checked={form.safeguarding_acknowledged} onCheckedChange={(v) => setForm({ ...form, safeguarding_acknowledged: !!v })} className="mt-0.5" />
                <span>I acknowledge the <strong>safeguarding commitments</strong>: protecting participants from harm and retaliation, escalating cases beyond my competence, and never forcing parties into dialogue.</span>
              </label>
              {existing && (
                <Badge variant="outline">Current status: {existing.status}</Badge>
              )}
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={submit} disabled={register.isPending || !form.full_name.trim() || !form.code_of_conduct_accepted || !form.safeguarding_acknowledged || !form.languages.trim()}>
            {register.isPending ? 'Submitting…' : existing ? 'Save changes' : 'Submit application'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MediatorRegistrationDialog;
