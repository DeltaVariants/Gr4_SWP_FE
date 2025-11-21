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

    console.log('Backend login response:', { status: response.status, data });

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
    
    console.log('[Login Route] Backend response data:', JSON.stringify(data, null, 2));
    console.log('[Login Route] rawAuth:', JSON.stringify(rawAuth, null, 2));
    
    // Extract role value (handle nested object or string)
    let roleNameValue = rawAuth?.roleName ?? rawAuth?.RoleName ?? rawAuth?.role ?? rawAuth?.Role;
    
    // If role is an object, extract name
    if (roleNameValue && typeof roleNameValue === 'object') {
      roleNameValue = roleNameValue.name ?? roleNameValue.Name ?? roleNameValue.roleName ?? roleNameValue.RoleName;
    }
    
    // Fallback: Map roleID to role name
    if (!roleNameValue && (rawAuth?.roleID || rawAuth?.RoleID || rawAuth?.roleId || rawAuth?.RoleId)) {
      const roleId = rawAuth.roleID ?? rawAuth.RoleID ?? rawAuth.roleId ?? rawAuth.RoleId;
      console.log('[Login Route] Using roleID fallback, roleId:', roleId);
      if (roleId === 1 || roleId === '1') roleNameValue = 'ADMIN';
      else if (roleId === 2 || roleId === '2') roleNameValue = 'STAFF';
      else if (roleId === 3 || roleId === '3') roleNameValue = 'CUSTOMER';
    }
    
    console.log('[Login Route] Final roleNameValue:', roleNameValue);
    console.log('[Login Route] Will set cookie:', roleNameValue ? 'YES' : 'NO');
    
    const authDTO = rawAuth
      ? {
          userID: rawAuth.userID ?? rawAuth.UserID ?? rawAuth.id ?? rawAuth.Id ?? rawAuth.ID,
          email: rawAuth.email ?? rawAuth.Email,
          username: rawAuth.username ?? rawAuth.Username ?? rawAuth.name ?? rawAuth.Name,
          roleName: roleNameValue,
          phoneNumber: rawAuth.phoneNumber ?? rawAuth.PhoneNumber ?? rawAuth.phone ?? rawAuth.Phone,
        }
      : null;

    // Create response with cookies for middleware
    const responseData = {
      success: true,
      token: data.token,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
      authDTO: data.authDTO,
      message: 'Login successful',
    };

    const jsonResponse = NextResponse.json(responseData);

    // Set httpOnly cookies for middleware
    if (token) {
      jsonResponse.cookies.set('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour
        path: '/',
      });
    }

    if (refreshToken) {
      jsonResponse.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
    }

    // Set role cookie for middleware routing
    if (authDTO?.roleName) {
      jsonResponse.cookies.set('role', authDTO.roleName, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour
        path: '/',
      });
    }

    return jsonResponse;
  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}