import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true });
  // Clear cookies by setting maxAge to 0
  res.cookies.set('token', '', { path: '/', maxAge: 0 });
  res.cookies.set('role', '', { path: '/', maxAge: 0 });
  return res;
}
