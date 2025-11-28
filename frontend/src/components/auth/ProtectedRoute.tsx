import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Required roles to access this route. If empty, any authenticated user can access */
  roles?: UserRole[];
  /** Redirect path for unauthenticated users */
  redirectTo?: string;
}

/**
 * Protected route component that ensures authentication
 * and optionally checks for specific user roles.
 * 
 * @example
 * // Any authenticated user
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * @example
 * // Only admin users
 * <ProtectedRoute roles={['admin']}>
 *   <AdminPanel />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ 
  children, 
  roles = [], 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // Show nothing while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  // Not authenticated - redirect to login with return URL
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check role-based access
  if (roles.length > 0 && !roles.includes(user.role as UserRole)) {
    // User doesn't have required role - redirect to home or forbidden page
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

/**
 * Redirect authenticated users away (e.g., from login page)
 */
export function GuestRoute({ 
  children, 
  redirectTo = '/dashboard' 
}: { 
  children: React.ReactNode; 
  redirectTo?: string;
}) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  // If authenticated, redirect to intended destination or default
  if (isAuthenticated) {
    const from = (location.state as { from?: string })?.from || redirectTo;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;

