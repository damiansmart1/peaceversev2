import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { toast } from 'sonner';

// ============= Arguments / Deliberation =============
export const useProposalArguments = (proposalId: string) => {
  return useQuery({
    queryKey: ['proposal-arguments', proposalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_arguments' as any)
        .select('*')
        .eq('proposal_id', proposalId)
        .order('upvotes', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!proposalId,
  });
};

export const useSubmitArgument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      proposalId: string;
      stance: 'for' | 'against' | 'neutral';
      title: string;
      body: string;
      evidenceUrls?: string[];
      anonymous?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sign in required');
      const { data, error } = await supabase.from('proposal_arguments' as any).insert({
        proposal_id: args.proposalId,
        user_id: user.id,
        stance: args.stance,
        title: args.title,
        body: args.body,
        evidence_urls: args.evidenceUrls || [],
        display_anonymous: args.anonymous || false,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['proposal-arguments', vars.proposalId] });
      toast.success('Argument published');
    },
    onError: (e: any) => toast.error(e.message),
  });
};

// ============= Advanced Voting =============
export const useCastAdvancedVote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      proposalId: string;
      method: 'ranked_choice' | 'quadratic' | 'approval' | 'weighted';
      ranked?: string[];
      quadratic?: Record<string, number>;
      approval?: string[];
      region?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sign in required');
      const payload = JSON.stringify({ ...args, user: user.id, ts: Date.now() });
      const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
      const vote_hash = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');

      const { data, error } = await supabase.from('proposal_advanced_votes' as any).upsert({
        proposal_id: args.proposalId,
        user_id: user.id,
        voting_method: args.method,
        ranked_choices: args.ranked ? { order: args.ranked } : null,
        quadratic_allocation: args.quadratic || null,
        approval_selections: args.approval || null,
        region: args.region,
        vote_hash,
      }, { onConflict: 'proposal_id,user_id' }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['advanced-votes', vars.proposalId] });
      toast.success('Vote recorded with cryptographic integrity');
    },
    onError: (e: any) => toast.error(e.message),
  });
};

export const useAdvancedVotes = (proposalId: string) => {
  return useQuery({
    queryKey: ['advanced-votes', proposalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_advanced_votes' as any)
        .select('*')
        .eq('proposal_id', proposalId);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!proposalId,
  });
};

// ============= Government Response =============
export const useProposalResponses = (proposalId: string) => {
  return useQuery({
    queryKey: ['proposal-responses', proposalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_responses' as any)
        .select('*')
        .eq('proposal_id', proposalId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!proposalId,
  });
};

export const useSubmitResponse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      proposalId: string;
      status: string;
      responseText: string;
      actionPlan?: string;
      organization?: string;
      role: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sign in required');
      const { data, error } = await supabase.from('proposal_responses' as any).insert({
        proposal_id: args.proposalId,
        responder_id: user.id,
        responder_role: args.role,
        responder_organization: args.organization,
        status: args.status,
        response_text: args.responseText,
        action_plan: args.actionPlan,
      }).select().single();
      if (error) throw error;
      await supabase.from('proposals').update({
        response_status: args.status,
        official_response: args.responseText,
        official_response_at: new Date().toISOString(),
        official_responder_id: user.id,
      } as any).eq('id', args.proposalId);
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['proposal-responses', vars.proposalId] });
      qc.invalidateQueries({ queryKey: ['proposal'] });
      toast.success('Official response published');
    },
    onError: (e: any) => toast.error(e.message),
  });
};

// ============= Citizen Assemblies =============
export const useAssemblies = (proposalId?: string) => {
  return useQuery({
    queryKey: ['assemblies', proposalId],
    queryFn: async () => {
      let q = supabase.from('citizen_assemblies' as any).select('*').order('scheduled_start', { ascending: true });
      if (proposalId) q = q.eq('proposal_id', proposalId);
      const { data, error } = await q;
      if (error) throw error;
      return data as any[];
    },
  });
};

export const useRegisterForAssembly = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (assemblyId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sign in required');
      const { data, error } = await supabase.from('assembly_participants' as any).insert({
        assembly_id: assemblyId,
        user_id: user.id,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assemblies'] });
      toast.success('Registered — you may be selected by lottery');
    },
    onError: (e: any) => toast.error(e.message),
  });
};

// ============= Sponsorships =============
export const useSponsorships = (proposalId: string) => {
  return useQuery({
    queryKey: ['sponsorships', proposalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_sponsorships' as any)
        .select('*')
        .eq('proposal_id', proposalId)
        .eq('is_active', true);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!proposalId,
  });
};

// ============= Audit Log =============
export const useAuditLog = (proposalId: string) => {
  return useQuery({
    queryKey: ['audit-log', proposalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_audit_log' as any)
        .select('*')
        .eq('proposal_id', proposalId)
        .order('block_number', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!proposalId,
  });
};
