/**
 * Role-based routing utilities
 * Centralized logic for redirecting users based on their role
 */

export type UserRole = 'ADMIN' | 'EMPLOYEE' | 'STAFF' | 'DRIVER' | 'CUSTOMER' | string;

/**
 * Get the appropriate redirect path based on user role
 * @param role - User's role (case-insensitive)
 * @returns Path to redirect to
 */
export function getRedirectPathByRole(role: string | null | undefined): string {
  const normalizedRole = (role || '').toUpperCase().trim();
  
  switch (normalizedRole) {
    case 'ADMIN':
      return '/dashboard';
    
    case 'EMPLOYEE':
    case 'STAFF':
      return '/dashboardstaff';
    
    case 'DRIVER':
    case 'CUSTOMER':
      return '/home';
    
    default:
      // Default to home page for unknown roles
      console.warn(`[roleUtils] Unknown role: "${role}", redirecting to /home`);
      return '/home';
  }
}

/**
 * Check if a role has admin privileges
 */
export function isAdminRole(role: string | null | undefined): boolean {
  return (role || '').toUpperCase().trim() === 'ADMIN';
}

/**
 * Check if a role has staff/employee privileges
 */
export function isStaffRole(role: string | null | undefined): boolean {
  const normalized = (role || '').toUpperCase().trim();
  return normalized === 'EMPLOYEE' || normalized === 'STAFF';
}

/**
 * Check if a role is customer/driver
 */
export function isCustomerRole(role: string | null | undefined): boolean {
  const normalized = (role || '').toUpperCase().trim();
  return normalized === 'CUSTOMER' || normalized === 'DRIVER';
}

/**
 * Normalize role name to standard format
 * Backend might return different casings
 */
export function normalizeRole(role: string | null | undefined): UserRole {
  const normalized = (role || '').toUpperCase().trim();
  
  switch (normalized) {
    case 'ADMIN':
      return 'ADMIN';
    case 'EMPLOYEE':
    case 'STAFF':
      return 'EMPLOYEE';
    case 'DRIVER':
    case 'CUSTOMER':
      return 'CUSTOMER';
    default:
      return role || 'CUSTOMER';
  }
}
