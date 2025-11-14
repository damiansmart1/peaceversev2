import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'citizen' | 'verifier' | 'partner' | 'government' | 'admin' | 'moderator';

export const useRoleCheck = (role?: AppRole) => {
  return useQuery({
    queryKey: ['user-role', role],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { hasRole: false, roles: [] };

      const { data, error } = await supabase
        .from('user_roles')
        .select('role, is_active, expires_at')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching user roles:', error);
        return { hasRole: false, roles: [] };
      }

      // Filter out expired roles
      const activeRoles = (data || [])
        .filter(r => !r.expires_at || new Date(r.expires_at) > new Date())
        .map(r => r.role as AppRole);

      if (role) {
        return { hasRole: activeRoles.includes(role), roles: activeRoles };
      }

      return { hasRole: activeRoles.length > 0, roles: activeRoles };
    },
    enabled: !!role || true,
  });
};

export const useHasAnyRole = (roles: AppRole[]) => {
  return useQuery({
    queryKey: ['user-has-any-role', roles],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role, is_active, expires_at')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .in('role', roles);

      if (error) {
        console.error('Error checking roles:', error);
        return false;
      }

      // Check for active, non-expired roles
      const hasActiveRole = (data || []).some(
        r => !r.expires_at || new Date(r.expires_at) > new Date()
      );

      return hasActiveRole;
    },
  });
};

export const useUserRoles = () => {
  return useQuery({
    queryKey: ['user-all-roles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all user roles:', error);
        return [];
      }

      // Filter out expired roles
      return (data || []).filter(
        r => !r.expires_at || new Date(r.expires_at) > new Date()
      );
    },
  });
};
