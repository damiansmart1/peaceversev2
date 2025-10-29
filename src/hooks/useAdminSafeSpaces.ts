import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdminSafeSpace {
  id: string;
  name: string;
  description: string | null;
  location_name: string;
  space_type: string;
  latitude: number | null;
  longitude: number | null;
  verified: boolean;
  is_archived: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useAdminSafeSpaces = () => {
  return useQuery({
    queryKey: ['admin-safe-spaces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('safe_spaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdminSafeSpace[];
    },
  });
};

export const useCreateSafeSpace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (safeSpace: Partial<AdminSafeSpace>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('safe_spaces')
        .insert({
          name: safeSpace.name!,
          description: safeSpace.description,
          location_name: safeSpace.location_name!,
          space_type: safeSpace.space_type!,
          latitude: safeSpace.latitude,
          longitude: safeSpace.longitude,
          verified: safeSpace.verified,
          created_by: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-safe-spaces'] });
      toast.success('Safe space created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create safe space: ${error.message}`);
    },
  });
};

export const useUpdateSafeSpace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AdminSafeSpace> }) => {
      const { data, error } = await supabase
        .from('safe_spaces')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-safe-spaces'] });
      toast.success('Safe space updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update safe space: ${error.message}`);
    },
  });
};

export const useDeleteSafeSpace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('safe_spaces')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-safe-spaces'] });
      toast.success('Safe space deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete safe space: ${error.message}`);
    },
  });
};

export const useArchiveSafeSpace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, archived }: { id: string; archived: boolean }) => {
      const { error } = await supabase
        .from('safe_spaces')
        .update({ is_archived: archived })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-safe-spaces'] });
      toast.success('Safe space archive status updated');
    },
    onError: (error) => {
      toast.error(`Failed to archive safe space: ${error.message}`);
    },
  });
};
