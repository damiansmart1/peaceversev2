import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, Share2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Proposal } from '@/hooks/useProposals';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ProposalCardProps {
  proposal: Proposal;
  className?: string;
}

const ProposalCard = ({ proposal, className }: ProposalCardProps) => {
  const navigate = useNavigate();

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
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{proposal.unique_contributors}</span>
          </div>
          <div className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4 text-green-500" />
            <span>{proposal.vote_support_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <ThumbsDown className="w-4 h-4 text-red-500" />
            <span>{proposal.vote_oppose_count}</span>
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
