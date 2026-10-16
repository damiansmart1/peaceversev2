import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { toast } from 'sonner';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  creator_id: string;
  visibility: string;
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  jurisdiction?: string | null;
  response_required_by?: string | null;
  profiles?: {
    display_name: string | null;
    username: string | null;
  };
}

export const useProposals = () => {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      // First get all proposals
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('proposals')
        .select('*')
        .in('status', ['published', 'active', 'voting'])
        .order('created_at', { ascending: false });

      if (proposalsError) throw proposalsError;
      if (!proposalsData || proposalsData.length === 0) return [];

      // Get unique creator IDs
      const creatorIds = [...new Set(proposalsData.map(p => p.creator_id))];

      // Fetch author profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, username')
        .in('id', creatorIds);

      if (profilesError) throw profilesError;

      // Create a map of profiles by id
      const profilesMap = new Map(
        (profilesData || []).map(p => [p.id, p])
      );

      // Merge profiles with proposals
      const enrichedProposals = proposalsData.map(proposal => ({
        ...proposal,
        profiles: profilesMap.get(proposal.creator_id) || null
      }));

      return enrichedProposals as Proposal[];
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
      billProposerName: string;
      parliamentaryStage: string;
      billFileUrl?: string | null;
      category?: string;
      jurisdiction?: string;
      responseRequiredBy?: string;
      draft?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('proposals')
        .insert({
          title: proposal.title,
          description: proposal.body,
          category: proposal.category || 'governance',
          tags: proposal.tags,
          stage: proposal.parliamentaryStage,
          jurisdiction: proposal.jurisdiction || null,
          response_required_by: proposal.responseRequiredBy || null,
          creator_id: user.id,
          status: proposal.draft ? 'draft' : 'published',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposal saved');
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
      voteValue: 1 | -1 | 0;
      displayAnonymous: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || user.is_anonymous) throw new Error('Sign in to participate');
      const userId = user.id;

      // Convert numeric vote value to text format used in database
      const voteText = voteValue === 1 ? 'for' : voteValue === -1 ? 'against' : 'abstain';

      const { data, error } = await supabase
        .from('proposal_votes')
        .upsert({
          proposal_id: proposalId,
          user_id: userId,
          vote: voteText,
          display_anonymous: displayAnonymous || !user,
        } as any, { onConflict: 'proposal_id,user_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal'] });
      queryClient.invalidateQueries({ queryKey: ['vote', variables.proposalId] });
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
