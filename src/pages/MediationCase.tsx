import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Users, CalendarDays, MessagesSquare, Info } from 'lucide-react';
import { useMediationCase, useUpdateMediationCase, useCaseMembers } from '@/hooks/useMediation';
import { useAuth } from '@/contexts/AuthContext';
import PartiesPanel from '@/components/mediation/PartiesPanel';
import SessionsPanel from '@/components/mediation/SessionsPanel';
import DialoguePanel from '@/components/mediation/DialoguePanel';
import LoadingSpinner from '@/components/LoadingSpinner';

const STATUSES = ['intake', 'assessment', 'party_onboarding', 'dialogue', 'negotiation', 'drafting', 'agreement_reached', 'implementation', 'monitoring', 'closed', 'suspended', 'failed'];

const MediationCase = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: mCase, isLoading } = useMediationCase(caseId);
  const { data: members = [] } = useCaseMembers(caseId);
  const updateCase = useUpdateMediationCase();

  const myMembership = members.find((m: any) => m.user_id === user?.id);
  const isFacilitator = !!myMembership && ['lead_mediator', 'co_mediator', 'rapporteur'].includes(myMembership.member_role);
  const canEdit = isFacilitator || mCase?.created_by === user?.id;
  const canPost = !!myMembership || canEdit;

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  if (!mCase) return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24 text-center space-y-4">
        <p className="text-muted-foreground">This case is unavailable or you do not have access to it.</p>
        <Button onClick={() => navigate('/mediation')}>Back to cases</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto space-y-6">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2" onClick={() => navigate('/mediation')}>
            <ArrowLeft className="w-4 h-4" /> All cases
          </Button>

          <header className="space-y-3">
            <p className="text-xs font-mono text-muted-foreground">{mCase.case_ref} · {mCase.confidentiality}</p>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{mCase.title}</h1>
            {mCase.summary && <p className="text-muted-foreground max-w-3xl leading-relaxed">{mCase.summary}</p>}
            <div className="flex flex-wrap items-center gap-3">
              {canEdit ? (
                <Select value={mCase.status} onValueChange={(v) => updateCase.mutate({ id: mCase.id, status: v as any })}>
                  <SelectTrigger className="h-9 w-[200px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                </Select>
              ) : <span className="pill pill-primary">{mCase.status.replace(/_/g, ' ')}</span>}
              <div className="flex-1 min-w-[180px] space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground"><span>Process progress</span><span>{mCase.progress_percent}%</span></div>
                <Progress value={mCase.progress_percent} className="h-1.5" />
              </div>
            </div>
          </header>

          <Tabs defaultValue="parties">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="gap-2"><Info className="w-4 h-4" /><span className="hidden sm:inline">Overview</span></TabsTrigger>
              <TabsTrigger value="parties" className="gap-2"><Users className="w-4 h-4" /><span className="hidden sm:inline">Parties</span></TabsTrigger>
              <TabsTrigger value="sessions" className="gap-2"><CalendarDays className="w-4 h-4" /><span className="hidden sm:inline">Sessions</span></TabsTrigger>
              <TabsTrigger value="dialogue" className="gap-2"><MessagesSquare className="w-4 h-4" /><span className="hidden sm:inline">Dialogue</span></TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card><CardContent className="pt-5 grid gap-4 sm:grid-cols-2 text-sm">
                <div><p className="eyebrow">Conflict type</p><p className="capitalize">{mCase.conflict_type?.replace(/_/g, ' ') || '—'}</p></div>
                <div><p className="eyebrow">Location</p><p>{mCase.location_name || '—'}</p></div>
                <div><p className="eyebrow">Convener</p><p>{mCase.organization || '—'}</p></div>
                <div><p className="eyebrow">Opened</p><p>{mCase.started_at ? new Date(mCase.started_at).toLocaleDateString() : '—'}</p></div>
                <div><p className="eyebrow">Case members</p><p>{members.length}</p></div>
                <div><p className="eyebrow">Your role</p><p className="capitalize">{myMembership?.member_role?.replace(/_/g, ' ') || 'observer'}</p></div>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="parties" className="mt-6"><PartiesPanel caseId={mCase.id} canEdit={!!canEdit} /></TabsContent>
            <TabsContent value="sessions" className="mt-6"><SessionsPanel caseId={mCase.id} canEdit={!!canEdit} /></TabsContent>
            <TabsContent value="dialogue" className="mt-6"><DialoguePanel caseId={mCase.id} canPost={!!canPost} isFacilitator={!!canEdit} /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MediationCase;
