import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { toast } from 'sonner';

export interface AdminProposal {
  id: string;
  title: string;
  summary: string;
  body: string;
  slug: string;
  status: string;
  author_id: string;
  is_archived: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  signature_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  tags: string[] | null;
}

export const useAdminProposals = () => {
  return useQuery({
    queryKey: ['admin-proposals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdminProposal[];
    },
  });
};

export const useCreateProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposal: Partial<AdminProposal>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('proposals')
        .insert({
          title: proposal.title!,
          summary: proposal.summary!,
          body: proposal.body!,
          status: proposal.status as any,
          tags: proposal.tags,
          author_id: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-proposals'] });
      toast.success('Proposal created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create proposal: ${error.message}`);
    },
  });
};

export const useUpdateProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AdminProposal> }) => {
      const { data, error } = await supabase
        .from('proposals')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposal updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update proposal: ${error.message}`);
    },
  });
};

export const useDeleteProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposal deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete proposal: ${error.message}`);
    },
  });
};

export const useArchiveProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, archived }: { id: string; archived: boolean }) => {
      const { error } = await supabase
        .from('proposals')
        .update({ is_archived: archived })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposal archive status updated');
    },
    onError: (error) => {
      toast.error(`Failed to archive proposal: ${error.message}`);
    },
  });
};
