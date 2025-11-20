import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Backend URL - đảm bảo không có trailing /api
  const backendBase = 'https://gr4-swp-be2-sp25.onrender.com';

  // Get current origin để backend biết redirect về đâu
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  const host = req.headers.get('host') || 'localhost:3000';
  const currentOrigin = `${proto}://${host}`;
  
  // Backend endpoint: /api/Auth/google-login
  const target = new URL(`${backendBase}/api/Auth/google-login`);
  
  // Yêu cầu backend redirect về /google-callback thay vì /home
  const callbackUrl = `${currentOrigin}/google-callback`;
  target.searchParams.set('origin', currentOrigin);
  target.searchParams.set('redirectUrl', callbackUrl);
  target.searchParams.set('redirect_uri', callbackUrl);

  console.log('[GoogleLogin] Redirecting to:', target.toString());
  console.log('[GoogleLogin] Expecting callback at:', callbackUrl);

  // Redirect browser đến backend để xử lý Google OAuth
  return NextResponse.redirect(target.toString(), { status: 307 });
}
