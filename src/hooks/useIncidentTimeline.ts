import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TimelineEvent {
  id: string;
  incident_id: string;
  event_type: string;
  event_title: string;
  event_description: string | null;
  actor_id: string | null;
  actor_name: string | null;
  actor_role: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export const useIncidentTimeline = (incidentId: string | undefined) => {
  return useQuery({
    queryKey: ['incident-timeline', incidentId],
    queryFn: async () => {
      if (!incidentId) return [];
      
      const { data, error } = await supabase
        .from('incident_timeline')
        .select('*')
        .eq('incident_id', incidentId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as TimelineEvent[];
    },
    enabled: !!incidentId,
  });
};

export const useAddTimelineEvent = () => {
  const addEvent = async (event: {
    incident_id: string;
    event_type: string;
    event_title: string;
    event_description?: string;
    actor_id?: string;
    actor_name?: string;
    actor_role?: string;
    metadata?: Record<string, any>;
  }) => {
    const { data, error } = await supabase
      .from('incident_timeline')
      .insert([event])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };
  
  return { addEvent };
};
