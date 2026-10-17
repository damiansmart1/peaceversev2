import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { toast } from 'sonner';

export type MediatorCategory = 'professional' | 'trained_volunteer' | 'community_facilitator';
export type MediatorStatus = 'pending' | 'approved' | 'suspended';
export type MediatorAssignmentStatus =
  | 'proposed' | 'accepted' | 'declined' | 'active' | 'completed' | 'escalated' | 'referred';

export interface Mediator {
  id: string;
  user_id: string;
  full_name: string;
  mediator_category: MediatorCategory;
  organization: string | null;
  bio: string | null;
  specializations: string[];
  languages: string[];
  locations_served: string[];
  credentials: string | null;
  credential_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  availability: string | null;
  preferred_formats: string[];
  max_active_cases: number;
  active_cases: number;
  is_accepting_referrals: boolean;
  code_of_conduct_accepted_at: string | null;
  safeguarding_acknowledged: boolean;
  status: MediatorStatus;
  created_at: string;
  updated_at: string;
}

export interface MediatorAssignment {
  id: string;
  case_id: string;
  mediator_id: string;
  status: MediatorAssignmentStatus;
  proposed_by: string | null;
  suitability_reason: string | null;
  conflict_of_interest_declared: string | null;
  responded_at: string | null;
  escalation_reason: string | null;
  referral_notes: string | null;
  follow_up_notes: string | null;
  created_at: string;
  updated_at: string;
  mediator?: Mediator;
  case?: { id: string; case_ref: string; title: string; status: string };
}

export const MEDIATOR_CATEGORY_LABELS: Record<MediatorCategory, string> = {
  professional: 'Verified professional mediator',
  trained_volunteer: 'Trained volunteer mediator',
  community_facilitator: 'Community dialogue facilitator',
};

export const SPECIALIZATION_OPTIONS = [
  'Land and resource disputes',
  'Intercommunal tensions',
  'Electoral and political disputes',
  'Family and community matters',
  'Business and labour disputes',
  'Online harms and misinformation',
  'Youth and school conflicts',
  'Faith-based reconciliation',
];

export const MEDIATION_FORMATS = [
  'In-person meetings',
  'Virtual / video calls',
  'Phone conversations',
  'Shuttle diplomacy (separate meetings)',
];

const err = (e: any, fallback: string) => {
  console.error(fallback, e);
  toast.error(e?.message ? `${fallback}: ${e.message}` : fallback);
};

export const useMediators = () => {
  return useQuery({
    queryKey: ['mediators'],
    queryFn: async (): Promise<Mediator[]> => {
      const { data, error } = await supabase
        .from('mediators')
        .select('*')
        .order('full_name', { ascending: true });
      if (error) throw error;
      return (data || []) as Mediator[];
    },
  });
};

export const useApprovedMediators = () => {
  const { data, ...rest } = useMediators();
  return { ...rest, data: (data || []).filter((m) => m.status === 'approved') };
};

export const useMyMediatorProfile = () => {
  return useQuery({
    queryKey: ['my-mediator-profile'],
    queryFn: async (): Promise<Mediator | null> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return null;
      const { data, error } = await supabase
        .from('mediators')
        .select('*')
        .eq('user_id', auth.user.id)
        .maybeSingle();
      if (error) throw error;
      return (data as Mediator) || null;
    },
  });
};

export const useRegisterMediator = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Mediator> & { code_of_conduct_accepted: boolean; safeguarding_acknowledged: boolean }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) throw new Error('You must be signed in to register as a mediator');
      if (!payload.code_of_conduct_accepted || !payload.safeguarding_acknowledged) {
        throw new Error('You must accept the code of conduct and safeguarding commitments');
      }
      const { code_of_conduct_accepted, safeguarding_acknowledged, ...rest } = payload;
      const { data, error } = await supabase
        .from('mediators')
        .upsert({
          ...rest,
          user_id: auth.user.id,
          status: 'pending',
          code_of_conduct_accepted_at: new Date().toISOString(),
          safeguarding_acknowledged: true,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mediators'] });
      qc.invalidateQueries({ queryKey: ['my-mediator-profile'] });
      toast.success('Mediator application submitted', {
        description: 'Your profile is pending review. An administrator will verify your credentials.',
      });
    },
    onError: (e) => err(e, 'Could not submit application'),
  });
};

