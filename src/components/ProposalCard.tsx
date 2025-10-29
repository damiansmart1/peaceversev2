import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Share2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Proposal, useVoteProposal } from '@/hooks/useProposals';
import { useUserVote } from '@/hooks/useProposalDetail';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ProposalCardProps {
  proposal: Proposal;
  className?: string;
}

const ProposalCard = ({ proposal, className }: ProposalCardProps) => {
  const navigate = useNavigate();
  const { data: userVote } = useUserVote(proposal.id);
  const voteProposal = useVoteProposal();

  const handleVote = (e: React.MouseEvent, value: 1 | -1) => {
    e.stopPropagation();
    voteProposal.mutate({
      proposalId: proposal.id,
      voteValue: value,
      displayAnonymous: true,
    });
  };

  const totalVotes = proposal.vote_support_count + proposal.vote_oppose_count;
  const supportPercentage = totalVotes > 0 ? (proposal.vote_support_count / totalVotes) * 100 : 0;

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-border/50 hover:border-primary/20',
        className
      )}
      onClick={() => navigate(`/proposals/${proposal.slug}`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {proposal.title}
          </CardTitle>
          <Badge variant="secondary" className="shrink-0">
            {proposal.status}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {proposal.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
          {proposal.summary}
        </p>

        {/* Vote Progress Bar */}
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="text-green-600 font-medium">Support: {proposal.vote_support_count} ({supportPercentage.toFixed(0)}%)</span>
            <span className="text-red-600 font-medium">Oppose: {proposal.vote_oppose_count} ({(100 - supportPercentage).toFixed(0)}%)</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden flex">
            <div
              className="bg-green-500 transition-all duration-300"
              style={{ width: `${supportPercentage}%` }}
            />
            <div
              className="bg-red-500 transition-all duration-300"
              style={{ width: `${100 - supportPercentage}%` }}
            />
          </div>
        </div>

        {/* Vote Buttons */}
        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            onClick={(e) => handleVote(e, 1)}
            disabled={voteProposal.isPending}
            variant={userVote?.vote_value === 1 ? 'default' : 'outline'}
            className={cn(
              'flex-1 gap-2 text-xs',
              userVote?.vote_value === 1 && 'bg-green-500 hover:bg-green-600 text-white'
            )}
          >
            <ThumbsUp className="w-3 h-3" />
            Support
          </Button>
          <Button
            size="sm"
            onClick={(e) => handleVote(e, -1)}
            disabled={voteProposal.isPending}
            variant={userVote?.vote_value === -1 ? 'default' : 'outline'}
            className={cn(
              'flex-1 gap-2 text-xs',
              userVote?.vote_value === -1 && 'bg-red-500 hover:bg-red-600 text-white'
            )}
          >
            <ThumbsDown className="w-3 h-3" />
            Oppose
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{proposal.unique_contributors}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span>{proposal.comment_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <Share2 className="w-4 h-4" />
            <span>{proposal.share_count}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalCard;
