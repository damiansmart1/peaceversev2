import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import type { AppRole, UserRole } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export type { AppRole };

export const useRoleCheck = (role?: AppRole) => {
  const { user, isLoading } = useAuth();
  return useQuery({
    queryKey: ['user-role', role, user?.id],
    queryFn: async () => {
      if (!user) return { hasRole: false, roles: [] };

      // @ts-ignore - Type inference issue with Supabase generated types
      const result: any = await supabase
        .from('user_roles')
        .select('role, is_active, expires_at')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (result.error) {
        console.error('Error fetching user roles:', result.error);
        throw result.error;
      }

      // Filter out expired roles
      const activeRoles = (result.data || [])
        .filter((r: any) => !r.expires_at || new Date(r.expires_at) > new Date())
        .map((r: any) => r.role as AppRole);

      if (role) {
        return { hasRole: activeRoles.includes(role), roles: activeRoles };
      }

      return { hasRole: activeRoles.length > 0, roles: activeRoles };
    },
    enabled: !isLoading && !!user && !user.is_anonymous,
  });
};

export const useHasAnyRole = (roles: AppRole[]) => {
  const { user, isLoading } = useAuth();
  return useQuery({
    queryKey: ['user-has-any-role', roles, user?.id],
    enabled: !isLoading && !!user && !user.is_anonymous,
    queryFn: async () => {
      if (!user) return false;

      // @ts-ignore - Type inference issue with Supabase generated types
      const result: any = await supabase
        .from('user_roles')
        .select('role, is_active, expires_at')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .in('role', roles as any);

      if (result.error) {
        console.error('Error checking roles:', result.error);
        throw result.error;
      }

      // Check for active, non-expired roles
      const hasActiveRole = (result.data || []).some(
        (r: any) => !r.expires_at || new Date(r.expires_at) > new Date()
      );

      return hasActiveRole;
    },
  });
};

export const useUserRoles = () => {
  const { user, isLoading } = useAuth();
  return useQuery({
    queryKey: ['user-all-roles', user?.id],
    enabled: !isLoading && !!user && !user.is_anonymous,
    queryFn: async () => {
      if (!user) return [];

      // @ts-ignore - Type inference issue with Supabase generated types
      const result: any = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (result.error) {
        console.error('Error fetching all user roles:', result.error);
        throw result.error;
      }

      // Filter out expired roles
      return (result.data || []).filter(
        (r: any) => !r.expires_at || new Date(r.expires_at) > new Date()
      );
    },
  });
};
