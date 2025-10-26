import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const STAFF_PATHS = ['/dashboardstaff', '/reservations', '/check-in', '/swap', '/inventory', '/reports'];
const ADMIN_PATHS = ['/admin'];
const AUTH_USER_PATHS = ['/profile'];
const PUBLIC_AUTH_PATHS = ['/login', '/register', '/forgotpassword', '/resetpassword'];

function isIn(paths: string[], pathname: string) {
  return paths.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const token = req.cookies.get('token')?.value;
  const role = (req.cookies.get('role')?.value || '').toUpperCase();
  const hasAuth = Boolean(token && role);

  const inStaff = isIn(STAFF_PATHS, pathname);
  const inAdmin = isIn(ADMIN_PATHS, pathname);
  const inAuthUser = isIn(AUTH_USER_PATHS, pathname);
  const inPublicAuth = isIn(PUBLIC_AUTH_PATHS, pathname);

  if ((inStaff || inAdmin || inAuthUser) && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Nếu đã đăng nhập mà vào /login, /register, ... thì đẩy về homepage
  if (inPublicAuth && hasAuth) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  if (inAdmin && role !== 'ADMIN') {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  if (inStaff && !['ADMIN', 'EMPLOYEE', 'STAFF'].includes(role)) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboardstaff/:path*',
    '/reservations/:path*',
    '/check-in/:path*',
    '/swap/:path*',
    '/inventory/:path*',
    '/reports/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/login',
    '/register',
    '/forgotpassword',
    '/resetpassword',
  ],
};
