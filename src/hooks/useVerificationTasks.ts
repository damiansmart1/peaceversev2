import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { useToast } from '@/hooks/use-toast';

export interface VerificationResult {
  taskId: string;
  verdict: 'verified' | 'rejected' | 'needs_more_info';
  confidence_score: number;
  notes?: string;
  evidence_urls?: string[];
  recommended_action?: string;
}

export const useVerificationTasks = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading, refetch } = useQuery({
    queryKey: ['verification-tasks'],
    queryFn: async () => {
      const { data, error }: any = await supabase
        .from('verification_tasks')
        .select(`
          *,
          citizen_reports:report_id(
            id, title, description, category, sub_category, severity_level, urgency_level,
            location_name, location_city, location_country, location_latitude, location_longitude,
            ai_threat_level, ai_sentiment, credibility_score, is_anonymous, witness_count,
            media_urls, tags, created_at, verification_status, status
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time sync
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  const assignTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { data, error } = await supabase.functions.invoke('assign-verification-task', {
        body: { taskId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-tasks'] });
      toast({
        title: 'Task Assigned',
        description: 'You have been assigned to verify this report.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Assignment Failed',
        description: error.message || 'Failed to assign task',
        variant: 'destructive',
      });
    },
  });

  const completeVerification = useMutation({
    mutationFn: async (result: VerificationResult) => {
      const { data, error } = await supabase.functions.invoke('complete-verification', {
        body: result,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['citizen-reports'] });
      toast({
        title: 'Verification Complete',
        description: 'The report has been verified successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Failed to complete verification',
        variant: 'destructive',
      });
    },
  });

  return {
    tasks,
    isLoading,
    refetch,
    assignTask: assignTask.mutate,
    isAssigning: assignTask.isPending,
    completeVerification: completeVerification.mutate,
    isCompleting: completeVerification.isPending,
  };
};

export const useMyTasks = () => {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  return useQuery({
    queryKey: ['my-verification-tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error }: any = await supabase
        .from('verification_tasks')
        .select(`
          *,
          citizen_reports:report_id(
            id, title, description, category, sub_category, severity_level, urgency_level,
            location_name, location_city, location_country, location_latitude, location_longitude,
            ai_threat_level, ai_sentiment, credibility_score, is_anonymous, witness_count,
            media_urls, tags, created_at, verification_status
          )
        `)
        .eq('assigned_to', user.id)
        .in('status', ['pending', 'in_progress'])
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};
