import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { toast } from 'sonner';

export interface AdminContent {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  thumbnail_url: string | null;
  category: string;
  attachments: any[];
  user_id: string;
  is_archived: boolean;
  approval_status: 'pending_approval' | 'approved' | 'rejected' | 'draft';
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export const useAdminContent = () => {
  return useQuery({
    queryKey: ['admin-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdminContent[];
    },
  });
};

export const useCreateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: Partial<AdminContent>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('content')
        .insert({
          title: content.title!,
          description: content.description,
          file_url: content.file_url!,
          file_type: content.file_type!,
          thumbnail_url: content.thumbnail_url || null,
          category: content.category || 'general',
          attachments: content.attachments || [],
          user_id: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content'] });
      toast.success('Content created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create content: ${error.message}`);
    },
  });
};

export const useUpdateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AdminContent> }) => {
      const { data, error } = await supabase
        .from('content')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content'] });
      toast.success('Content updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update content: ${error.message}`);
    },
  });
};

export const useDeleteContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content'] });
      toast.success('Content deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete content: ${error.message}`);
    },
  });
};

export const useArchiveContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, archived }: { id: string; archived: boolean }) => {
      const { error } = await supabase
        .from('content')
        .update({ is_archived: archived })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content'] });
      toast.success('Content archive status updated');
    },
    onError: (error) => {
      toast.error(`Failed to archive content: ${error.message}`);
    },
  });
};
