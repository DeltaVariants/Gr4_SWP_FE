import { NextRequest, NextResponse } from 'next/server';

/**
 * Set session cookies for Google login
 * Used by google-callback page to set httpOnly cookies for middleware
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, refreshToken, role } = body;

    console.log('[SetSession] Setting cookies for role:', role);

    const response = NextResponse.json({ 
      success: true, 
      message: 'Session cookies set successfully' 
    });

    // Set accessToken cookie
    if (accessToken) {
      response.cookies.set('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour
        path: '/',
      });
      console.log('[SetSession] accessToken cookie set');
    }

    // Set refreshToken cookie if provided
    if (refreshToken) {
      response.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      console.log('[SetSession] refreshToken cookie set');
    }

    // Set role cookie for middleware routing
    if (role) {
      response.cookies.set('role', role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour
        path: '/',
      });
      console.log('[SetSession] role cookie set:', role);
    }

    return response;
  } catch (error) {
    console.error('[SetSession] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to set session cookies' },
      { status: 500 }
    );
  }
}
