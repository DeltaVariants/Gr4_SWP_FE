/**
 * Higher-Order Component for Authentication Protection
 * Wrap các components cần authentication ở client-side
 */

'use client';

import { useEffect, ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type Role = 'ADMIN' | 'STAFF' | 'EMPLOYEE' | 'CUSTOMER' | 'DRIVER';

interface WithAuthOptions {
  /**
   * Allowed roles - nếu không truyền thì chỉ cần đăng nhập là đủ
   */
  allowedRoles?: Role[];
  
  /**
   * Redirect path khi không có quyền - mặc định là '/login'
   */
  redirectTo?: string;
  
  /**
   * Show loading component while checking auth
   */
  showLoading?: boolean;
}

/**
 * HOC để protect pages - chỉ cho phép user đã đăng nhập truy cập
 * 
 * @example
 * // Chỉ cần đăng nhập
 * export default withAuth(ProfilePage);
 * 
 * @example
 * // Chỉ cho phép ADMIN
 * export default withAuth(AdminDashboard, { allowedRoles: ['ADMIN'] });
 * 
 * @example
 * // Cho phép STAFF hoặc ADMIN
 * export default withAuth(InventoryPage, { allowedRoles: ['STAFF', 'ADMIN'] });
 */
export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    allowedRoles,
    redirectTo = '/login',
    showLoading = true,
  } = options;

  return function ProtectedComponent(props: P) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      console.log('[withAuth] Check:', { loading, isAuthenticated, user: !!user });
      
      // Wait for auth to load - AuthContext will set loading to false once initialized
      if (loading) {
        console.log('[withAuth] Still loading, waiting...');
        return;
      }

      // Check if user is authenticated (no more setTimeout hacks!)
      if (!isAuthenticated || !user) {
        console.log('[withAuth] User not authenticated, redirecting to:', redirectTo);
        router.replace(redirectTo);
        return;
      }

      // Check role if allowedRoles is specified
      if (allowedRoles && allowedRoles.length > 0) {
        const userRole = user.role?.toUpperCase();
        const hasPermission = allowedRoles.some(
          role => role.toUpperCase() === userRole
        );

        if (!hasPermission) {
          console.log('[withAuth] User role not allowed:', userRole, 'Required:', allowedRoles);
          router.replace('/');
          return;
        }
      }

      console.log('[withAuth] Access granted for:', user.email, 'Role:', user.role);
    }, [user, loading, isAuthenticated, router, allowedRoles, redirectTo]);

    // Show loading state
    if (loading) {
      if (showLoading) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Đang kiểm tra xác thực...</p>
            </div>
          </div>
        );
      }
      return null;
    }

    // Check authentication
    if (!isAuthenticated || !user) {
      return null; // Will redirect in useEffect
    }

    // Check role
    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = user.role?.toUpperCase();
      const hasPermission = allowedRoles.some(
        role => role.toUpperCase() === userRole
      );

      if (!hasPermission) {
        return null; // Will redirect in useEffect
      }
    }

    // Render protected component
    return <WrappedComponent {...props} />;
  };
}

/**
 * Shorthand HOCs for specific roles
 */

export function withAdminAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  return withAuth(WrappedComponent, { allowedRoles: ['ADMIN'] });
}

export function withStaffAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  return withAuth(WrappedComponent, { allowedRoles: ['STAFF', 'EMPLOYEE'] });
}

export function withCustomerAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  return withAuth(WrappedComponent, { allowedRoles: ['CUSTOMER', 'DRIVER'] });
}

/**
 * Hook to check if user has specific role
 */
export function useRole(requiredRole: Role | Role[]): boolean {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) return false;
  
  const userRole = user.role?.toUpperCase();
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  return roles.some(role => role.toUpperCase() === userRole);
}

/**
 * Hook to check if user is admin
 */
export function useIsAdmin(): boolean {
  return useRole('ADMIN');
}

/**
 * Hook to check if user is staff
 */
export function useIsStaff(): boolean {
  return useRole(['STAFF', 'EMPLOYEE']);
}

/**
 * Hook to check if user is customer
 */
export function useIsCustomer(): boolean {
  return useRole(['CUSTOMER', 'DRIVER']);
}
