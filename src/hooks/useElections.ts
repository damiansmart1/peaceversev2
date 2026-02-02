import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ElectionStatus = 'draft' | 'scheduled' | 'registration' | 'campaigning' | 'voting' | 'counting' | 'verification' | 'certified' | 'disputed' | 'completed';
export type ElectionType = 'presidential' | 'parliamentary' | 'gubernatorial' | 'local' | 'referendum' | 'by_election' | 'primary';
export type IncidentSeverity = 'minor' | 'moderate' | 'serious' | 'critical' | 'emergency';
export type ObserverRole = 'domestic_observer' | 'international_observer' | 'party_agent' | 'media' | 'election_official' | 'security_personnel';

export interface Election {
  id: string;
  name: string;
  description?: string;
  election_type: ElectionType;
  country_code: string;
  country_name: string;
  regions: string[];
  registration_start?: string;
  registration_end?: string;
  campaign_start?: string;
  campaign_end?: string;
  voting_date: string;
  voting_end_date?: string;
  status: ElectionStatus;
  is_active: boolean;
  total_registered_voters: number;
  total_polling_stations: number;
  config: Record<string, any>;
  candidates: any[];
  political_parties: any[];
  verification_required: boolean;
  multi_signature_required: boolean;
  min_signatures_required: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PollingStation {
  id: string;
  election_id: string;
  station_code: string;
  station_name: string;
  country_code: string;
  region?: string;
  district?: string;
  constituency?: string;
  ward?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  registered_voters: number;
  is_active: boolean;
  is_accessible: boolean;
  accessibility_notes?: string;
  equipment_status: Record<string, any>;
  setup_verified: boolean;
  opened_at?: string;
  closed_at?: string;
}

export interface ElectionObserver {
  id: string;
  election_id: string;
  user_id?: string;
  full_name: string;
  email?: string;
  phone?: string;
  organization?: string;
  observer_role: ObserverRole;
  accreditation_number?: string;
  accreditation_status: string;
  assigned_stations: string[];
  assigned_regions: string[];
  id_verified: boolean;
  training_completed: boolean;
  oath_signed: boolean;
  is_active: boolean;
  deployment_status: string;
}

export interface ElectionIncident {
  id: string;
  election_id: string;
  polling_station_id?: string;
  reported_by?: string;
  reporter_role?: ObserverRole;
  is_anonymous: boolean;
  incident_code: string;
  title: string;
  description: string;
  category: string;
  sub_category?: string;
  severity: IncidentSeverity;
  country_code: string;
  region?: string;
  district?: string;
  location_address?: string;
  latitude?: number;
  longitude?: number;
  incident_datetime: string;
  duration_minutes?: number;
  media_urls: string[];
  evidence_description?: string;
  has_witnesses: boolean;
  witness_count: number;
  people_affected?: number;
  voting_disrupted: boolean;
  disruption_duration_minutes?: number;
  status: string;
  resolution_status?: string;
  verification_status: string;
  credibility_score?: number;
  requires_immediate_action: boolean;
  escalated: boolean;
  created_at: string;
}

export interface ElectionResult {
  id: string;
  election_id: string;
  polling_station_id: string;
  total_registered: number;
  total_votes_cast: number;
  valid_votes: number;
  rejected_votes: number;
  results_data: Record<string, any>;
  turnout_percentage?: number;
  submitted_by: string;
  submitted_at: string;
  signatures: any[];
  signature_count: number;
  fully_verified: boolean;
  status: string;
  contested: boolean;
}

export interface IncidentCategory {
  id: string;
  name: string;
  description?: string;
  severity_default: IncidentSeverity;
  sub_categories: string[];
  is_active: boolean;
  display_order: number;
}

// Fetch all elections
export const useElections = () => {
  return useQuery({
    queryKey: ['elections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .order('voting_date', { ascending: false });

      if (error) throw error;
      return data as Election[];
    },
  });
};

// Fetch single election
export const useElection = (electionId: string | undefined) => {
  return useQuery({
    queryKey: ['election', electionId],
    queryFn: async () => {
      if (!electionId) return null;
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .eq('id', electionId)
        .single();

      if (error) throw error;
      return data as Election;
    },
    enabled: !!electionId,
  });
};

// Fetch polling stations for an election
export const usePollingStations = (electionId: string | undefined) => {
  return useQuery({
    queryKey: ['polling-stations', electionId],
    queryFn: async () => {
      if (!electionId) return [];
      const { data, error } = await supabase
        .from('polling_stations')
        .select('*')
        .eq('election_id', electionId)
        .order('station_code');

      if (error) throw error;
      return data as PollingStation[];
    },
    enabled: !!electionId,
  });
};

// Fetch observers for an election
export const useElectionObservers = (electionId: string | undefined) => {
  return useQuery({
    queryKey: ['election-observers', electionId],
    queryFn: async () => {
      if (!electionId) return [];
      const { data, error } = await supabase
        .from('election_observers')
        .select('*')
        .eq('election_id', electionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ElectionObserver[];
    },
    enabled: !!electionId,
  });
};

// Fetch election incidents
export const useElectionIncidents = (electionId: string | undefined) => {
  return useQuery({
    queryKey: ['election-incidents', electionId],
    queryFn: async () => {
      if (!electionId) return [];
      const { data, error } = await supabase
        .from('election_incidents')
        .select('*')
        .eq('election_id', electionId)
        .order('incident_datetime', { ascending: false });

      if (error) throw error;
      return data as ElectionIncident[];
    },
    enabled: !!electionId,
  });
};

// Fetch all election incidents (for overview)
export const useAllElectionIncidents = () => {
  return useQuery({
    queryKey: ['all-election-incidents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('election_incidents')
        .select('*, elections(name, country_name)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });
};

// Fetch election results
export const useElectionResults = (electionId: string | undefined) => {
  return useQuery({
    queryKey: ['election-results', electionId],
    queryFn: async () => {
      if (!electionId) return [];
      const { data, error } = await supabase
        .from('election_results')
        .select('*, polling_stations(station_name, region, district)')
        .eq('election_id', electionId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!electionId,
  });
};

// Fetch incident categories
export const useIncidentCategories = () => {
  return useQuery({
    queryKey: ['election-incident-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('election_incident_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data as IncidentCategory[];
    },
  });
};

// Create election mutation
export const useCreateElection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (election: Partial<Election>) => {
      const { data, error } = await supabase
        .from('elections')
        .insert(election as any)
        .select()
        .single();

      if (error) throw error;
      return data as Election;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elections'] });
      toast({ title: 'Election created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to create election', description: error.message, variant: 'destructive' });
    },
  });
};

// Update election mutation
export const useUpdateElection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Election> & { id: string }) => {
      const { data, error } = await supabase
        .from('elections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['elections'] });
      queryClient.invalidateQueries({ queryKey: ['election', data.id] });
      toast({ title: 'Election updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to update election', description: error.message, variant: 'destructive' });
    },
  });
};

// Create polling station mutation
export const useCreatePollingStation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (station: Partial<PollingStation>) => {
      const { data, error } = await supabase
        .from('polling_stations')
        .insert(station as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['polling-stations', data.election_id] });
      toast({ title: 'Polling station added successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to add polling station', description: error.message, variant: 'destructive' });
    },
  });
};

