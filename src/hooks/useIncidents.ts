import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { toast } from 'sonner';

export interface Incident {
  id: string;
  title: string;
  description: string;
  incident_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'under_review' | 'verified' | 'rejected' | 'escalated' | 'resolved';
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
        .from('citizen_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.severity) {
        query = query.eq('severity_level', filters.severity);
      }
      if (filters?.country) {
        query = query.eq('location_country', filters.country);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Map citizen_reports to Incident format
      return (data || []).map(report => ({
        id: report.id,
        title: report.title,
        description: report.description,
        incident_type: report.category,
        severity: report.severity_level as 'low' | 'medium' | 'high' | 'critical',
        status: report.status as any || 'reported',
        geo_location: report.location_latitude && report.location_longitude ? {
          latitude: report.location_latitude,
          longitude: report.location_longitude,
        } : null,
        location_name: report.location_name || report.location_city,
        country_code: report.location_country,
        region: report.location_region,
        reported_by: report.reporter_id,
        is_anonymous: report.is_anonymous || false,
        verified_by: report.verified_by,
        verified_at: report.verified_at,
        assigned_to: null,
        escalated_to: null,
        priority: report.severity_level === 'critical' ? 1 : report.severity_level === 'high' ? 2 : 3,
        affected_population: report.estimated_people_affected,
        related_content_ids: null,
        related_proposal_ids: null,
        metadata: null,
        sentiment_data: report.ai_sentiment ? { sentiment: report.ai_sentiment } : null,
        ai_analysis: report.ai_key_entities,
        resolution_notes: report.resolution_notes,
        resolved_at: report.resolution_date,
        created_at: report.created_at!,
        updated_at: report.updated_at!,
      })) as Incident[];
    },
  });
};

export const useCreateIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incident: Partial<Incident>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const newReport = {
        title: incident.title,
        description: incident.description,
        category: incident.incident_type,
        severity_level: incident.severity,
        status: incident.status,
        location_latitude: incident.geo_location?.latitude,
        location_longitude: incident.geo_location?.longitude,
        location_name: incident.location_name,
        location_country: incident.country_code,
        location_region: incident.region,
        reporter_id: incident.is_anonymous ? null : user?.id,
        is_anonymous: incident.is_anonymous,
        estimated_people_affected: incident.affected_population,
      };

      const { data, error } = await supabase
        .from('citizen_reports')
        .insert(newReport as any)
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
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.incident_type !== undefined) updateData.category = updates.incident_type;
      if (updates.severity !== undefined) updateData.severity_level = updates.severity;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.verified_by !== undefined) updateData.verified_by = updates.verified_by;
      if (updates.verified_at !== undefined) updateData.verified_at = updates.verified_at;
      if (updates.resolution_notes !== undefined) updateData.resolution_notes = updates.resolution_notes;
      if (updates.resolved_at !== undefined) updateData.resolution_date = updates.resolved_at;
      
      const { data, error } = await supabase
        .from('citizen_reports')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

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