import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase-typed';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, ExternalLink } from 'lucide-react';

const ProposalEmbed = () => {
  const { token } = useParams<{ token: string }>();
  const [proposal, setProposal] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const { data } = await supabase.from('proposals').select('*').eq('embed_token' as any, token).maybeSingle();
      if (data) {
        setProposal(data);
        await supabase.from('proposal_embed_views' as any).insert({
          proposal_id: data.id,
          embed_token: token,
          referrer_domain: document.referrer,
        });
      }
    })();
  }, [token]);

  if (!proposal) return <div className="p-6 text-center text-muted-foreground">Loading proposal…</div>;

  const total = (proposal.votes_for || 0) + (proposal.votes_against || 0) + (proposal.votes_abstain || 0);
  const forPct = total ? ((proposal.votes_for || 0) / total) * 100 : 0;
  const againstPct = total ? ((proposal.votes_against || 0) / total) * 100 : 0;

  return (
    <div className="min-h-screen p-4 bg-background">
      <Card className="p-5 max-w-2xl mx-auto">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h2 className="text-xl font-bold">{proposal.title}</h2>
          <Badge>{proposal.status}</Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{proposal.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-emerald-600">For: {proposal.votes_for || 0} ({forPct.toFixed(0)}%)</span>
            <span className="text-rose-600">Against: {proposal.votes_against || 0} ({againstPct.toFixed(0)}%)</span>
          </div>
          <Progress value={forPct} className="h-2" />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{total} votes</span>
          <a
            href={`/proposals/${proposal.id}`}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-1 text-primary hover:underline"
          >
            Vote on Peaceverse <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="mt-3 pt-3 border-t text-[10px] text-center text-muted-foreground">
          Powered by Peaceverse · OGP & IAP2 compliant
        </div>
      </Card>
    </div>
  );
};

export default ProposalEmbed;
