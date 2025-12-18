import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { useToast } from '@/hooks/use-toast';
import { createNotification } from './useNotifications';

export interface ReportSubmission {
  title: string;
  description: string;
  category: string;
  sub_category?: string;
  
  // Incident details
  incident_date?: string;
  incident_time?: string;
  duration_minutes?: number;
  severity_level?: string;
  urgency_level?: string;
  
  // People involved
  estimated_people_affected?: number;
  casualties_reported?: number;
  injuries_reported?: number;
  children_involved?: boolean;
  vulnerable_groups_affected?: string[];
  
  // Perpetrator
  perpetrator_type?: string;
  perpetrator_description?: string;
  
  // Witnesses
  has_witnesses?: boolean;
  witness_count?: number;
  
  // Contact
  reporter_contact_phone?: string;
  reporter_contact_email?: string;
  preferred_contact_method?: string;
  
  // Location
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    region?: string;
    country?: string;
    postal_code?: string;
    accuracy?: string;
    type?: string;
  };
  
  // Evidence
  media_urls?: string[];
  evidence_description?: string;
  has_physical_evidence?: boolean;
  
  // Impact
  immediate_needs?: string[];
  community_impact_level?: string;
  services_disrupted?: string[];
  infrastructure_damage?: string[];
  economic_impact_estimate?: number;
  community_response?: string;
  immediate_actions_taken?: string[];
  
  // Assistance
  assistance_received?: boolean;
  assistance_type?: string[];
  assistance_provider?: string;
  
  // Context
  historical_context?: string;
  recurring_issue?: boolean;
  first_occurrence?: boolean;
  previous_reports_filed?: boolean;
  related_incidents?: string;
  
  // Authorities
  authorities_notified?: boolean;
  authorities_responded?: boolean;
  authority_response_details?: string;
  
  // Follow-up
  follow_up_contact_consent?: boolean;
  
  // Metadata
  is_anonymous?: boolean;
  tags?: string[];
}

export const useCitizenReports = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['citizen-reports'],
    queryFn: async () => {
      // Use secure view - masks sensitive data for unauthorized users
      const { data, error }: any = await supabase
        .from('citizen_reports_safe' as any)
        .select('*')
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
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['citizen-reports'] });
      
      // Create notification for report submission
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await createNotification(
          user.id,
          'report_status',
          '📋 Report Submitted Successfully',
          `Your incident report "${variables.title}" has been submitted and is being reviewed.`,
          { report_title: variables.title, status: 'pending' }
        ).catch(console.error);
      }
      
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
      // Use secure view - masks sensitive data for unauthorized users
      const { data, error }: any = await supabase
        .from('citizen_reports_safe' as any)
        .select('*')
        .eq('id', reportId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!reportId,
  });
};
