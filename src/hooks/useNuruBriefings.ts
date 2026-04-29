import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const sb = supabase as any;

export interface NuruBriefing {
  id: string;
  user_id: string;
  title: string;
  topics: string[];
  countries: string[];
  document_ids: string[];
  frequency: 'daily' | 'weekly' | 'monthly';
  is_active: boolean;
  last_generated_at: string | null;
  created_at: string;
}

export interface NuruBriefingDigest {
  id: string;
  briefing_id: string;
  user_id: string;
  content: string;
  summary: string | null;
  source_documents: any[];
  generated_at: string;
  read_at: string | null;
}

export function useBriefings() {
  return useQuery({
    queryKey: ['nuru-briefings'],
    queryFn: async () => {
      const { data, error } = await sb
        .from('nuru_briefings')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as NuruBriefing[];
    },
  });
}

export function useBriefingDigests(briefingId?: string) {
  return useQuery({
    queryKey: ['nuru-briefing-digests', briefingId || 'all'],
    queryFn: async () => {
      let q = sb.from('nuru_briefing_digests').select('*').order('generated_at', { ascending: false }).limit(20);
      if (briefingId) q = q.eq('briefing_id', briefingId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as NuruBriefingDigest[];
    },
  });
}

export function useCreateBriefing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      topics?: string[];
      countries?: string[];
      document_ids?: string[];
      frequency?: 'daily' | 'weekly' | 'monthly';
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sign in to create briefings');
      const { data, error } = await sb
        .from('nuru_briefings')
        .insert({
          user_id: user.id,
          title: input.title,
          topics: input.topics || [],
          countries: input.countries || [],
          document_ids: input.document_ids || [],
          frequency: input.frequency || 'weekly',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nuru-briefings'] });
      toast.success('Briefing created');
    },
    onError: (e: any) => toast.error(e.message || 'Could not create briefing'),
  });
}

export function useDeleteBriefing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from('nuru_briefings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nuru-briefings'] });
      toast.success('Briefing deleted');
    },
    onError: (e: any) => toast.error(e.message || 'Delete failed'),
  });
}

export function useGenerateDigest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (briefingId: string) => {
      const { data, error } = await supabase.functions.invoke('nuru-ai-briefing', {
        body: { briefingId },
      });
      if (error) {
        let msg = error.message || 'Generation failed';
        try {
          if (error.context && typeof error.context.json === 'function') {
            const parsed = await error.context.json();
            if (parsed?.error) msg = parsed.error;
          }
        } catch {}
        throw new Error(msg);
      }
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_data, briefingId) => {
      qc.invalidateQueries({ queryKey: ['nuru-briefings'] });
      qc.invalidateQueries({ queryKey: ['nuru-briefing-digests', briefingId] });
      qc.invalidateQueries({ queryKey: ['nuru-briefing-digests', 'all'] });
      toast.success('Digest generated');
    },
    onError: (e: any) => toast.error(e.message || 'Could not generate digest'),
  });
}

export function useMarkDigestRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (digestId: string) => {
      const { error } = await sb
        .from('nuru_briefing_digests')
        .update({ read_at: new Date().toISOString() })
        .eq('id', digestId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nuru-briefing-digests', 'all'] });
    },
  });
}
