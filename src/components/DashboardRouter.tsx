import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRoles } from '@/hooks/useRoleCheck';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * DashboardRouter - Automatically routes users to their role-appropriate dashboard
 * 
 * Role Priority (highest to lowest):
 * 1. admin -> /admin
 * 2. government -> /dashboard/government
 * 3. partner -> /dashboard/partner
 * 4. verifier -> /dashboard/verifier
 * 5. citizen -> /dashboard/citizen
 */
export const DashboardRouter = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { data: userRoles, isLoading: rolesLoading } = useUserRoles();

  useEffect(() => {
    if (authLoading || rolesLoading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    if (!userRoles || userRoles.length === 0) {
      // Default to citizen dashboard if no roles assigned
      navigate('/dashboard/citizen');
      return;
    }

    // Extract role strings from role objects
    const roleStrings = userRoles.map((r: any) => r.role);

    // Route based on highest priority role
    if (roleStrings.includes('admin')) {
      navigate('/admin');
    } else if (roleStrings.includes('government')) {
      navigate('/dashboard/government');
    } else if (roleStrings.includes('partner')) {
      navigate('/dashboard/partner');
    } else if (roleStrings.includes('verifier')) {
      navigate('/dashboard/verifier');
    } else {
      // Default to citizen dashboard
      navigate('/dashboard/citizen');
    }
  }, [user, userRoles, authLoading, rolesLoading, navigate]);

  if (authLoading || rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return null;
};
