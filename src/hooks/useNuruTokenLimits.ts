import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const sb = supabase as any;

export interface TokenLimit {
  id: string;
  name: string;
  scope: 'role' | 'user' | 'global';
  target_role: string | null;
  target_user_id: string | null;
  daily_token_limit: number;
  monthly_token_limit: number;
  max_tokens_per_request: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TokenUsageSummary {
  user_id: string;
  total_tokens: number;
  request_count: number;
}

export const useTokenLimits = () => {
  return useQuery({
    queryKey: ['nuru-token-limits'],
    queryFn: async () => {
      const { data, error } = await sb
        .from('nuru_token_limits')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as TokenLimit[];
    },
  });
};

export const useTokenUsageStats = () => {
  return useQuery({
    queryKey: ['nuru-token-usage-stats'],
    queryFn: async () => {
      const { data, error } = await sb
        .from('nuru_token_usage')
        .select('user_id, tokens_used, created_at');
      if (error) throw error;

      // Aggregate by user
      const byUser: Record<string, { total: number; count: number }> = {};
      (data || []).forEach((row: any) => {
        if (!byUser[row.user_id]) byUser[row.user_id] = { total: 0, count: 0 };
        byUser[row.user_id].total += row.tokens_used;
        byUser[row.user_id].count += 1;
      });

      return {
        totalTokensUsed: (data || []).reduce((s: number, r: any) => s + r.tokens_used, 0),
        totalRequests: data?.length || 0,
        byUser,
      };
    },
  });
};

export const useCreateTokenLimit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (limit: Omit<TokenLimit, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data: { user } } = await sb.auth.getUser();
      const { error } = await sb.from('nuru_token_limits').insert({
        ...limit,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nuru-token-limits'] });
      toast.success('Token limit created');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpdateTokenLimit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TokenLimit> & { id: string }) => {
      const { error } = await sb
        .from('nuru_token_limits')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nuru-token-limits'] });
      toast.success('Token limit updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteTokenLimit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from('nuru_token_limits').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nuru-token-limits'] });
      toast.success('Token limit removed');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
