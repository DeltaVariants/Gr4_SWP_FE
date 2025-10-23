import { NextResponse } from 'next/server';

export async function GET() {
  const apiBaseEnv = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  const fallbackBase = 'https://gr4-swp-be2-sp25.onrender.com';
  const base = (apiBaseEnv && apiBaseEnv.trim().length > 0) ? apiBaseEnv : fallbackBase;
  const target = `${base.replace(/\/$/, '')}/api/Auth/google-login`;
  // 307 preserves method; we only need a GET but 302/307 both fine here
  return NextResponse.redirect(target, { status: 307 });
}
