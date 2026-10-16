import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Landmark, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { useProposalResponses, useSubmitResponse } from '@/hooks/useWorldClassProposals';
import { useRoleCheck } from '@/hooks/useRoleCheck';
import { formatDistanceToNow } from 'date-fns';
import { useTranslationContext } from '@/components/TranslationProvider';

interface Props { proposalId: string; deadline?: string | null; currentStatus?: string; }

const statusFlow = ['received', 'reviewing', 'responded', 'action_taken', 'closed_no_action'];
const statusLabels: Record<string, string> = {
  awaiting: 'Awaiting Response',
  received: 'Received',
  reviewing: 'Under Review',
  responded: 'Responded',
  action_taken: 'Action Taken',
  closed_no_action: 'Closed — No Action',
};

const GovernmentResponsePanel = ({ proposalId, deadline, currentStatus = 'awaiting' }: Props) => {
  const { t } = useTranslationContext();
  const label = (s: string) => t('participation.'+s);
  const { data: responses = [] } = useProposalResponses(proposalId);
  const submit = useSubmitResponse();
  const { data: govCheck } = useRoleCheck('government');
  const { data: adminCheck } = useRoleCheck('admin');
  const { data: partnerCheck } = useRoleCheck('partner');
  const isGov = govCheck?.hasRole;
  const isPartner = partnerCheck?.hasRole;
  const canRespond = isGov || adminCheck?.hasRole || isPartner;

  const [status, setStatus] = useState('received');
  const [text, setText] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [org, setOrg] = useState('');

  const actualStatus = responses[0]?.status || currentStatus;
  const overdue = deadline && new Date(deadline) < new Date() && ['awaiting','received','reviewing'].includes(actualStatus);

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 flex-wrap">
          <Landmark className="w-5 h-5 text-primary" />
          {t('participation.responses')}
          <Badge variant="outline" className="text-xs">OGP Accountability</Badge>
          <Badge className={overdue ? 'bg-red-500' : currentStatus === 'action_taken' ? 'bg-emerald-500' : 'bg-amber-500'}>
            {label(actualStatus)}
          </Badge>
        </CardTitle>
        {deadline && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {t('participation.due')} {formatDistanceToNow(new Date(deadline), { addSuffix: true })}
            {overdue && <AlertTriangle className="w-3 h-3 text-red-500 ml-1" />}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status pipeline */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {statusFlow.map((s, i) => {
            const reached = statusFlow.indexOf(actualStatus) >= i;
            return (
              <div key={s} className="flex items-center gap-1 shrink-0">
                <div className={`h-2 w-12 rounded-full ${reached ? 'bg-primary' : 'bg-muted'}`} />
                <span className={`text-xs ${reached ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {label(s)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Response form (gov/admin/partner only) */}
        {canRespond && (
          <div className="space-y-3 p-4 bg-muted/30 border border-border rounded-lg">
            <p className="text-sm font-medium">{t('participation.publishResponse')}</p>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {statusFlow.map(s => <SelectItem key={s} value={s}>{label(s)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Your organization (e.g., Ministry of Justice)" value={org} onChange={e => setOrg(e.target.value)} />
            <Textarea placeholder="Official response text…" value={text} onChange={e => setText(e.target.value)} rows={3} />
            <Textarea placeholder="Concrete action plan (optional)" value={actionPlan} onChange={e => setActionPlan(e.target.value)} rows={2} />
            <Button
              onClick={() => submit.mutate({
                proposalId, status, responseText: text, actionPlan, organization: org,
                role: isGov ? 'government' : isPartner ? 'partner' : 'admin'
              }, { onSuccess: () => { setText(''); setActionPlan(''); } })}
              disabled={submit.isPending || !text.trim()}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />{t('participation.publishResponse')}
            </Button>
          </div>
        )}

        {/* Response history */}
        <div className="space-y-2">
          {responses.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              {t('participation.noResponse')}
            </p>
          )}
          {responses.map((r: any) => (
            <div key={r.id} className="p-4 bg-card border rounded-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Badge>{label(r.status)}</Badge>
                  <span className="text-sm font-medium">{r.responder_organization || 'Official'}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm whitespace-pre-line">{r.response_text}</p>
              {r.action_plan && (
                <div className="mt-2 pt-2 border-t text-sm">
                  <span className="font-semibold">Action plan: </span>{r.action_plan}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GovernmentResponsePanel;
