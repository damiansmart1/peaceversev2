import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AppRole, UserRole } from '@/types/database';

export type { AppRole };

export const useRoleCheck = (role?: AppRole) => {
  return useQuery({
    queryKey: ['user-role', role],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { hasRole: false, roles: [] };

      // @ts-ignore - Type inference issue with Supabase generated types
      const result: any = await supabase
        .from('user_roles')
        .select('role, is_active, expires_at')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (result.error) {
        console.error('Error fetching user roles:', result.error);
        return { hasRole: false, roles: [] };
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
    enabled: !!role || true,
  });
};

export const useHasAnyRole = (roles: AppRole[]) => {
  return useQuery({
    queryKey: ['user-has-any-role', roles],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
        return false;
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
  return useQuery({
    queryKey: ['user-all-roles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
        return [];
      }

      // Filter out expired roles
      return (result.data || []).filter(
        (r: any) => !r.expires_at || new Date(r.expires_at) > new Date()
      );
    },
  });
};
