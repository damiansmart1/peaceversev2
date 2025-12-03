import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, MinusCircle, Users, Zap } from 'lucide-react';
import { useVoteProposal } from '@/hooks/useProposals';
import { useUserVote } from '@/hooks/useProposalDetail';
import { useRealtimeVotes } from '@/hooks/useRealtimeVotes';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface ProposalVotingProps {
  proposalId: string;
  supportCount: number;
  opposeCount: number;
  abstainCount: number;
}

const ProposalVoting = ({ proposalId, supportCount, opposeCount, abstainCount }: ProposalVotingProps) => {
  const [displayAnonymous, setDisplayAnonymous] = useState(false);
  const [showLiveIndicator, setShowLiveIndicator] = useState(false);
  const { data: userVote } = useUserVote(proposalId) as any;
  const voteProposal = useVoteProposal();

  // Use real-time vote counts
  const voteCounts = useRealtimeVotes(proposalId, {
    supportCount,
    opposeCount,
    abstainCount,
  });

  // Show live indicator when votes change
  useEffect(() => {
    setShowLiveIndicator(true);
    const timer = setTimeout(() => setShowLiveIndicator(false), 2000);
    return () => clearTimeout(timer);
  }, [voteCounts.supportCount, voteCounts.opposeCount, voteCounts.abstainCount]);

  const handleVote = async (value: 1 | -1 | 0) => {
    voteProposal.mutate({
      proposalId,
      voteValue: value,
      displayAnonymous: true,
    }, {
      onSuccess: () => {
        toast.success('Thank you for making your voice heard!');
      }
    });
  };

  const totalVotes = voteCounts.supportCount + voteCounts.opposeCount + voteCounts.abstainCount;
  const approvePercentage = totalVotes > 0 ? (voteCounts.supportCount / totalVotes) * 100 : 0;
  const rejectPercentage = totalVotes > 0 ? (voteCounts.opposeCount / totalVotes) * 100 : 0;
  const abstainPercentage = totalVotes > 0 ? (voteCounts.abstainCount / totalVotes) * 100 : 0;

  return (
    <div className="space-y-4 p-6 bg-card border border-border rounded-lg relative overflow-hidden">
      {/* Live indicator */}
      <AnimatePresence>
        {showLiveIndicator && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-2 right-2 flex items-center gap-1.5 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full"
          >
            <Zap className="w-3 h-3" />
            <span>Live</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Cast Your Vote</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <motion.span
            key={totalVotes}
            initial={{ scale: 1.2, color: 'hsl(var(--primary))' }}
            animate={{ scale: 1, color: 'hsl(var(--muted-foreground))' }}
            transition={{ duration: 0.3 }}
          >
            {totalVotes} votes
          </motion.span>
        </div>
      </div>
      
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
            'flex-1 gap-2 transition-all duration-200',
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
            'flex-1 gap-2 transition-all duration-200',
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
            'flex-1 gap-2 transition-all duration-200',
            userVote?.vote_value === 0 && 'bg-gray-500 hover:bg-gray-600 text-white'
          )}
        >
          <MinusCircle className="w-4 h-4" />
          Abstain
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm gap-2">
          <motion.span 
            className="text-green-600 font-medium"
            key={`approve-${voteCounts.supportCount}`}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
          >
            Approve: {voteCounts.supportCount} ({approvePercentage.toFixed(1)}%)
          </motion.span>
          <motion.span 
            className="text-red-600 font-medium"
            key={`reject-${voteCounts.opposeCount}`}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
          >
            Reject: {voteCounts.opposeCount} ({rejectPercentage.toFixed(1)}%)
          </motion.span>
          <motion.span 
            className="text-gray-600 font-medium"
            key={`abstain-${voteCounts.abstainCount}`}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
          >
            Abstain: {voteCounts.abstainCount} ({abstainPercentage.toFixed(1)}%)
          </motion.span>
        </div>
        <div className="w-full h-4 bg-muted rounded-full overflow-hidden flex">
          <motion.div
            className="bg-green-500"
            initial={false}
            animate={{ width: `${approvePercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <motion.div
            className="bg-red-500"
            initial={false}
            animate={{ width: `${rejectPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <motion.div
            className="bg-gray-400"
            initial={false}
            animate={{ width: `${abstainPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
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
