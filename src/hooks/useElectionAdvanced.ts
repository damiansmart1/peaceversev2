import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Observation Checklists
export interface ObservationChecklist {
  id: string;
  election_id: string;
  polling_station_id?: string;
  observer_id?: string;
  phase: 'opening' | 'voting' | 'counting' | 'closing';
  checklist_data: Record<string, any>;
  overall_rating?: string;
  notes?: string;
  submitted_at?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
}

export interface ObserverCheckIn {
  id: string;
  election_id: string;
  observer_id: string;
  polling_station_id?: string;
  check_type: 'check_in' | 'check_out' | 'periodic';
  latitude: number;
  longitude: number;
  accuracy_meters?: number;
  device_info?: Record<string, any>;
  checked_at?: string;
}

export interface ElectionAnomaly {
  id: string;
  election_id: string;
  polling_station_id?: string;
  anomaly_type: string;
  severity: string;
  description?: string;
  statistical_data?: Record<string, any>;
  confidence_score?: number;
  status: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at?: string;
}

export interface PVTSample {
  id: string;
  election_id: string;
  polling_station_id?: string;
  sample_group?: string;
  results_data: Record<string, any>;
  turnout_data?: Record<string, any>;
  projected_results?: Record<string, any>;
  margin_of_error?: number;
  confidence_level?: number;
  submitted_by?: string;
  submitted_at?: string;
}

// Observation Checklists hooks
export const useObservationChecklists = (electionId?: string) => {
  return useQuery({
    queryKey: ['observation-checklists', electionId],
    queryFn: async () => {
      let query = supabase
        .from('observation_checklists')
        .select('*')
        .order('submitted_at', { ascending: false });
      if (electionId) query = query.eq('election_id', electionId);
      const { data, error } = await query;
      if (error) throw error;
      return data as ObservationChecklist[];
    },
    enabled: !!electionId,
  });
};

export const useSubmitChecklist = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (checklist: Partial<ObservationChecklist>) => {
      const { data, error } = await supabase
        .from('observation_checklists')
        .insert(checklist as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['observation-checklists', data.election_id] });
      toast({ title: 'Checklist submitted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to submit checklist', description: error.message, variant: 'destructive' });
    },
  });
};

// Observer Check-ins hooks
export const useObserverCheckIns = (electionId?: string) => {
  return useQuery({
    queryKey: ['observer-check-ins', electionId],
    queryFn: async () => {
      let query = supabase
        .from('observer_check_ins')
        .select('*')
        .order('checked_at', { ascending: false });
      if (electionId) query = query.eq('election_id', electionId);
      const { data, error } = await query;
      if (error) throw error;
      return data as ObserverCheckIn[];
    },
    enabled: !!electionId,
  });
};

export const useSubmitCheckIn = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (checkIn: Partial<ObserverCheckIn>) => {
      const { data, error } = await supabase
        .from('observer_check_ins')
        .insert(checkIn as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['observer-check-ins', data.election_id] });
      toast({ title: 'Check-in recorded' });
    },
    onError: (error: any) => {
      toast({ title: 'Check-in failed', description: error.message, variant: 'destructive' });
    },
  });
};

// Election Anomalies hooks
export const useElectionAnomalies = (electionId?: string) => {
  return useQuery({
    queryKey: ['election-anomalies', electionId],
    queryFn: async () => {
      let query = supabase
        .from('election_anomalies')
        .select('*')
        .order('created_at', { ascending: false });
      if (electionId) query = query.eq('election_id', electionId);
      const { data, error } = await query;
      if (error) throw error;
      return data as ElectionAnomaly[];
    },
    enabled: !!electionId,
  });
};

export const useCreateAnomaly = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (anomaly: Partial<ElectionAnomaly>) => {
      const { data, error } = await supabase
        .from('election_anomalies')
        .insert(anomaly as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['election-anomalies', data.election_id] });
    },
  });
};

export const useReviewAnomaly = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('election_anomalies')
        .update({ status, reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['election-anomalies'] });
      toast({ title: 'Anomaly reviewed' });
    },
    onError: (error: any) => {
      toast({ title: 'Review failed', description: error.message, variant: 'destructive' });
    },
  });
};

// PVT Samples hooks
export const usePVTSamples = (electionId?: string) => {
  return useQuery({
    queryKey: ['pvt-samples', electionId],
    queryFn: async () => {
      let query = supabase
        .from('pvt_samples')
        .select('*')
        .order('submitted_at', { ascending: false });
      if (electionId) query = query.eq('election_id', electionId);
      const { data, error } = await query;
      if (error) throw error;
      return data as PVTSample[];
    },
    enabled: !!electionId,
  });
};

export const useSubmitPVTSample = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (sample: Partial<PVTSample>) => {
      const { data, error } = await supabase
        .from('pvt_samples')
        .insert(sample as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['pvt-samples', data.election_id] });
      toast({ title: 'PVT sample submitted' });
    },
    onError: (error: any) => {
      toast({ title: 'Submission failed', description: error.message, variant: 'destructive' });
    },
  });
};
