import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowUpRight, CaseSensitive, Check, X } from 'lucide-react';
import {
  useMyAssignments, useRespondToAssignment, useUpdateAssignment,
  MEDIATOR_CATEGORY_LABELS, type MediatorAssignment, type MediatorAssignmentStatus,
} from '@/hooks/useMediators';
import MediatorRegistrationDialog from './MediatorRegistrationDialog';
import EmptyState from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';

const MyMediatorWorkspace = () => {
  const navigate = useNavigate();
  const { data: assignments = [], isLoading } = useMyAssignments();
  const respond = useRespondToAssignment();
  const update = useUpdateAssignment();
  const [followUpFor, setFollowUpFor] = useState<MediatorAssignment | null>(null);
  const [followUpNotes, setFollowUpNotes] = useState('');

  if (isLoading) return <LoadingSpinner />;

  if (assignments.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={CaseSensitive}
          title="No assignments yet"
          description="When a mediation case is matched to you, it appears here. You choose whether to accept."
        />
        <div className="text-center">
          <MediatorRegistrationDialog>
            <Button variant="outline">Update availability or profile</Button>
          </MediatorRegistrationDialog>
        </div>
      </div>
    );
  }

  const act = (a: MediatorAssignment, status: MediatorAssignmentStatus, extra?: Record<string, string>) =>
    respond.mutate({ id: a.id, status, ...extra } as any);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        You see only the information necessary for your role. Case conversations stay confidential.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {assignments.map((a) => (
          <Card key={a.id} className="surface-quiet">
            <CardContent className="pt-4 space-y-2.5 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-mono">{a.case?.case_ref}</p>
                  <p className="font-medium truncate">{a.case?.title}</p>
                </div>
                <Badge variant="outline" className="shrink-0">{a.status}</Badge>
              </div>

              {a.mediator && (
                <p className="text-xs text-muted-foreground">{MEDIATOR_CATEGORY_LABELS[a.mediator.mediator_category]}</p>
              )}
              {a.suitability_reason && <p className="text-xs text-muted-foreground">{a.suitability_reason}</p>}

              <div className="flex flex-wrap gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => navigate(`/mediation/${a.case_id}`)}>Open case</Button>
                {a.status === 'proposed' && (
                  <>
                    <Button size="sm" onClick={() => act(a, 'accepted')}><Check className="w-3.5 h-3.5" /> Accept</Button>
                    <Button size="sm" variant="ghost" onClick={() => act(a, 'declined')}><X className="w-3.5 h-3.5" /> Decline</Button>
                  </>
                )}
                {['accepted', 'active'].includes(a.status) && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => {
                      const reason = window.prompt('Describe why this case exceeds your competence or authority:');
                      if (reason) act(a, 'escalated', { escalation_reason: reason });
                    }}>
                      <ArrowUpRight className="w-3.5 h-3.5" /> Escalate
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      const notes = window.prompt('Where should this case be referred (professional or institutional service)?');
                      if (notes) act(a, 'referred', { referral_notes: notes });
                    }}>Refer</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setFollowUpFor(a); setFollowUpNotes(''); }}>
                      Record follow-up
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!followUpFor} onOpenChange={(o) => !o && setFollowUpFor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Record follow-up</DialogTitle></DialogHeader>
          <Textarea
            rows={4}
            value={followUpNotes}
            onChange={(e) => setFollowUpNotes(e.target.value)}
            placeholder="Was the process useful? Do the parties need additional support? Agreed next actions."
          />
          <DialogFooter>
            <Button
              disabled={!followUpNotes.trim() || update.isPending}
              onClick={() => {
                if (!followUpFor) return;
                update.mutate(
                  { id: followUpFor.id, follow_up_notes: followUpNotes.trim() },
                  { onSuccess: () => setFollowUpFor(null) },
                );
              }}
            >
              Save follow-up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyMediatorWorkspace;
