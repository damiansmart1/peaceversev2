import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const sb = supabase as any;

export function useConstitutions() {
  return useQuery({
    queryKey: ['country-constitutions'],
    queryFn: async () => {
      const { data, error } = await sb
        .from('country_constitutions')
        .select('*')
        .eq('is_active', true)
        .order('country_name');
      if (error) throw error;
      return data || [];
    },
  });
}

export function useConstitutionByCountry(countryName: string | null) {
  return useQuery({
    queryKey: ['constitution', countryName],
    queryFn: async () => {
      if (!countryName) return null;
      const { data, error } = await sb
        .from('country_constitutions')
        .select('*')
        .eq('country_name', countryName)
        .eq('is_active', true)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },
    enabled: !!countryName,
  });
}

export function useUploadConstitution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      country_name: string;
      country_code?: string;
      constitution_title: string;
      original_text: string;
      language?: string;
      effective_date?: string;
      amendment_date?: string;
      source_url?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await sb.from('country_constitutions').insert({
        ...input,
        uploaded_by: user.id,
        processing_status: 'pending',
      }).select().single();
      if (error) throw error;

      // Trigger AI processing
      const { error: procError } = await supabase.functions.invoke('nuru-ai-chat', {
        body: { action: 'process_constitution', constitutionId: data.id },
      });
      if (procError) {
        try {
          const body = typeof procError.context?.json === 'function' ? await procError.context.json() : null;
          console.error('Constitution processing trigger failed:', body?.error || procError.message);
        } catch { console.error('Constitution processing trigger failed:', procError); }
      }

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['country-constitutions'] });
      toast.success('Constitution uploaded successfully');
    },
    onError: (e: any) => {
      if (e.message?.includes('duplicate')) {
        toast.error('A constitution for this country already exists');
      } else {
        toast.error(e.message || 'Upload failed');
      }
    },
  });
}

export function useDeleteConstitution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from('country_constitutions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['country-constitutions'] });
      toast.success('Constitution deleted');
    },
    onError: (e: any) => toast.error(e.message || 'Delete failed'),
  });
}

export function useProcessConstitution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.functions.invoke('nuru-ai-chat', {
        body: { action: 'process_constitution', constitutionId: id },
      });
      if (error) {
        let msg = 'Processing failed';
        try {
          const body = typeof error.context?.json === 'function' ? await error.context.json() : null;
          if (body?.error) msg = body.error;
        } catch {}
        throw new Error(msg);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['country-constitutions'] });
      toast.success('Constitution processing started');
    },
    onError: (e: any) => toast.error(e.message || 'Processing failed'),
  });
}
