import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Define all available platform features
export const PLATFORM_FEATURES = [
  { key: 'incidents', label: 'Incident Reporting', path: '/incidents' },
  { key: 'community', label: 'Community Hub', path: '/community' },
  { key: 'peace-pulse', label: 'Peace Pulse', path: '/peace-pulse' },
  { key: 'proposals', label: 'Polls & Proposals', path: '/proposals' },
  { key: 'safety', label: 'Safety Portal', path: '/safety' },
  { key: 'radio', label: 'Peace Radio', path: '/radio' },
  { key: 'challenges', label: 'Challenges', path: '/challenges' },
  { key: 'voice', label: 'Voice Stories', path: '/voice' },
  { key: 'verification', label: 'Verification', path: '/verification' },
  { key: 'integrations', label: 'Integrations', path: '/integrations' },
  { key: 'early-warning', label: 'Early Warning', path: '/dashboard/early-warning' },
  { key: 'nuru-ai', label: 'NuruAI', path: '/nuru-ai' },
] as const;

export type FeatureKey = typeof PLATFORM_FEATURES[number]['key'];

interface FeatureAccess {
  id: string;
  user_id: string;
  feature_key: string;
  is_enabled: boolean;
  granted_by: string | null;
  created_at: string;
  updated_at: string;
}

// Hook to get current user's accessible features
export const useUserFeatureAccess = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-feature-access', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_feature_access')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as FeatureAccess[];
    },
    enabled: !!user?.id,
  });
};

// Hook to check if user has access to a specific feature
export const useHasFeatureAccess = (featureKey: FeatureKey) => {
  const { data: featureAccess, isLoading } = useUserFeatureAccess();

  // If no feature restrictions exist, user has access to everything
  if (!featureAccess || featureAccess.length === 0) {
    return { hasAccess: true, isLoading };
  }

  const feature = featureAccess.find(f => f.feature_key === featureKey);
  
  // If feature not in list, default to no access (admin must explicitly grant)
  // If feature is in list, check is_enabled
  return { 
    hasAccess: feature ? feature.is_enabled : false, 
    isLoading 
  };
};

// Hook to get all accessible features for current user
export const useAccessibleFeatures = () => {
  const { data: featureAccess, isLoading } = useUserFeatureAccess();

  // If no restrictions, return all features
  if (!featureAccess || featureAccess.length === 0) {
    return { 
      features: PLATFORM_FEATURES.map(f => f.key), 
      isLoading,
      hasRestrictions: false 
    };
  }

  const enabledFeatures = featureAccess
    .filter(f => f.is_enabled)
    .map(f => f.feature_key);

  return { 
    features: enabledFeatures, 
    isLoading,
    hasRestrictions: true 
  };
};

// Admin hook to get feature access for a specific user
export const useUserFeatureAccessAdmin = (userId: string | null) => {
  return useQuery({
    queryKey: ['admin-user-feature-access', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('user_feature_access')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data as FeatureAccess[];
    },
    enabled: !!userId,
  });
};

// Admin hook to update user feature access
export const useUpdateUserFeatureAccess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      features 
    }: { 
      userId: string; 
      features: { key: string; enabled: boolean }[] 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete existing feature access for user
      const { error: deleteError } = await supabase
        .from('user_feature_access')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw new Error(`Failed to clear existing access: ${deleteError.message}`);
      }

      // Insert new feature access records
      const records = features.map(f => ({
        user_id: userId,
        feature_key: f.key,
        is_enabled: f.enabled,
        granted_by: user.id,
      }));

      const { error: insertError } = await supabase
        .from('user_feature_access')
        .insert(records);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(`Failed to save feature access: ${insertError.message}`);
      }
      
      return true;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-feature-access', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['user-feature-access'] });
    },
  });
};
