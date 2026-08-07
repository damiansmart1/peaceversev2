import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { toast } from 'sonner';

export type MediationCaseStatus =
  | 'intake' | 'assessment' | 'party_onboarding' | 'dialogue' | 'negotiation'
  | 'drafting' | 'agreement_reached' | 'implementation' | 'monitoring'
  | 'closed' | 'suspended' | 'failed';

export interface MediationCase {
  id: string;
  case_ref: string;
  title: string;
  summary: string | null;
  conflict_type: string | null;
  status: MediationCaseStatus;
  confidentiality: 'public' | 'restricted' | 'confidential';
  is_public: boolean;
  organization: string | null;
  country_code: string | null;
  region: string | null;
  location_name: string | null;
  affected_population: number | null;
  started_at: string | null;
  target_resolution_date: string | null;
  closed_at: string | null;
  progress_percent: number;
  trust_index: number | null;
  tags: string[] | null;
  created_by: string;
  created_at: string;
}

const err = (e: any, fallback: string) => {
  console.error(fallback, e);
  toast.error(e?.message ? `${fallback}: ${e.message}` : fallback);
};

/* ---------------- Cases ---------------- */

export const useMediationCases = () => {
  return useQuery({
    queryKey: ['mediation-cases'],
    queryFn: async (): Promise<MediationCase[]> => {
      const { data, error } = await supabase
        .from('mediation_cases')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
};

export const useMediationCase = (caseId?: string) => {
  return useQuery({
    queryKey: ['mediation-case', caseId],
    enabled: !!caseId,
    queryFn: async (): Promise<MediationCase | null> => {
      const { data, error } = await supabase
        .from('mediation_cases').select('*').eq('id', caseId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateMediationCase = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<MediationCase>) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) throw new Error('You must be signed in to open a case');
      const ref = `MED-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      const { data, error } = await supabase
        .from('mediation_cases')
        .insert({ ...payload, case_ref: ref, created_by: auth.user.id })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mediation-cases'] });
      toast.success('Mediation case opened');
    },
    onError: (e) => err(e, 'Could not open case'),
  });
};

export const useUpdateMediationCase = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<MediationCase>) => {
      const { data, error } = await supabase
        .from('mediation_cases').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (d: any) => {
      qc.invalidateQueries({ queryKey: ['mediation-cases'] });
      qc.invalidateQueries({ queryKey: ['mediation-case', d?.id] });
      toast.success('Case updated');
    },
    onError: (e) => err(e, 'Could not update case'),
  });
};

/* ---------------- Generic child-table helpers ---------------- */

const useCaseChildren = (table: string, caseId?: string, orderBy = 'created_at', asc = false) =>
  useQuery({
    queryKey: [table, caseId],
    enabled: !!caseId,
    queryFn: async (): Promise<any[]> => {
      const { data, error } = await supabase
        .from(table).select('*').eq('case_id', caseId).order(orderBy, { ascending: asc });
      if (error) throw error;
      return data || [];
    },
  });

const useInsertChild = (table: string, caseId: string | undefined, label: string, extraInvalidate: string[] = []) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const { data, error } = await supabase
        .from(table).insert({ ...payload, case_id: caseId }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table, caseId] });
      extraInvalidate.forEach((k) => qc.invalidateQueries({ queryKey: [k, caseId] }));
      toast.success(`${label} added`);
    },
    onError: (e) => err(e, `Could not add ${label.toLowerCase()}`),
  });
};

const useUpdateChild = (table: string, caseId: string | undefined, label: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Record<string, any>) => {
      const { data, error } = await supabase.from(table).update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table, caseId] });
      toast.success(`${label} updated`);
    },
    onError: (e) => err(e, `Could not update ${label.toLowerCase()}`),
  });
};

const useDeleteChild = (table: string, caseId: string | undefined, label: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table, caseId] });
      toast.success(`${label} removed`);
    },
    onError: (e) => err(e, `Could not remove ${label.toLowerCase()}`),
  });
};

/* ---------------- Domain hooks ---------------- */

export const useMediationParties = (caseId?: string) => useCaseChildren('mediation_parties', caseId, 'created_at', true);
export const useAddParty = (caseId?: string) => useInsertChild('mediation_parties', caseId, 'Party');
export const useUpdateParty = (caseId?: string) => useUpdateChild('mediation_parties', caseId, 'Party');
export const useDeleteParty = (caseId?: string) => useDeleteChild('mediation_parties', caseId, 'Party');

export const useMediationSessions = (caseId?: string) => useCaseChildren('mediation_sessions', caseId, 'scheduled_at', true);
export const useAddSession = (caseId?: string) => useInsertChild('mediation_sessions', caseId, 'Session');
export const useUpdateSession = (caseId?: string) => useUpdateChild('mediation_sessions', caseId, 'Session');

export const useMediationDialogue = (caseId?: string) => useCaseChildren('mediation_dialogue_entries', caseId, 'created_at', true);
export const useAddDialogueEntry = (caseId?: string) => useInsertChild('mediation_dialogue_entries', caseId, 'Contribution');

export const useMediationAgreements = (caseId?: string) => useCaseChildren('mediation_agreements', caseId, 'created_at', true);
export const useAddAgreement = (caseId?: string) => useInsertChild('mediation_agreements', caseId, 'Agreement');
export const useUpdateAgreement = (caseId?: string) => useUpdateChild('mediation_agreements', caseId, 'Agreement');

export const useMediationClauses = (caseId?: string) => useCaseChildren('mediation_agreement_clauses', caseId, 'created_at', true);
export const useAddClause = (caseId?: string) => useInsertChild('mediation_agreement_clauses', caseId, 'Commitment');
export const useUpdateClause = (caseId?: string) => useUpdateChild('mediation_agreement_clauses', caseId, 'Commitment');

export const useMediationMilestones = (caseId?: string) => useCaseChildren('mediation_milestones', caseId, 'order_index', true);
export const useAddMilestone = (caseId?: string) => useInsertChild('mediation_milestones', caseId, 'Milestone');
export const useUpdateMilestone = (caseId?: string) => useUpdateChild('mediation_milestones', caseId, 'Milestone');

export const useMediationDocuments = (caseId?: string) => useCaseChildren('mediation_documents', caseId, 'created_at', false);
export const useAddDocument = (caseId?: string) => useInsertChild('mediation_documents', caseId, 'Document');

export const useCaseMembers = (caseId?: string) => useCaseChildren('mediation_case_members', caseId, 'created_at', true);
export const useAddCaseMember = (caseId?: string) => useInsertChild('mediation_case_members', caseId, 'Member');

export const useSignAgreement = (caseId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { agreement_id: string; party_id: string | null; signatory_name: string; signatory_title?: string; notes?: string }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) throw new Error('Sign in required');
      const { data, error } = await supabase.from('mediation_signatures')
        .insert({ ...payload, case_id: caseId, signed_by: auth.user.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mediation_signatures', caseId] });
      toast.success('Signature recorded');
    },
    onError: (e) => err(e, 'Could not record signature'),
  });
};

export const useMediationSignatures = (caseId?: string) => useCaseChildren('mediation_signatures', caseId, 'signed_at', true);
