import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useProposalDetail } from '@/hooks/useProposalDetail';
import ProposalVoting from '@/components/ProposalVoting';
import ProposalComments from '@/components/ProposalComments';
import ProposalShareButtons from '@/components/ProposalShareButtons';
import ProposalPolls from '@/components/ProposalPolls';
import ProposalReportDownload from '@/components/ProposalReportDownload';
import DeliberationHub from '@/components/proposals/DeliberationHub';
import GovernmentResponsePanel from '@/components/proposals/GovernmentResponsePanel';
import AdvancedVotingPanel from '@/components/proposals/AdvancedVotingPanel';
import CitizenAssemblyPanel from '@/components/proposals/CitizenAssemblyPanel';
import SponsorshipBanner from '@/components/proposals/SponsorshipBanner';
import EmbedShareTools from '@/components/proposals/EmbedShareTools';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Globe2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

const ProposalDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: proposal, isLoading, error } = useProposalDetail(slug || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Proposal not found</h1>
            <Button onClick={() => navigate('/proposals')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Proposals
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalVotes = proposal.votes_for + proposal.votes_against + proposal.votes_abstain;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <Button variant="ghost" onClick={() => navigate('/proposals')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Proposals
          </Button>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-4xl font-bold text-foreground">{proposal.title}</h1>
              <Badge variant="secondary">{proposal.status}</Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                {proposal.category}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{totalVotes} total votes</span>
              </div>
              {(proposal as any).iap2_level && (
                <Badge variant="outline" className="gap-1">
                  <Globe2 className="w-3 h-3" />IAP2: {(proposal as any).iap2_level}
                </Badge>
              )}
              <span>
                Created {formatDistanceToNow(new Date(proposal.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>

          <SponsorshipBanner proposalId={proposal.id} />

          <div className="p-6 bg-card border border-border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-foreground leading-relaxed">{proposal.description}</p>
          </div>

          <ProposalVoting
            proposalId={proposal.id}
            supportCount={proposal.votes_for}
            opposeCount={proposal.votes_against}
            abstainCount={proposal.votes_abstain || 0}
          />

          {(proposal as any).voting_method && (proposal as any).voting_method !== 'simple' && (
            <AdvancedVotingPanel
              proposalId={proposal.id}
              method={(proposal as any).voting_method}
              options={(proposal as any).voting_options || []}
              quadraticCredits={(proposal as any).quadratic_credits}
            />
          )}

          <GovernmentResponsePanel
            proposalId={proposal.id}
            deadline={(proposal as any).response_required_by}
            currentStatus={(proposal as any).response_status}
          />

          <DeliberationHub proposalId={proposal.id} />

          <CitizenAssemblyPanel proposalId={proposal.id} />

          <ProposalPolls proposalId={proposal.id} />

          <EmbedShareTools
            proposalId={proposal.id}
            embedToken={(proposal as any).embed_token}
            title={proposal.title}
          />

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Download Reports</h3>
            <ProposalReportDownload
              proposal={proposal}
              voteStats={{
                supportCount: proposal.votes_for || 0,
                opposeCount: proposal.votes_against || 0,
              }}
            />
          </div>

          <ProposalShareButtons
            proposalId={proposal.id}
            title={proposal.title}
            summary={proposal.description}
            slug={proposal.id}
          />

          <ProposalComments proposalId={proposal.id} />
        </div>
      </div>
    </div>
  );
};

export default ProposalDetail;