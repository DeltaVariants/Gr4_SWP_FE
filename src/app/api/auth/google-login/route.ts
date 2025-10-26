import { NextRequest, NextResponse } from 'next/server';

// Redirects the browser to the backend's Google login endpoint.
// We also forward the current origin as a hint so the BE can construct
// a dynamic callback URL that works on any localhost port.
export async function GET(req: NextRequest) {
  const apiBaseEnv = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  const fallbackBase = 'https://gr4-swp-be2-sp25.onrender.com';
  const base = (apiBaseEnv && apiBaseEnv.trim().length > 0) ? apiBaseEnv : fallbackBase;

  // Derive current origin from the incoming request (respects dev ports)
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  const host = req.headers.get('host') || 'localhost:3000';
  const currentOrigin = `${proto}://${host}`;

  // Append origin as a query param the backend may choose to honor;
  // harmless if the backend ignores it.
  const url = new URL(`${base.replace(/\/$/, '')}/api/Auth/google-login`);
  url.searchParams.set('origin', currentOrigin);

  // 307 preserves method; we only need a GET but 302/307 both fine here
  return NextResponse.redirect(url.toString(), { status: 307 });
}
