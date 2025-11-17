import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { useToast } from '@/hooks/use-toast';

export interface ReportSubmission {
  title: string;
  description: string;
  category: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  media_urls?: string[];
  is_anonymous?: boolean;
  tags?: string[];
}

export const useCitizenReports = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['citizen-reports'],
    queryFn: async () => {
      const { data, error }: any = await supabase
        .from('citizen_reports')
        .select('*, profiles(username, display_name, avatar_url)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const submitReport = useMutation({
    mutationFn: async (submission: ReportSubmission) => {
      const { data, error } = await supabase.functions.invoke('submit-report', {
        body: submission,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citizen-reports'] });
      toast({
        title: 'Report Submitted',
        description: 'Your report has been submitted for verification.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit report',
        variant: 'destructive',
      });
    },
  });

  return {
    reports,
    isLoading,
    error,
    submitReport: submitReport.mutate,
    isSubmitting: submitReport.isPending,
  };
};

export const useReportDetail = (reportId: string) => {
  return useQuery({
    queryKey: ['citizen-report', reportId],
    queryFn: async () => {
      const { data, error }: any = await supabase
        .from('citizen_reports')
        .select(`
          *,
          profiles(username, display_name, avatar_url),
          verification_tasks(*, profiles(username, display_name))
        `)
        .eq('id', reportId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!reportId,
  });
};
