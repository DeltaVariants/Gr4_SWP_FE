import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'email and password are required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.message || 'Invalid credentials';
      return NextResponse.json(
        { success: false, message },
        { status: response.status || 401 }
      );
    }

    // Normalize keys from backend (both lower/upper case)
    const token = data.token ?? data.Token;
    const refreshToken = data.refreshToken ?? data.RefreshToken;
    const authDTO = data.authDTO ?? data.AuthDTO ?? data.user ?? null;

    return NextResponse.json({
      success: true,
      token,
      refreshToken,
      authDTO,
      data,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}