export const useUpdateMediator = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Mediator>) => {
      const { data, error } = await supabase
        .from('mediators')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mediators'] });
      qc.invalidateQueries({ queryKey: ['my-mediator-profile'] });
      toast.success('Mediator profile updated');
    },
    onError: (e) => err(e, 'Could not update mediator'),
  });
};

export const useMyAssignments = () => {
  return useQuery({
    queryKey: ['my-mediator-assignments'],
    queryFn: async (): Promise<MediatorAssignment[]> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return [];
      const { data, error } = await supabase
        .from('mediator_assignments')
        .select(`
          *,
          mediator:mediators!inner(*),
          case:mediation_cases!inner(id, case_ref, title, status)
        `)
        .eq('mediator.user_id', auth.user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as MediatorAssignment[];
    },
  });
};

export const useCaseAssignments = (caseId?: string) => {
  return useQuery({
    queryKey: ['mediator-assignments', caseId],
    enabled: !!caseId,
    queryFn: async (): Promise<MediatorAssignment[]> => {
      const { data, error } = await supabase
        .from('mediator_assignments')
        .select(`
          *,
          mediator:mediators(*),
          case:mediation_cases(id, case_ref, title, status)
        `)
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as MediatorAssignment[];
    },
  });
};

export const useProposeAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      case_id: string;
      mediator_id: string;
      suitability_reason?: string;
      conflict_of_interest_declared?: string;
    }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) throw new Error('Sign in required');
      const { data, error } = await supabase
        .from('mediator_assignments')
        .insert({ ...payload, status: 'proposed', proposed_by: auth.user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mediator-assignments'] });
      toast.success('Mediator invited to the case');
    },
    onError: (e) => err(e, 'Could not invite mediator'),
  });
};

export const useRespondToAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, escalation_reason, referral_notes }: {
      id: string;
      status: MediatorAssignmentStatus;
      escalation_reason?: string;
      referral_notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('mediator_assignments')
        .update({
          status,
          responded_at: new Date().toISOString(),
          ...(escalation_reason ? { escalation_reason } : {}),
          ...(referral_notes ? { referral_notes } : {}),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, variables) => {
      qc.invalidateQueries({ queryKey: ['my-mediator-assignments'] });
      qc.invalidateQueries({ queryKey: ['mediator-assignments'] });
      const messages: Record<string, string> = {
        accepted: 'Assignment accepted',
        declined: 'Assignment declined',
        escalated: 'Case escalated',
        referred: 'Case referred',
        completed: 'Assignment completed',
      };
      toast.success(messages[variables.status] || 'Assignment updated');
    },
    onError: (e) => err(e, 'Could not update assignment'),
  });
};

export const useUpdateAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<MediatorAssignment>) => {
      const { data, error } = await supabase
        .from('mediator_assignments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-mediator-assignments'] });
      qc.invalidateQueries({ queryKey: ['mediator-assignments'] });
      toast.success('Assignment updated');
    },
    onError: (e) => err(e, 'Could not update assignment'),
  });
};

/** Score approved mediators against a case's needs (language, location, expertise, availability). */
export function scoreMediatorFit(
  mediator: Mediator,
  needs: { languages?: string[]; location?: string; conflictType?: string },
): number {
  let score = 0;
  const langs = (needs.languages || []).map((l) => l.toLowerCase());
  if (langs.length && mediator.languages.some((l) => langs.includes(l.toLowerCase()))) score += 30;
  if (needs.location && mediator.locations_served.some(
    (l) => l.toLowerCase().includes(needs.location!.toLowerCase()) || needs.location!.toLowerCase().includes(l.toLowerCase()),
  )) score += 25;
  if (needs.conflictType && mediator.specializations.some(
    (s) => s.toLowerCase().includes(needs.conflictType!.toLowerCase().split('_')[0]),
  )) score += 25;
  if (mediator.is_accepting_referrals && mediator.active_cases < mediator.max_active_cases) score += 10;
  if (mediator.credential_verified) score += 10;
  if (mediator.preferred_formats?.length) score += 5;
  return score;
}
