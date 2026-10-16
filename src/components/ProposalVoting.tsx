import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, MinusCircle, ShieldCheck } from 'lucide-react';
import { useVoteProposal } from '@/hooks/useProposals';
import { useUserVote } from '@/hooks/useProposalDetail';
import { useRealtimeVotes } from '@/hooks/useRealtimeVotes';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslationContext } from '@/components/TranslationProvider';
import { Link } from 'react-router-dom';

interface Props { proposalId: string; supportCount: number; opposeCount: number; abstainCount: number; status?: string; endsAt?: string | null }
export default function ProposalVoting({proposalId, supportCount, opposeCount, abstainCount, status = 'published', endsAt}: Props) {
  const { t } = useTranslationContext();
  const { user } = useAuth();
  const { data: userVote } = useUserVote(proposalId);
  const vote = useVoteProposal();
  const [selection, setSelection] = useState<1 | -1 | 0>();
  const counts = useRealtimeVotes(proposalId, {supportCount, opposeCount, abstainCount});
  const total=counts.supportCount+counts.opposeCount+counts.abstainCount;
  const closed=!['published','active','voting'].includes(status) || (!!endsAt && new Date(endsAt)<=new Date());
  const choices = [{value:1 as const, key:'approve', count:counts.supportCount, icon:CheckCircle, stored:'for'}, {value:-1 as const, key:'reject', count:counts.opposeCount, icon:XCircle, stored:'against'}, {value:0 as const, key:'abstain', count:counts.abstainCount, icon:MinusCircle, stored:'abstain'}];
  return <section className="space-y-4 py-5 border-y border-border">
    <div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />{t('participation.private')}</h3><span className="text-sm text-muted-foreground">{total} {t('participation.votes')}</span></div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">{choices.map(c=><Button key={c.key} variant={selection===c.value || (selection===undefined && userVote?.vote===c.stored) ? 'default' : 'outline'} className="gap-2" disabled={closed || vote.isPending || !user || user.is_anonymous} onClick={()=>setSelection(c.value)}><c.icon className="h-4 w-4" />{t('participation.'+c.key)}</Button>)}</div>
    {user && !user.is_anonymous && !closed && <Button disabled={selection===undefined || vote.isPending} onClick={()=>{if(selection===undefined)return; vote.mutate({proposalId, voteValue:selection, displayAnonymous:true}, {onSuccess:()=>setSelection(undefined)});}}>{t(vote.isPending ? 'participation.pending' : 'participation.vote')}</Button>}
    {!user && <Button asChild variant="outline"><Link to="/auth">{t('participation.signIn')}</Link></Button>}
    {closed && <p className="text-sm text-muted-foreground">{t('participation.closed')}</p>}
    {userVote && <p role="status" className="text-sm text-primary">{t('participation.submitted')}: {t('participation.'+(choices.find(c=>c.stored===userVote.vote)?.key || 'abstain'))}</p>}
    <div className="space-y-3">{choices.map(c=><div key={c.key}><div className="flex justify-between text-sm gap-2"><span>{t('participation.'+c.key)}</span><span>{c.count} ({total ? (c.count/total*100).toFixed(1) : '0'}%)</span></div><Progress value={total ? c.count/total*100 : 0} className="h-2 mt-1" /></div>)}</div>
  </section>;
}
