import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminCheck = () => {
  const { user, isLoading } = useAuth();
  return useQuery({
    queryKey: ['is-admin', user?.id],
    enabled: !isLoading && !!user && !user.is_anonymous,
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role, expires_at')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return !!data && (!data.expires_at || new Date(data.expires_at) > new Date());
    },
  });
};
