import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gr4-swp-be2-sp25.onrender.com/api';

export async function POST(req: NextRequest) {
  try {
    // Get token from Authorization header or cookie
    const incomingAuth = req.headers.get('authorization');
    let token = undefined;
    if (incomingAuth) {
      token = incomingAuth.replace(/^Bearer\s+/i, '');
    } else {
      token = req.cookies.get('accessToken')?.value || req.cookies.get('token')?.value;
    }

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await req.json();
    const { currentPassword, newPassword } = body || {};

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'currentPassword and newPassword are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Map frontend format to backend format
    // Backend expects: { OldPassword, NewPassword, ConfirmNewPassword }
    const backendPayload = {
      OldPassword: currentPassword,
      NewPassword: newPassword,
      ConfirmNewPassword: newPassword, // Use newPassword as confirmation
    };

    // Call backend API: POST /api/auth/change-password
    const response = await fetch(`${API_URL}/Auth/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.message || data?.Message || 'Failed to change password';
      return NextResponse.json({ success: false, message }, { status: response.status });
    }

    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    console.error('[change-password] Error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
