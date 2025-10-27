import { NextRequest, NextResponse } from 'next/server';


export async function GET(req: NextRequest) {
  const apiBaseEnv = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  const fallbackBase = 'https://gr4-swp-be2-sp25.onrender.com';
  const base = (apiBaseEnv && apiBaseEnv.trim().length > 0) ? apiBaseEnv : fallbackBase;

  
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  const host = req.headers.get('host') || 'localhost:3000';
  const currentOrigin = `${proto}://${host}`;

  
  const url = new URL(`${base.replace(/\/$/, '')}/api/Auth/google-login`);
  url.searchParams.set('origin', currentOrigin);

 
  return NextResponse.redirect(url.toString(), { status: 307 });
}
