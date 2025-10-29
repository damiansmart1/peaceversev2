import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PollOption {
  text: string;
  votes: number;
}

export interface ProposalPoll {
  id: string;
  proposal_id: string;
  question: string;
  options: PollOption[];
  is_active: boolean;
  allow_multiple: boolean;
  created_by: string | null;
  created_at: string;
  ends_at: string | null;
}

export interface PollResponse {
  id: string;
  poll_id: string;
  user_id: string | null;
  option_index: number;
  display_anonymous: boolean;
  created_at: string;
}

export const useProposalPolls = (proposalId: string) => {
  return useQuery({
    queryKey: ['proposal-polls', proposalId],
    queryFn: async () => {
      const { data: polls, error: pollsError } = await supabase
        .from('proposal_polls')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('created_at', { ascending: false });

      if (pollsError) throw pollsError;

      // Get response counts for each poll
      const pollsWithCounts = await Promise.all(
        (polls || []).map(async (poll) => {
          const { data: responses } = await supabase
            .from('proposal_poll_responses')
            .select('option_index')
            .eq('poll_id', poll.id);

          const options = (poll.options as any[]).map((opt, idx) => ({
            text: opt.text || opt,
            votes: responses?.filter((r) => r.option_index === idx).length || 0,
          }));

          return { ...poll, options };
        })
      );

      return pollsWithCounts as ProposalPoll[];
    },
  });
};

export const useUserPollResponse = (pollId: string) => {
  return useQuery({
    queryKey: ['poll-response', pollId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('proposal_poll_responses')
        .select('*')
        .eq('poll_id', pollId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data as PollResponse | null;
    },
  });
};

export const useSubmitPollResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pollId,
      optionIndex,
      displayAnonymous,
    }: {
      pollId: string;
      optionIndex: number;
      displayAnonymous: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('proposal_poll_responses').upsert({
        poll_id: pollId,
        user_id: user?.id || null,
        option_index: optionIndex,
        display_anonymous: displayAnonymous,
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['poll-response', variables.pollId] });
      queryClient.invalidateQueries({ queryKey: ['proposal-polls'] });
      toast.success('Your response has been recorded');
    },
    onError: () => {
      toast.error('Failed to submit response');
    },
  });
};

export const useCreatePoll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      proposalId,
      question,
      options,
      allowMultiple,
      endsAt,
    }: {
      proposalId: string;
      question: string;
      options: string[];
      allowMultiple: boolean;
      endsAt?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('proposal_polls').insert({
        proposal_id: proposalId,
        question,
        options: options.map((text) => ({ text })),
        allow_multiple: allowMultiple,
        created_by: user?.id,
        ends_at: endsAt,
      } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal-polls'] });
      toast.success('Poll created successfully');
    },
    onError: () => {
      toast.error('Failed to create poll');
    },
  });
};
