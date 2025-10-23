import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname.toLowerCase();
  if (pathname === '/api/auth/google-login') {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/google-login';
    return NextResponse.redirect(url, { status: 307 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/auth/google-login'],
};
