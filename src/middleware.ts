import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Authentication Wrapper Middleware
 * Kiểm tra xác thực và phân quyền cho các routes
 */

// Route configurations
const ROUTE_CONFIG = {
  // Public routes - không cần authentication
  PUBLIC: [
    "/",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/verify-email",
    "/api/auth/send-reset",
    "/api/auth/reset-password",
    "/api/auth/google-login",
    "/api/auth/set-session",
    "/google-callback",
  ],

  // Auth pages - chỉ cho phép truy cập khi CHƯA đăng nhập
  AUTH_PAGES: [
    "/login",
    "/register",
    "/forgotpassword",
    "/resetpassword",
    "/newpassword",
    "/verify-email",
  ],

  // Protected routes - cần đăng nhập
  PROTECTED: {
    ADMIN: [
      "/admin",
      "/dashboard",
      "/battery-management",
      "/station-management",
      "/user-management",
      "/transactions-reports",
      "/system-config",
    ],
    STAFF: [
      "/dashboardstaff",
      "/reservations",
      "/check-in",
      "/swap",
      "/inventory",
      "/reports",
    ],
    CUSTOMER: [
      "/home",
      "/booking",
      "/findstation",
      "/history",
      "/billing-plan",
      "/support",
    ],
    ANY_AUTHENTICATED: ["/profile", "/logout"],
  },
};

/**
 * Check if path matches any patterns in the list
 */
function matchesPath(patterns: string[], pathname: string): boolean {
  return patterns.some((pattern) => {
    // Exact match
    if (pathname === pattern) return true;
    // Prefix match with /
    if (pathname.startsWith(pattern + "/")) return true;
    return false;
  });
}

/**
 * Get authentication info from cookies
 */
function getAuthInfo(req: NextRequest) {
  const token =
    req.cookies.get("token")?.value || req.cookies.get("accessToken")?.value;
  const role = (req.cookies.get("role")?.value || "").toUpperCase();

  return {
    token,
    role,
    isAuthenticated: Boolean(token),
    isAdmin: role === "ADMIN",
    isStaff: role === "STAFF" || role === "EMPLOYEE",
    isCustomer: role === "CUSTOMER" || role === "DRIVER",
  };
}

/**
 * Create redirect response
 */
function redirectTo(
  req: NextRequest,
  path: string,
  reason?: string
): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = path;
  // Clear any existing search params for clean URLs
  url.search = "";

  console.log(
    `[Middleware] Redirecting from ${req.nextUrl.pathname} to ${path}${
      reason ? ` (${reason})` : ""
    }`
  );
  return NextResponse.redirect(url);
}

/**
 * Main middleware function
 */
export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const auth = getAuthInfo(req);

  // Log for debugging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Middleware] ${pathname} | Auth: ${auth.isAuthenticated} | Role: ${
        auth.role || "none"
      }`
    );
  }

  // 1. Allow public routes
  if (matchesPath(ROUTE_CONFIG.PUBLIC, pathname)) {
    return NextResponse.next();
  }

  // 1.5. Special case: Allow /home with token param (Google OAuth callback)
  if (pathname === '/home' && req.nextUrl.searchParams.has('token')) {
    console.log('[Middleware] Allowing /home with token param (Google OAuth callback)');
    return NextResponse.next();
  }

  // 2. Handle auth pages (login, register, etc.)
  if (matchesPath(ROUTE_CONFIG.AUTH_PAGES, pathname)) {
    // Nếu đã đăng nhập VÀ CÓ ROLE, redirect về trang tương ứng với role
    if (auth.isAuthenticated && auth.role && auth.role !== 'none') {
      if (auth.isAdmin)
        return redirectTo(req, "/dashboard", "already_authenticated");
      if (auth.isStaff)
        return redirectTo(req, "/dashboardstaff", "already_authenticated");
      if (auth.isCustomer)
        return redirectTo(req, "/home", "already_authenticated");
      // Nếu có token nhưng role không hợp lệ, cho phép re-login
      console.log('[Middleware] Token exists but invalid role, allowing login');
    }
    // Chưa đăng nhập hoặc role invalid thì cho phép truy cập
    return NextResponse.next();
  }

  // 3. Check protected routes - cần authentication

  // 3a. Admin routes
  if (matchesPath(ROUTE_CONFIG.PROTECTED.ADMIN, pathname)) {
    if (!auth.isAuthenticated) {
      return redirectTo(req, "/login", "authentication_required");
    }
    if (!auth.isAdmin) {
      return redirectTo(req, "/", "unauthorized_role");
    }
    return NextResponse.next();
  }

  // 3b. Staff routes (skip API routes - they handle auth internally)
  if (matchesPath(ROUTE_CONFIG.PROTECTED.STAFF, pathname) && !pathname.startsWith('/api/')) {
    if (!auth.isAuthenticated) {
      return redirectTo(req, "/login", "authentication_required");
    }
    if (!auth.isStaff) {
      return redirectTo(req, "/", "unauthorized_role");
    }
    return NextResponse.next();
  }

  // 3c. Customer routes (skip API routes - they handle auth internally)
  if (matchesPath(ROUTE_CONFIG.PROTECTED.CUSTOMER, pathname) && !pathname.startsWith('/api/')) {
    if (!auth.isAuthenticated) {
      return redirectTo(req, "/login", "authentication_required");
    }
    if (!auth.isCustomer) {
      return redirectTo(req, "/", "unauthorized_role");
    }
    return NextResponse.next();
  }

  // 3d. Any authenticated user routes
  if (matchesPath(ROUTE_CONFIG.PROTECTED.ANY_AUTHENTICATED, pathname)) {
    if (!auth.isAuthenticated) {
      return redirectTo(req, "/login", "authentication_required");
    }
    return NextResponse.next();
  }

  // 4. Default - allow access
  return NextResponse.next();
}

/**
 * Middleware matcher configuration
 * Chỉ chạy middleware cho các routes cần thiết
 */
export const config = {
  matcher: [
    // Auth pages
    "/login",
    "/register",
    "/forgotpassword",
    "/resetpassword",
    "/newpassword",
    "/verify-email",

    // Admin routes
    "/admin/:path*",
    "/dashboard/:path*",
    "/battery-management/:path*",
    "/station-management/:path*",
    "/user-management/:path*",
    "/transactions-reports/:path*",
    "/system-config/:path*",

    // Staff routes
    "/dashboardstaff/:path*",
    "/reservations/:path*",
    "/check-in/:path*",
    "/swap/:path*",
    "/inventory/:path*",
    "/reports/:path*",

    // Customer routes
    "/home/:path*",
    "/booking/:path*",
    "/findstation/:path*",
    "/history/:path*",
    "/billing-plan/:path*",
    "/support/:path*",

    // Common protected routes
    "/profile/:path*",
    "/logout",
  ],
};