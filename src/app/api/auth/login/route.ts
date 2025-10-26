import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gr4-swp-be2-sp25.onrender.com';

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

    // Use API_URL with safe default to avoid 'undefined' in dev
    const response = await fetch(`${API_URL}/api/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Map payload to BE expected casing
      body: JSON.stringify({ Email: email, Password: password }),
    });

    // Try JSON first; if not JSON, capture text
    const contentType = response.headers.get('content-type') || '';
    let data: any = {};
    let rawText = '';
    if (contentType.includes('application/json')) {
      data = await response.json().catch(() => ({}));
    } else {
      rawText = await response.text().catch(() => '');
    }

    if (!response.ok) {
      // Chuẩn hóa thông điệp lỗi thân thiện
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

    // Normalize keys from backend (both lower/upper case), support nested { data: {...} }
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