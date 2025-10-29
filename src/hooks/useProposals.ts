import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Proposal {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  status: 'draft' | 'published' | 'closed' | 'archived';
  author_id: string;
  co_authors: string[];
  tags: string[];
  signature_goal: number | null;
  signature_count: number;
  view_count: number;
  unique_contributors: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  vote_support_count: number;
  vote_oppose_count: number;
  created_at: string;
  updated_at: string;
}

export const useProposals = () => {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Proposal[];
    },
  });
};

export const useCreateProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposal: {
      title: string;
      summary: string;
      body: string;
      tags: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate slug
      const { data: slugData, error: slugError } = await supabase
        .rpc('generate_proposal_slug', { title: proposal.title });

      if (slugError) throw slugError;

      const { data, error } = await supabase
        .from('proposals')
        .insert({
          ...proposal,
          slug: slugData,
          author_id: user.id,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposal created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create proposal: ' + error.message);
    },
  });
};

export const usePublishProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposalId: string) => {
      const { data, error } = await supabase
        .from('proposals')
        .update({ status: 'published' })
        .eq('id', proposalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposal published successfully');
    },
    onError: (error) => {
      toast.error('Failed to publish proposal: ' + error.message);
    },
  });
};

export const useVoteProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      proposalId,
      voteValue,
      displayAnonymous,
    }: {
      proposalId: string;
      voteValue: 1 | -1;
      displayAnonymous: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Allow anonymous voting by generating a temporary ID
      const userId = user?.id || null;

      const { data, error } = await supabase
        .from('proposal_votes')
        .upsert({
          proposal_id: proposalId,
          user_id: userId,
          vote_value: voteValue,
          display_anonymous: displayAnonymous || !user,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal'] });
      toast.success('Vote recorded');
    },
    onError: (error) => {
      toast.error('Failed to vote: ' + error.message);
    },
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      proposalId,
      body,
      displayAnonymous,
      parentCommentId,
    }: {
      proposalId: string;
      body: string;
      displayAnonymous: boolean;
      parentCommentId?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Allow anonymous commenting
      const userId = user?.id || null;

      const { data, error } = await supabase
        .from('proposal_comments')
        .insert({
          proposal_id: proposalId,
          user_id: userId,
          body,
          display_anonymous: displayAnonymous || !user,
          parent_comment_id: parentCommentId || null,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Comment added');
    },
    onError: (error) => {
      toast.error('Failed to add comment: ' + error.message);
    },
  });
};

export const useAddInteraction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      proposalId,
      interactionType,
    }: {
      proposalId: string;
      interactionType: 'like' | 'support' | 'oppose' | 'idea' | 'bookmark';
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('proposal_interactions')
        .upsert({
          proposal_id: proposalId,
          user_id: user.id,
          interaction_type: interactionType,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal'] });
    },
    onError: (error) => {
      toast.error('Failed to add interaction: ' + error.message);
    },
  });
};

export const useShareProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      proposalId,
      platform,
    }: {
      proposalId: string;
      platform: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('proposal_shares')
        .insert({
          proposal_id: proposalId,
          user_id: user?.id || null,
          platform,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal'] });
    },
  });
};
