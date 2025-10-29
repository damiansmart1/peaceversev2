import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useProposalDetail } from '@/hooks/useProposalDetail';
import ProposalVoting from '@/components/ProposalVoting';
import ProposalComments from '@/components/ProposalComments';
import ProposalShareButtons from '@/components/ProposalShareButtons';
import ProposalPolls from '@/components/ProposalPolls';
import ProposalReportDownload from '@/components/ProposalReportDownload';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Eye, Heart } from 'lucide-react';
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
              {proposal.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{proposal.unique_contributors} contributors</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{proposal.view_count} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{proposal.like_count} likes</span>
              </div>
              <span>
                Created {formatDistanceToNow(new Date(proposal.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>

          <div className="p-6 bg-card border border-border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <p className="text-foreground leading-relaxed">{proposal.summary}</p>
          </div>

          <div className="p-6 bg-card border border-border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Full Proposal</h2>
            <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
              {proposal.body}
            </div>
          </div>

          <ProposalVoting
            proposalId={proposal.id}
            supportCount={proposal.vote_support_count}
            opposeCount={proposal.vote_oppose_count}
          />

          <ProposalPolls proposalId={proposal.id} />

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Download Reports</h3>
            <ProposalReportDownload
              proposal={proposal}
              voteStats={{
                supportCount: proposal.vote_support_count || 0,
                opposeCount: proposal.vote_oppose_count || 0,
              }}
            />
          </div>

          <ProposalShareButtons
            proposalId={proposal.id}
            title={proposal.title}
            summary={proposal.summary}
            slug={proposal.slug}
          />

          <ProposalComments proposalId={proposal.id} />
        </div>
      </div>
    </div>
  );
};

export default ProposalDetail;
