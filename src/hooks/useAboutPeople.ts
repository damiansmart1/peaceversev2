import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';
export type AboutPerson = Database['public']['Tables']['about_people']['Row'];
export function useAboutPeople(admin = false) {
  const { user, isLoading } = useAuth();
  const client = useQueryClient();
  useEffect(() => {
    const channel = supabase.channel(`about-people-${admin}`).on('postgres_changes', { event: '*', schema: 'public', table: 'about_people' }, () => client.invalidateQueries({queryKey:['about-people']})).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [admin, client]);
  return useQuery({
    queryKey: ['about-people', admin, user?.id], enabled: !isLoading,
    queryFn: async () => {
      let q = supabase.from('about_people').select('*').order('display_order').order('created_at');
      if (!admin) q = q.eq('is_published', true);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}
export function usePortrait(path: string | null) {
  return useQuery({queryKey:['about-portrait',path], enabled:!!path, staleTime: 10 * 60 * 1000, queryFn: async () => {
    if (!path) return null;
    const {data,error} = await supabase.storage.from('about-portraits').createSignedUrl(path, 1200);
    if (error) throw error;
    return data.signedUrl;
  }});
}
