import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Handshake, ShieldAlert, TrendingUp, ArrowUpRight } from 'lucide-react';
import {
  useApprovedMediators, useCaseAssignments, useProposeAssignment, useRespondToAssignment,
  useUpdateMediationCaseConsent, scoreMediatorFit, MEDIATOR_CATEGORY_LABELS,
  type MediatorAssignment, type MediatorAssignmentStatus,
} from '@/hooks/useMediators';
import type { MediationCase } from '@/hooks/useMediation';

const STATUS_TONE: Record<string, string> = {
  proposed: 'pill', accepted: 'pill-primary', declined: 'pill-destructive',
  active: 'pill-success', completed: 'pill', escalated: 'pill-destructive', referred: 'pill-warning',
};

interface Props {
  mediationCase: MediationCase;
  canEdit: boolean;
  isAssignedMediator: boolean;
}

const MediatorAssignmentsPanel = ({ mediationCase, canEdit, isAssignedMediator }: Props) => {
  const { data: assignments = [], isLoading } = useCaseAssignments(mediationCase.id);
  const { data: approved = [] } = useApprovedMediators();
  const propose = useProposeAssignment();
  const respond = useRespondToAssignment();
  const updateConsent = useUpdateMediationCaseConsent();

  const [mediatorId, setMediatorId] = useState('');
  const [suitability, setSuitability] = useState('');
  const [coi, setCoi] = useState('');
  const [noConflict, setNoConflict] = useState(false);

  const needs = {
    location: mediationCase.location_name || mediationCase.region || undefined,
    conflictType: mediationCase.conflict_type || undefined,
  };

  const ranked = [...approved]
    .filter((m) => !assignments.some((a: MediatorAssignment) => a.mediator_id === m.id && !['declined', 'referred'].includes(a.status)))
    .map((m) => ({ m, score: scoreMediatorFit(m, needs) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const submitProposal = () => {
    if (!mediatorId) return;
    propose.mutate(
      {
        case_id: mediationCase.id,
        mediator_id: mediatorId,
        suitability_reason: suitability.trim() || undefined,
        conflict_of_interest_declared: noConflict ? 'None declared' : coi.trim() || undefined,
      },
      { onSuccess: () => { setMediatorId(''); setSuitability(''); setCoi(''); setNoConflict(false); } },
    );
  };

  const act = (a: MediatorAssignment, status: MediatorAssignmentStatus, extra?: { escalation_reason?: string; referral_notes?: string }) =>
    respond.mutate({ id: a.id, status, ...extra });

  return (
    <div className="space-y-5">
      {!mediationCase.party_consent_confirmed && (
        <Alert>
          <ShieldAlert className="w-4 h-4" />
          <AlertDescription className="text-sm">
            Mediation is voluntary. All participating parties must consent before a mediator engages.
            {canEdit && (
              <div className="mt-3">
                <label className="flex items-start gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={false}
                    onCheckedChange={(v) => { if (v) updateConsent.mutate({ id: mediationCase.id }); }}
                    className="mt-0.5"
                  />
                  <span>Confirm that every party has freely consented to mediation and understands the process.</span>
                </label>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <p className="eyebrow">Assigned mediators</p>
        {isLoading ? <p className="text-sm text-muted-foreground">Loading assignments…</p>
          : assignments.length === 0 ? <p className="text-sm text-muted-foreground">No mediators assigned yet.</p>
          : (
            <div className="space-y-3">
              {assignments.map((a: MediatorAssignment) => (
                <Card key={a.id} className="surface-quiet">
                  <CardContent className="pt-4 space-y-2 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium">{a.mediator?.full_name || 'Mediator'}</p>
                        {a.mediator && (
                          <p className="text-xs text-muted-foreground">{MEDIATOR_CATEGORY_LABELS[a.mediator.mediator_category]}</p>
                        )}
                      </div>
                      <span className={`pill ${STATUS_TONE[a.status] || 'pill'}`}>{a.status}</span>
                    </div>
                    {a.suitability_reason && <p className="text-muted-foreground text-xs">Why this mediator: {a.suitability_reason}</p>}
                    {a.conflict_of_interest_declared && <p className="text-xs text-muted-foreground">Conflict of interest: {a.conflict_of_interest_declared}</p>}
                    {a.escalation_reason && <p className="text-xs text-amber-600">Escalated: {a.escalation_reason}</p>}
                    {a.referral_notes && <p className="text-xs text-blue-600">Referral: {a.referral_notes}</p>}
                    {a.follow_up_notes && <p className="text-xs text-muted-foreground">Follow-up: {a.follow_up_notes}</p>}

                    {isAssignedMediator && ['proposed'].includes(a.status) && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button size="sm" onClick={() => act(a, 'accepted')}>Accept assignment</Button>
                        <Button size="sm" variant="outline" onClick={() => act(a, 'declined')}>Decline</Button>
                      </div>
                    )}
                    {isAssignedMediator && ['accepted', 'active'].includes(a.status) && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button size="sm" variant="outline" onClick={() => {
                          const reason = window.prompt('Describe why this case exceeds your competence or authority:');
                          if (reason) act(a, 'escalated', { escalation_reason: reason });
                        }}>
                          <ArrowUpRight className="w-3.5 h-3.5" /> Escalate
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
                          const notes = window.prompt('Where should this case be referred (professional or institutional service)?');
                          if (notes) act(a, 'referred', { referral_notes: notes });
                        }}>Refer to services</Button>
                        <Button size="sm" variant="ghost" onClick={() => act(a, 'completed')}>Mark complete</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
      </div>

      {canEdit && mediationCase.party_consent_confirmed && (
        <Card className="surface-quiet">
          <CardContent className="pt-4 space-y-3">
            <p className="eyebrow flex items-center gap-2"><Handshake className="w-4 h-4" /> Invite a mediator</p>
            <p className="text-xs text-muted-foreground">
              Suggestions are ranked by language, location, specialization, availability and verified credentials.
              A conflict-of-interest check is required before assignment.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Mediator</Label>
                <Select value={mediatorId} onValueChange={setMediatorId}>
                  <SelectTrigger><SelectValue placeholder="Select a suggested mediator" /></SelectTrigger>
                  <SelectContent>
                    {ranked.map(({ m, score }) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.full_name} · fit {score} · {MEDIATOR_CATEGORY_LABELS[m.mediator_category].replace(' mediator', '').replace('Verified ', '')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Why this mediator (suitability)</Label>
                <Input value={suitability} onChange={(e) => setSuitability(e.target.value)} placeholder="Language match, same region, land-dispute experience" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={noConflict} onCheckedChange={(v) => setNoConflict(!!v)} />
                I have checked for conflicts of interest — none found
              </label>
              {!noConflict && (
                <Textarea rows={2} value={coi} onChange={(e) => setCoi(e.target.value)} placeholder="Describe any relationship between the mediator and the parties" />
              )}
            </div>
            <Button onClick={submitProposal} disabled={!mediatorId || propose.isPending}>
              <TrendingUp className="w-4 h-4" /> Send invitation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MediatorAssignmentsPanel;
