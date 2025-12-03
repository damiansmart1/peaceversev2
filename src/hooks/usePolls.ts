import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PollOption {
  text: string;
  votes: number;
  color?: string;
}

export interface Poll {
  id: string;
  title: string;
  description: string | null;
  category: string;
  poll_type: 'single_choice' | 'multiple_choice' | 'rating' | 'yes_no';
  options: PollOption[];
  settings: {
    max_selections?: number;
    show_results_before_vote?: boolean;
    require_comment?: boolean;
    rating_scale?: number;
  };
  created_by: string | null;
  is_active: boolean;
  is_featured: boolean;
  visibility: string;
  starts_at: string;
  ends_at: string | null;
  total_votes: number;
  total_participants: number;
  created_at: string;
  updated_at: string;
  creator_profile?: {
    display_name: string;
    avatar_url: string;
  };
}

export interface PollResponse {
  id: string;
  poll_id: string;
  user_id: string | null;
  selected_options: number[];
  rating_value: number | null;
  comment: string | null;
  is_anonymous: boolean;
  created_at: string;
}

export const usePolls = (category?: string) => {
  return useQuery({
    queryKey: ['polls', category],
    queryFn: async () => {
      let query = supabase
        .from('polls')
        .select('*')
        .eq('is_active', true)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Calculate vote counts from options
      const pollsWithCounts = (data || []).map(poll => {
        const options = (poll.options as any[]).map((opt, idx) => ({
          text: typeof opt === 'string' ? opt : opt.text,
          votes: typeof opt === 'object' ? opt.votes || 0 : 0,
          color: getOptionColor(idx),
        }));
        return { ...poll, options };
      });

      return pollsWithCounts as Poll[];
    },
  });
};

export const useFeaturedPolls = () => {
  return useQuery({
    queryKey: ['featured-polls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data as Poll[];
    },
  });
};

export const usePollById = (pollId: string) => {
  return useQuery({
    queryKey: ['poll', pollId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('id', pollId)
        .single();

      if (error) throw error;

      // Get response counts
      const { data: responses } = await supabase
        .from('poll_responses')
        .select('selected_options')
        .eq('poll_id', pollId);

      const voteCounts: Record<number, number> = {};
      (responses || []).forEach(r => {
        (r.selected_options || []).forEach((idx: number) => {
          voteCounts[idx] = (voteCounts[idx] || 0) + 1;
        });
      });

      const options = (data.options as any[]).map((opt, idx) => ({
        text: typeof opt === 'string' ? opt : opt.text,
        votes: voteCounts[idx] || 0,
        color: getOptionColor(idx),
      }));

      return { ...data, options } as Poll;
    },
    enabled: !!pollId,
  });
};

export const useUserPollResponse = (pollId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['poll-user-response', pollId, user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('poll_responses')
        .select('*')
        .eq('poll_id', pollId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data as PollResponse | null;
    },
    enabled: !!pollId && !!user,
  });
};

export const useSubmitPollVote = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      pollId,
      selectedOptions,
      ratingValue,
      comment,
      isAnonymous,
    }: {
      pollId: string;
      selectedOptions: number[];
      ratingValue?: number;
      comment?: string;
      isAnonymous?: boolean;
    }) => {
      if (!user) throw new Error('Must be logged in to vote');

      const { error } = await supabase.from('poll_responses').insert({
        poll_id: pollId,
        user_id: user.id,
        selected_options: selectedOptions,
        rating_value: ratingValue || null,
        comment: comment || null,
        is_anonymous: isAnonymous || false,
      });

      if (error) throw error;

      // Update vote counts in poll options
      const { data: poll } = await supabase
        .from('polls')
        .select('options')
        .eq('id', pollId)
        .single();

      if (poll) {
        const updatedOptions = (poll.options as any[]).map((opt, idx) => ({
          ...opt,
          votes: (opt.votes || 0) + (selectedOptions.includes(idx) ? 1 : 0),
        }));

        await supabase
          .from('polls')
          .update({ options: updatedOptions })
          .eq('id', pollId);
      }

      // Track analytics
      await supabase.from('poll_analytics').insert({
        poll_id: pollId,
        event_type: 'vote',
        user_id: isAnonymous ? null : user.id,
        metadata: { options_selected: selectedOptions.length },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['poll', variables.pollId] });
      queryClient.invalidateQueries({ queryKey: ['poll-user-response', variables.pollId] });
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      toast.success('Your vote has been recorded!');
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate')) {
        toast.error('You have already voted in this poll');
      } else {
        toast.error('Failed to submit vote');
      }
    },
  });
};

export const useCreatePoll = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      category,
      pollType,
      options,
      settings,
      endsAt,
      visibility,
    }: {
      title: string;
      description?: string;
      category: string;
      pollType: Poll['poll_type'];
      options: string[];
      settings?: Poll['settings'];
      endsAt?: string;
      visibility?: string;
    }) => {
      if (!user) throw new Error('Must be logged in to create a poll');

      const { data, error } = await supabase
        .from('polls')
        .insert({
          title,
          description: description || null,
          category,
          poll_type: pollType,
          options: options.map(text => ({ text, votes: 0 })),
          settings: settings || {},
          created_by: user.id,
          ends_at: endsAt || null,
          visibility: visibility || 'public',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      toast.success('Poll created successfully!');
    },
    onError: () => {
      toast.error('Failed to create poll');
    },
  });
};

export const useDeletePoll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pollId: string) => {
      const { error } = await supabase.from('polls').delete().eq('id', pollId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      toast.success('Poll deleted');
    },
    onError: () => {
      toast.error('Failed to delete poll');
    },
  });
};

export const usePollAnalytics = (pollId: string) => {
  return useQuery({
    queryKey: ['poll-analytics', pollId],
    queryFn: async () => {
      const { data: responses, error } = await supabase
        .from('poll_responses')
        .select('selected_options, rating_value, is_anonymous, created_at')
        .eq('poll_id', pollId);

      if (error) throw error;

      // Calculate analytics
      const totalResponses = responses?.length || 0;
      const anonymousCount = responses?.filter(r => r.is_anonymous).length || 0;
      const responsesOverTime = groupResponsesByDay(responses || []);

      return {
        totalResponses,
        anonymousCount,
        responsesOverTime,
      };
    },
    enabled: !!pollId,
  });
};

// Helper functions
function getOptionColor(index: number): string {
  const colors = [
    'hsl(var(--primary))',
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];
  return colors[index % colors.length];
}

function groupResponsesByDay(responses: any[]): { date: string; count: number }[] {
  const grouped: Record<string, number> = {};
  
  responses.forEach(r => {
    const date = new Date(r.created_at).toISOString().split('T')[0];
    grouped[date] = (grouped[date] || 0) + 1;
  });

  return Object.entries(grouped)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
