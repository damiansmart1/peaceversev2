import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useVoteProposal } from '@/hooks/useProposals';
import { useUserVote } from '@/hooks/useProposalDetail';
import { cn } from '@/lib/utils';

interface ProposalVotingProps {
  proposalId: string;
  supportCount: number;
  opposeCount: number;
}

const ProposalVoting = ({ proposalId, supportCount, opposeCount }: ProposalVotingProps) => {
  const [displayAnonymous, setDisplayAnonymous] = useState(false);
  const { data: userVote } = useUserVote(proposalId);
  const voteProposal = useVoteProposal();

  const handleVote = async (value: 1 | -1) => {
    // Allow voting even without auth (anonymous)
    voteProposal.mutate({
      proposalId,
      voteValue: value,
      displayAnonymous: true, // Always anonymous if not logged in
    });
  };

  const totalVotes = supportCount + opposeCount;
  const supportPercentage = totalVotes > 0 ? (supportCount / totalVotes) * 100 : 0;
  const opposePercentage = totalVotes > 0 ? (opposeCount / totalVotes) * 100 : 0;

  return (
    <div className="space-y-4 p-6 bg-card border border-border rounded-lg">
      <h3 className="text-lg font-semibold">Cast Your Vote</h3>
      
      <div className="flex items-center gap-2">
        <Switch
          id="anonymous"
          checked={displayAnonymous}
          onCheckedChange={setDisplayAnonymous}
        />
        <Label htmlFor="anonymous" className="text-sm cursor-pointer">
          Vote anonymously
        </Label>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => handleVote(1)}
          disabled={voteProposal.isPending}
          variant={userVote?.vote_value === 1 ? 'default' : 'outline'}
          className={cn(
            'flex-1 gap-2',
            userVote?.vote_value === 1 && 'bg-green-500 hover:bg-green-600'
          )}
        >
          <ThumbsUp className="w-4 h-4" />
          Support
        </Button>
        <Button
          onClick={() => handleVote(-1)}
          disabled={voteProposal.isPending}
          variant={userVote?.vote_value === -1 ? 'default' : 'outline'}
          className={cn(
            'flex-1 gap-2',
            userVote?.vote_value === -1 && 'bg-red-500 hover:bg-red-600'
          )}
        >
          <ThumbsDown className="w-4 h-4" />
          Oppose
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-green-600 font-medium">Support: {supportCount} ({supportPercentage.toFixed(1)}%)</span>
          <span className="text-red-600 font-medium">Oppose: {opposeCount} ({opposePercentage.toFixed(1)}%)</span>
        </div>
        <div className="w-full h-4 bg-muted rounded-full overflow-hidden flex">
          <div
            className="bg-green-500 transition-all duration-300"
            style={{ width: `${supportPercentage}%` }}
          />
          <div
            className="bg-red-500 transition-all duration-300"
            style={{ width: `${opposePercentage}%` }}
          />
        </div>
      </div>

      {userVote && (
        <p className="text-sm text-muted-foreground text-center">
          You voted to {userVote.vote_value === 1 ? 'support' : 'oppose'} this proposal
          {userVote.display_anonymous && ' (anonymously)'}
        </p>
      )}
    </div>
  );
};

export default ProposalVoting;
