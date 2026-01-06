import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from '@/hooks/useRoleCheck';

// Define all available platform features with descriptions
export const PLATFORM_FEATURES = [
  { key: 'incidents', label: 'Incident Reporting', description: 'Report and track incidents', path: '/incidents' },
  { key: 'community', label: 'Community Hub', description: 'Community forums and discussions', path: '/community' },
  { key: 'peace-pulse', label: 'Peace Pulse', description: 'Peace metrics and analytics', path: '/peace-pulse' },
  { key: 'proposals', label: 'Polls & Proposals', description: 'Community proposals and voting', path: '/proposals' },
  { key: 'safety', label: 'Safety Portal', description: 'Safety resources and emergency contacts', path: '/safety' },
  { key: 'radio', label: 'Peace Radio', description: 'Community radio broadcasts', path: '/radio' },
  { key: 'challenges', label: 'Challenges', description: 'Peacebuilding challenges and rewards', path: '/challenges' },
  { key: 'voice', label: 'Voice Stories', description: 'Share and listen to stories', path: '/voice' },
  { key: 'verification', label: 'Verification', description: 'Verify reports and content', path: '/verification' },
  { key: 'integrations', label: 'Integrations', description: 'API and system integrations', path: '/integrations' },
  { key: 'early-warning', label: 'Early Warning', description: 'Early warning system dashboard', path: '/dashboard/early-warning' },
] as const;

export type FeatureKey = typeof PLATFORM_FEATURES[number]['key'];
export type RoleType = 'citizen' | 'verifier' | 'partner' | 'government' | 'admin';

interface RoleFeatureAccess {
  id: string;
  role: RoleType;
  feature_key: string;
  is_enabled: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

// Hook to get all role feature access settings
export const useAllRoleFeatureAccess = () => {
  return useQuery({
    queryKey: ['role-feature-access'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_feature_access')
        .select('*')
        .order('role', { ascending: true });

      if (error) throw error;
      return data as RoleFeatureAccess[];
    },
  });
};

// Hook to get feature access for a specific role
export const useRoleFeatures = (role: RoleType | null) => {
  return useQuery({
    queryKey: ['role-feature-access', role],
    queryFn: async () => {
      if (!role) return [];

      const { data, error } = await supabase
        .from('role_feature_access')
        .select('*')
        .eq('role', role);

      if (error) throw error;
      return data as RoleFeatureAccess[];
    },
    enabled: !!role,
  });
};

// Hook to check if current user has access to a specific feature based on their role
export const useHasRoleFeatureAccess = (featureKey: FeatureKey) => {
  const { data: userRoles, isLoading: rolesLoading } = useUserRoles();
  const roles = userRoles?.map((r: any) => r.role as RoleType) || [];
  
  // Get the highest priority role
  const priorityOrder: RoleType[] = ['admin', 'government', 'partner', 'verifier', 'citizen'];
  const userRole = priorityOrder.find(r => roles.includes(r)) || 'citizen';
  
  const { data: roleFeatures, isLoading: featuresLoading } = useRoleFeatures(userRole);

  if (rolesLoading || featuresLoading) {
    return { hasAccess: true, isLoading: true }; // Default to true while loading
  }

  // Admin always has access to everything
  if (roles.includes('admin')) {
    return { hasAccess: true, isLoading: false };
  }

  // If no features configured, default to enabled
  if (!roleFeatures || roleFeatures.length === 0) {
    return { hasAccess: true, isLoading: false };
  }

  const feature = roleFeatures.find(f => f.feature_key === featureKey);
  return { 
    hasAccess: feature ? feature.is_enabled : true, 
    isLoading: false 
  };
};

// Hook to get all accessible features for current user based on their role
export const useAccessibleFeatures = () => {
  const { data: userRoles, isLoading: rolesLoading } = useUserRoles();
  const roles = userRoles?.map((r: any) => r.role as RoleType) || [];
  
  // Get the highest priority role
  const priorityOrder: RoleType[] = ['admin', 'government', 'partner', 'verifier', 'citizen'];
  const userRole = priorityOrder.find(r => roles.includes(r)) || 'citizen';
  
  const { data: roleFeatures, isLoading: featuresLoading } = useRoleFeatures(userRole);

  // Admin has access to all features
  if (roles.includes('admin')) {
    return {
      features: PLATFORM_FEATURES.map(f => f.key),
      isLoading: rolesLoading || featuresLoading,
      userRole,
    };
  }

  // If no features configured, return all features
  if (!roleFeatures || roleFeatures.length === 0) {
    return {
      features: PLATFORM_FEATURES.map(f => f.key),
      isLoading: rolesLoading || featuresLoading,
      userRole,
    };
  }

  const enabledFeatures = roleFeatures
    .filter(f => f.is_enabled)
    .map(f => f.feature_key);

  return {
    features: enabledFeatures,
    isLoading: rolesLoading || featuresLoading,
    userRole,
  };
};

// Admin hook to update role feature access
export const useUpdateRoleFeatureAccess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      role, 
      features 
    }: { 
      role: RoleType; 
      features: { key: string; enabled: boolean }[] 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upsert feature access records for the role
      const updates = features.map(f => ({
        role,
        feature_key: f.key,
        is_enabled: f.enabled,
        updated_by: user.id,
      }));

      // Use upsert to handle both insert and update cases
      for (const update of updates) {
        const { error } = await supabase
          .from('role_feature_access')
          .upsert(update, { onConflict: 'role,feature_key' });

        if (error) {
          console.error('Upsert error:', error);
          throw new Error(`Failed to update feature access: ${error.message}`);
        }
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-feature-access'] });
    },
  });
};
