import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { toast } from 'sonner';

export type ReactionType = 'heart' | 'peace' | 'support' | 'inspire' | 'powerful';

interface StoryReaction {
  id: string;
  content_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

export const useStoryReactions = (contentId: string) => {
  return useQuery({
    queryKey: ['story-reactions', contentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('likes')
        .select('*')
        .eq('content_id', contentId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!contentId,
  });
};

export const useUserReaction = (contentId: string) => {
  return useQuery({
    queryKey: ['user-reaction', contentId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('likes')
        .select('*')
        .eq('content_id', contentId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!contentId,
  });
};

export const useToggleReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contentId }: { contentId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { data: existing } = await supabase
        .from('likes')
        .select('id')
        .eq('content_id', contentId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('id', existing.id);
        if (error) throw error;
        return { action: 'removed' };
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({ content_id: contentId, user_id: user.id });
        if (error) throw error;
        return { action: 'added' };
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['story-reactions', variables.contentId] });
      queryClient.invalidateQueries({ queryKey: ['user-reaction', variables.contentId] });
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
    onError: (error) => {
      toast.error('Failed to update reaction');
      console.error(error);
    },
  });
};
