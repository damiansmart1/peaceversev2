import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, ThumbsUp, ExternalLink, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Proposal {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  category: string;
  vote_count: number;
}

interface PendingProposalsPanelProps {
  proposals: Proposal[] | undefined;
  isLoading: boolean;
}

export const PendingProposalsPanel = ({ proposals, isLoading }: PendingProposalsPanelProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Users className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Community Proposals</CardTitle>
              <CardDescription>Top proposals requiring government response</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/proposals')}>
            View All
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : !proposals || proposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No pending proposals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {proposals.map((proposal, index) => (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/proposals/${proposal.id}`)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{proposal.category}</Badge>
                        <Badge 
                          variant={proposal.status === 'active' ? 'default' : 'secondary'}
                        >
                          {proposal.status}
                        </Badge>
                      </div>
                      <h4 className="font-medium line-clamp-1">{proposal.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {proposal.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {proposal.vote_count || 0} votes
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(proposal.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
