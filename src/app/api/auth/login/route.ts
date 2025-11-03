import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gr4-swp-be2-sp25.onrender.com/api';

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn('[auth/login] NEXT_PUBLIC_API_URL not set, using fallback');
}

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

    
    const response = await fetch(`${API_URL}/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      
      body: JSON.stringify({ Email: email, Password: password }),
    });

    
    const contentType = response.headers.get('content-type') || '';
    let data: any = {};
    let rawText = '';
    if (contentType.includes('application/json')) {
      data = await response.json().catch(() => ({}));
    } else {
      rawText = await response.text().catch(() => '');
    }

    if (!response.ok) {
      
  let message = data?.message || data?.error || rawText || 'Invalid credentials';
      if (response.status >= 500) {
        message = 'Máy chủ đang bận hoặc gặp sự cố. Vui lòng thử lại sau.';
      } else if (response.status === 401) {
        message = 'Email hoặc mật khẩu không đúng';
      }
      return NextResponse.json(
        { success: false, message },
        { status: response.status || 401 }
      );
    }

    
    const base = (data && (data.data || data.Data)) ? (data.data || data.Data) : data;
    const token = base.token ?? base.Token;
    const refreshToken = base.refreshToken ?? base.RefreshToken;
    const rawAuth = base.authDTO ?? base.AuthDTO ?? base.user ?? base.User ?? null;
    const authDTO = rawAuth
      ? {
          userID: rawAuth.userID ?? rawAuth.UserID ?? rawAuth.id ?? rawAuth.Id ?? rawAuth.ID,
          email: rawAuth.email ?? rawAuth.Email,
          username: rawAuth.username ?? rawAuth.Username ?? rawAuth.name ?? rawAuth.Name,
          roleName: rawAuth.roleName ?? rawAuth.RoleName ?? rawAuth.role ?? rawAuth.Role,
          phoneNumber: rawAuth.phoneNumber ?? rawAuth.PhoneNumber ?? rawAuth.phone ?? rawAuth.Phone,
        }
      : null;

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