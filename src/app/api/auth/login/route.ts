import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gr4-swp-be2-sp25.onrender.com/api';

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

    // API_URL đã có /api ở cuối rồi (từ .env), chỉ cần thêm /Auth/login
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

    // Backend trả về trực tiếp: { token, refreshToken, expiresAt, authDTO }
    // Return đúng format mà không cần parse phức tạp
    return NextResponse.json({
      success: true,
      token: data.token,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
      authDTO: data.authDTO,
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