import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Normalize env base to avoid '/api/api' when joining
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'https://gr4-swp-be2-sp25.onrender.com';
const API_BASE = RAW_API_URL.replace(/\/+$/,'').replace(/\/api\/?$/,'');

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

    
  const response = await fetch(`${API_BASE}/api/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Be generous with payload keys to match various BE binders
      // Primary: Email/Password. Fallbacks: email/password, Username/UserName when user inputs a non-email.
      body: JSON.stringify({
        Email: email,
        email: email,
        Username: email,
        UserName: email,
        Password: password,
        password: password,
      }),
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