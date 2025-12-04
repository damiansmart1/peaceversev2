import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { useAuth } from '@/contexts/AuthContext';

export const useUserProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !user.is_anonymous,
  });
};
