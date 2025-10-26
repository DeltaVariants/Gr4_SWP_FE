import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { token, role, maxAge } = await req.json();
    if (!token) {
      return NextResponse.json({ success: false, message: 'Missing token' }, { status: 400 });
    }

    const res = NextResponse.json({ success: true });
    const cookieMaxAge = typeof maxAge === 'number' ? maxAge : 60 * 60; // default 1h

    // Set cookies server-side to avoid client race conditions
    res.cookies.set('token', token, {
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      maxAge: cookieMaxAge,
    });
    if (role) {
      res.cookies.set('role', String(role).toUpperCase(), {
        path: '/',
        sameSite: 'lax',
        httpOnly: false,
        maxAge: cookieMaxAge,
      });
    }
    return res;
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
  }
}
