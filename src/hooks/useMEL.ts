import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { toast } from 'sonner';

export type MelPlan = 'free' | 'starter' | 'professional' | 'enterprise';

export interface MelOrganization {
  id: string;
  name: string;
  slug: string;
  org_type: string;
  country_code: string | null;
  contact_email: string | null;
  plan: MelPlan;
  billing_status: string;
  trial_ends_at: string | null;
  seat_limit: number;
  project_limit: number;
  submission_limit: number;
  created_by: string;
  created_at: string;
}

export const PLAN_CATALOG: Record<MelPlan, {
  label: string; price: string; cadence: string; blurb: string;
  seats: number; projects: number; submissions: number; features: string[];
}> = {
  free: {
    label: 'Community', price: '$0', cadence: '30-day trial',
    blurb: 'Test the full workflow on one pilot project.',
    seats: 3, projects: 1, submissions: 500,
    features: ['1 project', '3 seats', '500 submissions', 'Offline data collection', 'Basic dashboards'],
  },
  starter: {
    label: 'Starter', price: '$79', cadence: 'per month',
    blurb: 'For small CSOs running a handful of grants.',
    seats: 10, projects: 5, submissions: 5000,
    features: ['5 projects', '10 seats', '5,000 submissions/mo', 'Baseline → endline tracking', 'CSV & PDF exports', 'SMS/USSD intake'],
  },
  professional: {
    label: 'Professional', price: '$299', cadence: 'per month',
    blurb: 'For national NGOs with multi-donor portfolios.',
    seats: 40, projects: 25, submissions: 50000,
    features: ['25 projects', '40 seats', '50,000 submissions/mo', 'AI narrative reports (NuruAI)', 'Donor-ready dashboards', 'API access & webhooks', 'Mediation Suite included'],
  },
  enterprise: {
    label: 'Enterprise', price: 'Custom', cadence: 'annual licence',
    blurb: 'For donors, governments and consortium leads.',
    seats: 999, projects: 999, submissions: 1000000,
    features: ['Unlimited projects & seats', 'Multi-country consortium view', 'Data residency & SSO', 'MEL specialist framework design', 'Dedicated support & training', 'White-label deployment'],
  },
};

const err = (e: any, fallback: string) => {
  console.error(fallback, e);
  toast.error(e?.message ? `${fallback}: ${e.message}` : fallback);
};

export const useMyOrganizations = () => useQuery({
  queryKey: ['mel-organizations'],
  queryFn: async (): Promise<MelOrganization[]> => {
    const { data, error } = await supabase
      .from('mel_organizations').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
});

export const useCreateOrganization = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; org_type: string; country_code?: string; contact_email?: string; plan?: MelPlan }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) throw new Error('Sign in required');
      const slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        + '-' + Math.random().toString(36).slice(2, 6);
      const { data, error } = await supabase.from('mel_organizations')
        .insert({ ...payload, slug, created_by: auth.user.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mel-organizations'] });
      toast.success('Workspace created — 30-day trial started');
    },
    onError: (e) => err(e, 'Could not create workspace'),
  });
};

export const useUpdateOrganization = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<MelOrganization>) => {
      const { data, error } = await supabase.from('mel_organizations').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mel-organizations'] });
      toast.success('Workspace updated');
    },
    onError: (e) => err(e, 'Could not update workspace'),
  });
};

/* ---- Projects ---- */
export const useMelProjects = (orgId?: string) => useQuery({
  queryKey: ['mel-projects', orgId],
  enabled: !!orgId,
  queryFn: async (): Promise<any[]> => {
    const { data, error } = await supabase.from('mel_projects').select('*')
      .eq('org_id', orgId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
});

export const useCreateProject = (orgId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const { data, error } = await supabase.from('mel_projects')
        .insert({ ...payload, org_id: orgId }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mel-projects', orgId] });
      toast.success('Project created');
    },
    onError: (e) => err(e, 'Could not create project'),
  });
};

export const useUpdateProject = (orgId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Record<string, any>) => {
      const { data, error } = await supabase.from('mel_projects').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mel-projects', orgId] });
      toast.success('Project updated');
    },
    onError: (e) => err(e, 'Could not update project'),
  });
};

/* ---- Indicators ---- */
export const useMelIndicators = (orgId?: string, projectId?: string) => useQuery({
  queryKey: ['mel-indicators', orgId, projectId],
  enabled: !!orgId,
  queryFn: async (): Promise<any[]> => {
    let q = supabase.from('mel_indicators').select('*').eq('org_id', orgId);
    if (projectId) q = q.eq('project_id', projectId);
    const { data, error } = await q.order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },
});

export const useCreateIndicator = (orgId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const { data, error } = await supabase.from('mel_indicators')
        .insert({ ...payload, org_id: orgId }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mel-indicators'] });
      toast.success('Indicator added');
    },
    onError: (e) => err(e, 'Could not add indicator'),
  });
};

export const useRecordMeasurement = (orgId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { indicator_id: string; period_label: string; measured_value: number; phase?: string; notes?: string }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) throw new Error('Sign in required');
      const { data, error } = await supabase.from('mel_indicator_measurements')
        .insert({ ...payload, org_id: orgId, recorded_by: auth.user.id }).select().single();
      if (error) throw error;
      await supabase.from('mel_indicators')
        .update({ current_value: payload.measured_value }).eq('id', payload.indicator_id);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mel-indicators'] });
      qc.invalidateQueries({ queryKey: ['mel-measurements'] });
      toast.success('Measurement recorded');
    },
    onError: (e) => err(e, 'Could not record measurement'),
  });
};

export const useMeasurements = (orgId?: string) => useQuery({
  queryKey: ['mel-measurements', orgId],
  enabled: !!orgId,
  queryFn: async (): Promise<any[]> => {
    const { data, error } = await supabase.from('mel_indicator_measurements')
      .select('*').eq('org_id', orgId).order('measured_on', { ascending: true });
    if (error) throw error;
    return data || [];
  },
});

/* ---- Forms & submissions ---- */
export const useMelForms = (orgId?: string) => useQuery({
  queryKey: ['mel-forms', orgId],
  enabled: !!orgId,
  queryFn: async (): Promise<any[]> => {
    const { data, error } = await supabase.from('mel_forms').select('*')
      .eq('org_id', orgId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
});

export const useCreateForm = (orgId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const { data, error } = await supabase.from('mel_forms')
        .insert({ ...payload, org_id: orgId }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mel-forms', orgId] });
      toast.success('Form published');
    },
    onError: (e) => err(e, 'Could not publish form'),
  });
};

export const useMelSubmissions = (orgId?: string) => useQuery({
  queryKey: ['mel-submissions', orgId],
  enabled: !!orgId,
  queryFn: async (): Promise<any[]> => {
    const { data, error } = await supabase.from('mel_submissions').select('*')
      .eq('org_id', orgId).order('created_at', { ascending: false }).limit(500);
    if (error) throw error;
    return data || [];
  },
});

export const useUpdateSubmission = (orgId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Record<string, any>) => {
      const { data, error } = await supabase.from('mel_submissions').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mel-submissions', orgId] });
      toast.success('Submission updated');
    },
    onError: (e) => err(e, 'Could not update submission'),
  });
};

/* ---- Public form (community submission) ---- */
export const usePublicForm = (token?: string) => useQuery({
  queryKey: ['mel-public-form', token],
  enabled: !!token,
  queryFn: async (): Promise<any | null> => {
    const { data, error } = await supabase.from('mel_forms').select('*')
      .eq('public_token', token).eq('is_public', true).eq('is_active', true).maybeSingle();
    if (error) throw error;
    return data;
  },
});
