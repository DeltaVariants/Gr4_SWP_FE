/**
 * API Route Authentication Wrapper
 * Protect API routes với authentication và authorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

type Role = 'ADMIN' | 'STAFF' | 'EMPLOYEE' | 'CUSTOMER' | 'DRIVER';

interface AuthInfo {
  token: string;
  role: string;
  isAuthenticated: boolean;
}

interface WithApiAuthOptions {
  /**
   * Required roles - nếu không truyền thì chỉ cần đăng nhập là đủ
   */
  requiredRoles?: Role[];
  
  /**
   * Allow unauthenticated access
   */
  allowUnauthenticated?: boolean;
}

/**
 * Get authentication info from request
 */
export async function getAuthFromRequest(req: NextRequest): Promise<AuthInfo | null> {
  // Try Authorization header first
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token) {
      // Decode role from token (simple approach - in production use JWT verification)
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const role = (payload.role || payload.RoleName || payload.roleName || '').toUpperCase();
        return {
          token,
          role,
          isAuthenticated: true,
        };
      } catch (e) {
        console.warn('[API Auth] Failed to decode token:', e);
      }
    }
  }

  // Try cookies
  const cookieStore = cookies();
  const tokenCookie = (await cookieStore).get('token') || (await cookieStore).get('accessToken');
  const roleCookie = (await cookieStore).get('role');

  if (tokenCookie?.value) {
    return {
      token: tokenCookie.value,
      role: (roleCookie?.value || '').toUpperCase(),
      isAuthenticated: true,
    };
  }

  return null;
}

/**
 * Check if user has required role
 */
function hasRequiredRole(userRole: string, requiredRoles?: Role[]): boolean {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  
  const normalizedUserRole = userRole.toUpperCase();
  return requiredRoles.some(role => role.toUpperCase() === normalizedUserRole);
}

/**
 * Create unauthorized response
 */
function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    { 
      success: false, 
      message,
      error: 'UNAUTHORIZED' 
    },
    { status: 401 }
  );
}

/**
 * Create forbidden response
 */
function forbiddenResponse(message: string = 'Forbidden'): NextResponse {
  return NextResponse.json(
    { 
      success: false, 
      message,
      error: 'FORBIDDEN' 
    },
    { status: 403 }
  );
}

/**
 * HOC to wrap API route handlers with authentication
 * 
 * @example
 * // Require authentication only
 * export const GET = withApiAuth(async (req, auth) => {
 *   // auth.token, auth.role available here
 *   return NextResponse.json({ data: 'protected data' });
 * });
 * 
 * @example
 * // Require ADMIN role
 * export const POST = withApiAuth(
 *   async (req, auth) => {
 *     return NextResponse.json({ data: 'admin only data' });
 *   },
 *   { requiredRoles: ['ADMIN'] }
 * );
 * 
 * @example
 * // Allow STAFF or ADMIN
 * export const GET = withApiAuth(
 *   async (req, auth) => {
 *     return NextResponse.json({ data: 'staff data' });
 *   },
 *   { requiredRoles: ['STAFF', 'ADMIN'] }
 * );
 */
export function withApiAuth(
  handler: (req: NextRequest, auth: AuthInfo) => Promise<NextResponse>,
  options: WithApiAuthOptions = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Get auth info
      const auth = await getAuthFromRequest(req);

      // Check if authenticated
      if (!auth && !options.allowUnauthenticated) {
        console.log('[API Auth] No authentication found');
        return unauthorizedResponse('Authentication required');
      }

      // Check role if required
      if (auth && options.requiredRoles && options.requiredRoles.length > 0) {
        if (!hasRequiredRole(auth.role, options.requiredRoles)) {
          console.log('[API Auth] Role not allowed:', auth.role, 'Required:', options.requiredRoles);
          return forbiddenResponse(`Access denied. Required role: ${options.requiredRoles.join(' or ')}`);
        }
      }

      // Call handler with auth info
      return await handler(req, auth!);
    } catch (error) {
      console.error('[API Auth] Error:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Internal server error',
          error: 'INTERNAL_ERROR' 
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Shorthand for admin-only API routes
 */
export function withAdminApiAuth(
  handler: (req: NextRequest, auth: AuthInfo) => Promise<NextResponse>
) {
  return withApiAuth(handler, { requiredRoles: ['ADMIN'] });
}

/**
 * Shorthand for staff-only API routes
 */
export function withStaffApiAuth(
  handler: (req: NextRequest, auth: AuthInfo) => Promise<NextResponse>
) {
  return withApiAuth(handler, { requiredRoles: ['STAFF', 'EMPLOYEE'] });
}

/**
 * Shorthand for customer-only API routes
 */
export function withCustomerApiAuth(
  handler: (req: NextRequest, auth: AuthInfo) => Promise<NextResponse>
) {
  return withApiAuth(handler, { requiredRoles: ['CUSTOMER', 'DRIVER'] });
}
