import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { useVoteProposal } from '@/hooks/useProposals';
import { useUserVote } from '@/hooks/useProposalDetail';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProposalVotingProps {
  proposalId: string;
  supportCount: number;
  opposeCount: number;
  abstainCount: number;
}

const ProposalVoting = ({ proposalId, supportCount, opposeCount, abstainCount }: ProposalVotingProps) => {
  const [displayAnonymous, setDisplayAnonymous] = useState(false);
  const { data: userVote } = useUserVote(proposalId) as any;
  const voteProposal = useVoteProposal();

  const handleVote = async (value: 1 | -1 | 0) => {
    // Allow voting even without auth (anonymous)
    voteProposal.mutate({
      proposalId,
      voteValue: value,
      displayAnonymous: true, // Always anonymous if not logged in
    }, {
      onSuccess: () => {
        toast.success('Thank you for making your voice heard!');
      }
    });
  };

  const totalVotes = supportCount + opposeCount + abstainCount;
  const approvePercentage = totalVotes > 0 ? (supportCount / totalVotes) * 100 : 0;
  const rejectPercentage = totalVotes > 0 ? (opposeCount / totalVotes) * 100 : 0;
  const abstainPercentage = totalVotes > 0 ? (abstainCount / totalVotes) * 100 : 0;

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

      <div className="flex gap-3">
        <Button
          onClick={() => handleVote(1)}
          disabled={voteProposal.isPending}
          variant={userVote?.vote_value === 1 ? 'default' : 'outline'}
          className={cn(
            'flex-1 gap-2',
            userVote?.vote_value === 1 && 'bg-green-500 hover:bg-green-600 text-white'
          )}
        >
          <CheckCircle className="w-4 h-4" />
          Approve
        </Button>
        <Button
          onClick={() => handleVote(-1)}
          disabled={voteProposal.isPending}
          variant={userVote?.vote_value === -1 ? 'default' : 'outline'}
          className={cn(
            'flex-1 gap-2',
            userVote?.vote_value === -1 && 'bg-red-500 hover:bg-red-600 text-white'
          )}
        >
          <XCircle className="w-4 h-4" />
          Reject
        </Button>
        <Button
          onClick={() => handleVote(0)}
          disabled={voteProposal.isPending}
          variant={userVote?.vote_value === 0 ? 'default' : 'outline'}
          className={cn(
            'flex-1 gap-2',
            userVote?.vote_value === 0 && 'bg-gray-500 hover:bg-gray-600 text-white'
          )}
        >
          <MinusCircle className="w-4 h-4" />
          Abstain
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm gap-2">
          <span className="text-green-600 font-medium">Approve: {supportCount} ({approvePercentage.toFixed(1)}%)</span>
          <span className="text-red-600 font-medium">Reject: {opposeCount} ({rejectPercentage.toFixed(1)}%)</span>
          <span className="text-gray-600 font-medium">Abstain: {abstainCount} ({abstainPercentage.toFixed(1)}%)</span>
        </div>
        <div className="w-full h-4 bg-muted rounded-full overflow-hidden flex">
          <div
            className="bg-green-500 transition-all duration-300"
            style={{ width: `${approvePercentage}%` }}
          />
          <div
            className="bg-red-500 transition-all duration-300"
            style={{ width: `${rejectPercentage}%` }}
          />
          <div
            className="bg-gray-400 transition-all duration-300"
            style={{ width: `${abstainPercentage}%` }}
          />
        </div>
      </div>

      {userVote && (
        <p className="text-sm text-muted-foreground text-center">
          You voted to {userVote.vote_value === 1 ? 'approve' : userVote.vote_value === -1 ? 'reject' : 'abstain'} on this proposal
          {userVote.display_anonymous && ' (anonymously)'}
        </p>
      )}
    </div>
  );
};

export default ProposalVoting;
