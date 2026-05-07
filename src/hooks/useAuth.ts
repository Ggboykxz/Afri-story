import { useAuth } from '../context/AuthContext';
import { UserRole } from '../lib/roles';

interface UsePermissionProps {
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export function usePermission({ allowedRoles, requireAuth = true }: UsePermissionProps = {}) {
  const { user, profile, loading, hasPermission } = useAuth();

  const canAccess = (): boolean => {
    if (loading) return false;
    if (requireAuth && !user) return false;
    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) return false;
    return true;
  };

  const redirectTo = (): string | null => {
    if (loading) return null;
    if (requireAuth && !user) return '/login';
    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) return '/';
    return null;
  };

  return { canAccess, redirectTo, hasPermission, loading };
}

export function useProtectedRoute(allowedRoles?: UserRole[], requireAuth = true) {
  const { user, profile, loading, hasPermission } = useAuth();

  if (loading) {
    return { isLoading: true, isAllowed: false, redirectTo: null };
  }

  if (requireAuth && !user) {
    return { isLoading: false, isAllowed: false, redirectTo: '/login' };
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return { isLoading: false, isAllowed: false, redirectTo: '/' };
  }

  return { isLoading: false, isAllowed: true, redirectTo: null };
}

export function useGuestRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return { isLoading: true, shouldRedirect: false, redirectTo: null };
  }

  if (user) {
    return { isLoading: false, shouldRedirect: true, redirectTo: '/' };
  }

  return { isLoading: false, shouldRedirect: false, redirectTo: null };
}