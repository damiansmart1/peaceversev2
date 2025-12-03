import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';

interface VoteCounts {
  supportCount: number;
  opposeCount: number;
  abstainCount: number;
}

export const useRealtimeVotes = (proposalId: string, initialCounts: VoteCounts) => {
  const queryClient = useQueryClient();
  const [voteCounts, setVoteCounts] = useState<VoteCounts>(initialCounts);

  useEffect(() => {
    setVoteCounts(initialCounts);
  }, [initialCounts.supportCount, initialCounts.opposeCount, initialCounts.abstainCount]);

  useEffect(() => {
    if (!proposalId) return;

    console.log('[Realtime Votes] Setting up subscription for proposal:', proposalId);

    const channel = supabase
      .channel(`proposal-votes-${proposalId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'proposal_votes',
          filter: `proposal_id=eq.${proposalId}`,
        },
        async (payload) => {
          console.log('[Realtime Votes] Vote change detected:', payload);
          
          // Fetch updated vote counts
          const { data: votes, error } = await supabase
            .from('proposal_votes')
            .select('vote')
            .eq('proposal_id', proposalId);

          if (error) {
            console.error('[Realtime Votes] Error fetching votes:', error);
            return;
          }

          const newCounts = {
            supportCount: votes?.filter(v => v.vote === 'for').length || 0,
            opposeCount: votes?.filter(v => v.vote === 'against').length || 0,
            abstainCount: votes?.filter(v => v.vote === 'abstain').length || 0,
          };

          console.log('[Realtime Votes] Updated counts:', newCounts);
          setVoteCounts(newCounts);

          // Invalidate queries to keep everything in sync
          queryClient.invalidateQueries({ queryKey: ['proposals'] });
          queryClient.invalidateQueries({ queryKey: ['proposal', proposalId] });
        }
      )
      .subscribe((status) => {
        console.log('[Realtime Votes] Subscription status:', status);
      });

    return () => {
      console.log('[Realtime Votes] Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [proposalId, queryClient]);

  return voteCounts;
};
