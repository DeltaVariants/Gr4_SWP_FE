import { NextRequest, NextResponse } from 'next/server';


export async function GET(req: NextRequest) {
  const apiBaseEnv = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  // Prefer HTTPS backend as provided by the team
  const fallbackBase = 'https://gr4-swp-be2-sp25.onrender.com';
  // Normalize base to strip trailing '/api' and slashes
  const base = ((apiBaseEnv && apiBaseEnv.trim().length > 0) ? apiBaseEnv : fallbackBase)
    .replace(/\/+$/,'')
    .replace(/\/api\/?$/,'');

  // Build BE target URL (preserve origin via query param so BE can determine where to callback)
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  const host = req.headers.get('host') || 'localhost:3000';
  const currentOrigin = `${proto}://${host}`;
  const target = new URL(`${base.replace(/\/$/, '')}/Auth/google-login`);
  target.searchParams.set('origin', currentOrigin);

  // Simple redirect: send browser straight to backend endpoint. This avoids server-side fetch and intermediate 301 caching issues.
  return NextResponse.redirect(target.toString(), { status: 307 });
}
