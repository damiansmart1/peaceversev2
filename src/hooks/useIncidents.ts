import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Incident {
  id: string;
  title: string;
  description: string;
  incident_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'verified' | 'escalated' | 'in_progress' | 'resolved' | 'closed';
  geo_location: any;
  location_name: string | null;
  country_code: string | null;
  region: string | null;
  reported_by: string | null;
  is_anonymous: boolean;
  verified_by: string | null;
  verified_at: string | null;
  assigned_to: string | null;
  escalated_to: string | null;
  priority: number;
  affected_population: number | null;
  related_content_ids: string[] | null;
  related_proposal_ids: string[] | null;
  metadata: any;
  sentiment_data: any;
  ai_analysis: any;
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useIncidents = (filters?: { 
  status?: string;
  severity?: string;
  country?: string;
}) => {
  return useQuery({
    queryKey: ['incidents', filters],
    queryFn: async () => {
      let query = supabase
        .from('incidents' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters?.country) {
        query = query.eq('country_code', filters.country);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Incident[];
    },
  });
};

export const useCreateIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incident: Partial<Incident>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const newIncident = {
        ...incident,
        reported_by: incident.is_anonymous ? null : user?.id,
      };

      const { data, error } = await supabase
        .from('incidents' as any)
        .insert(newIncident as any)
        .select()
        .single();

      if (error) throw error;

      // Trigger sentiment analysis
      if (incident.description) {
        try {
          await supabase.functions.invoke('analyze-sentiment', {
            body: {
              text: `${incident.title}\n\n${incident.description}`,
              contentId: null,
              proposalId: null,
            },
          });
        } catch (err) {
          console.error('Sentiment analysis failed:', err);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Incident reported successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to report incident: ${error.message}`);
    },
  });
};

export const useUpdateIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Incident> }) => {
      const { data, error } = await supabase
        .from('incidents' as any)
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log to timeline
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('incident_timeline' as any).insert({
        incident_id: id,
        event_type: 'status_change',
        old_status: null,
        new_status: updates.status,
        actor_id: user?.id,
        notes: updates.resolution_notes || null,
      } as any);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Incident updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update incident: ${error.message}`);
    },
  });
};