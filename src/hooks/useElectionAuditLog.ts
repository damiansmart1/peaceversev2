import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AuditLogEntry {
  id: string;
  election_id: string | null;
  entity_type: string;
  entity_id: string | null;
  action_type: string;
  action_details: Record<string, any>;
  performed_by: string | null;
  performed_at: string | null;
  log_hash: string | null;
  previous_log_hash: string | null;
}

export const useElectionAuditLog = (electionId?: string) => {
  return useQuery({
    queryKey: ['election-audit-log', electionId],
    queryFn: async () => {
      let query = supabase
        .from('election_audit_log')
        .select('*')
        .order('performed_at', { ascending: false })
        .limit(200);

      if (electionId) {
        query = query.eq('election_id', electionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AuditLogEntry[];
    },
  });
};

export const useObserverAccreditation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, accreditation_status, deployment_status }: {
      id: string;
      accreditation_status?: string;
      deployment_status?: string;
    }) => {
      const updates: Record<string, any> = {};
      if (accreditation_status) updates.accreditation_status = accreditation_status;
      if (deployment_status) updates.deployment_status = deployment_status;

      const { data, error } = await supabase
        .from('election_observers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['election-observers'] });
      toast({ title: 'Observer updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to update observer', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateIncidentCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; description?: string; is_active?: boolean; display_order?: number; severity_default?: 'minor' | 'moderate' | 'serious' | 'critical' | 'emergency'; sub_categories?: string[] }) => {
      const { data, error } = await supabase
        .from('election_incident_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['election-incident-categories'] });
      toast({ title: 'Category updated' });
    },
    onError: (error: any) => {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    },
  });
};

export const useCreateIncidentCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (category: { name: string; description?: string; severity_default?: string; sub_categories?: string[]; display_order?: number }) => {
      const { data, error } = await supabase
        .from('election_incident_categories')
        .insert(category as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['election-incident-categories'] });
      toast({ title: 'Category created' });
    },
    onError: (error: any) => {
      toast({ title: 'Creation failed', description: error.message, variant: 'destructive' });
    },
  });
};
