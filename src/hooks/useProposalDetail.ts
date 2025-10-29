import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Proposal } from './useProposals';

export interface ProposalComment {
  id: string;
  proposal_id: string;
  user_id: string;
  parent_comment_id: string | null;
  body: string;
  like_count: number;
  is_pinned: boolean;
  is_edited: boolean;
  display_anonymous: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name: string;
    avatar_url: string | null;
  };
}

export const useProposalDetail = (slug: string) => {
  return useQuery({
    queryKey: ['proposal', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as Proposal;
    },
    enabled: !!slug,
  });
};

export const useProposalComments = (proposalId: string) => {
  return useQuery({
    queryKey: ['comments', proposalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_comments')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch profiles separately for non-anonymous comments
      const commentsWithProfiles = await Promise.all(
        data.map(async (comment) => {
          if (comment.display_anonymous) {
            return { ...comment, profiles: null };
          }
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', comment.user_id)
            .single();
            
          return { ...comment, profiles: profile };
        })
      );

      return commentsWithProfiles as ProposalComment[];
    },
    enabled: !!proposalId,
  });
};

export const useUserVote = (proposalId: string) => {
  return useQuery({
    queryKey: ['vote', proposalId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('proposal_votes')
        .select('*')
        .eq('proposal_id', proposalId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!proposalId,
  });
};

export const useUserInteraction = (proposalId: string, interactionType: 'like' | 'support' | 'oppose' | 'idea' | 'bookmark') => {
  return useQuery({
    queryKey: ['interaction', proposalId, interactionType],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('proposal_interactions')
        .select('*')
        .eq('proposal_id', proposalId)
        .eq('user_id', user.id)
        .eq('interaction_type', interactionType)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!proposalId && !!interactionType,
  });
};
