import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export const useMyReports = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['my-reports', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error }: any = await supabase
        .from('citizen_reports')
        .select(`
          *,
          verification_tasks(
            id,
            status,
            priority,
            assigned_to,
            created_at,
            updated_at,
            assigned_user:profiles!verification_tasks_assigned_to_fkey(
              username,
              display_name,
              avatar_url
            )
          ),
          verified_by_profile:profiles!citizen_reports_verified_by_fkey(
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('reporter_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Set up real-time subscription for status updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('my-reports-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'citizen_reports',
          filter: `reporter_id=eq.${user.id}`,
        },
        (payload) => {
          // Invalidate queries to refetch updated data
          queryClient.invalidateQueries({ queryKey: ['my-reports', user.id] });
          
          // Show toast notification
          toast({
            title: 'Report Updated',
            description: 'One of your reports has been updated.',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient, toast]);

  return {
    reports,
    isLoading,
    error,
  };
};
