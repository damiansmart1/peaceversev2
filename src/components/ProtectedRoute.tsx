import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleCheck, AppRole } from '@/hooks/useRoleCheck';
import LoadingSpinner from './LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: AppRole | AppRole[];
  requireAuth?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute = ({
  children,
  requiredRole,
  requireAuth = true,
  redirectTo = '/auth',
}: ProtectedRouteProps) => {
  const { user, isLoading: authLoading } = useAuth();
  
  // Determine which roles to check
  const rolesToCheck = Array.isArray(requiredRole) ? requiredRole : requiredRole ? [requiredRole] : [];
  
  const { data: roleData, isLoading: roleLoading } = useRoleCheck(
    rolesToCheck.length === 1 ? rolesToCheck[0] : undefined
  );

  // Show loading state
  if (authLoading || (requiredRole && roleLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role requirements
  if (requiredRole) {
    const hasRequiredRole = Array.isArray(requiredRole)
      ? roleData?.roles?.some(r => requiredRole.includes(r))
      : roleData?.hasRole;

    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You don't have the required permissions to access this page.
              {Array.isArray(requiredRole)
                ? ` Required roles: ${requiredRole.join(', ')}`
                : ` Required role: ${requiredRole}`}
            </AlertDescription>
          </Alert>
        </div>
      );
    }
  }

  return <>{children}</>;
};