// Create observer mutation
export const useCreateObserver = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (observer: Partial<ElectionObserver>) => {
      const { data, error } = await supabase
        .from('election_observers')
        .insert(observer as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['election-observers', data.election_id] });
      toast({ title: 'Observer registered successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to register observer', description: error.message, variant: 'destructive' });
    },
  });
};

// Submit election incident
export const useSubmitElectionIncident = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (incident: Partial<ElectionIncident>) => {
      const { data, error } = await supabase
        .from('election_incidents')
        .insert(incident as any)
        .select()
        .single();

      if (error) throw error;
      return data as ElectionIncident;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['election-incidents', data.election_id] });
      queryClient.invalidateQueries({ queryKey: ['all-election-incidents'] });
      toast({ title: 'Incident reported successfully', description: `Reference: ${data.incident_code}` });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to report incident', description: error.message, variant: 'destructive' });
    },
  });
};

// Update incident status
export const useUpdateIncidentStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status, verification_status, resolution_notes }: { 
      id: string; 
      status?: string; 
      verification_status?: string;
      resolution_notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const updates: Record<string, any> = {};
      
      if (status) updates.status = status;
      if (verification_status) {
        updates.verification_status = verification_status;
        updates.verified_by = user?.id;
        updates.verified_at = new Date().toISOString();
      }
      if (resolution_notes) updates.resolution_notes = resolution_notes;

      const { data, error } = await supabase
        .from('election_incidents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['election-incidents'] });
      queryClient.invalidateQueries({ queryKey: ['all-election-incidents'] });
      toast({ title: 'Incident updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to update incident', description: error.message, variant: 'destructive' });
    },
  });
};

// Submit election result
export const useSubmitElectionResult = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (result: Partial<ElectionResult>) => {
      const { data, error } = await supabase
        .from('election_results')
        .insert(result as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['election-results', data.election_id] });
      toast({ title: 'Result submitted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to submit result', description: error.message, variant: 'destructive' });
    },
  });
};

// Election statistics hook
export const useElectionStats = (electionId: string | undefined) => {
  return useQuery({
    queryKey: ['election-stats', electionId],
    queryFn: async () => {
      if (!electionId) return null;

      const [incidentsRes, stationsRes, observersRes, resultsRes] = await Promise.all([
        supabase.from('election_incidents').select('severity, status, verification_status').eq('election_id', electionId),
        supabase.from('polling_stations').select('id, is_active, setup_verified').eq('election_id', electionId),
        supabase.from('election_observers').select('accreditation_status, deployment_status').eq('election_id', electionId),
        supabase.from('election_results').select('fully_verified, status').eq('election_id', electionId),
      ]);

      const incidents = incidentsRes.data || [];
      const stations = stationsRes.data || [];
      const observers = observersRes.data || [];
      const results = resultsRes.data || [];

      return {
        totalIncidents: incidents.length,
        criticalIncidents: incidents.filter(i => i.severity === 'critical' || i.severity === 'emergency').length,
        pendingVerification: incidents.filter(i => i.verification_status === 'pending').length,
        resolvedIncidents: incidents.filter(i => i.status === 'resolved').length,
        totalStations: stations.length,
        activeStations: stations.filter(s => s.is_active).length,
        verifiedStations: stations.filter(s => s.setup_verified).length,
        totalObservers: observers.length,
        deployedObservers: observers.filter(o => o.deployment_status === 'deployed').length,
        accreditedObservers: observers.filter(o => o.accreditation_status === 'approved').length,
        totalResults: results.length,
        verifiedResults: results.filter(r => r.fully_verified).length,
        contestedResults: results.filter(r => r.status === 'contested').length,
      };
    },
    enabled: !!electionId,
  });
};
