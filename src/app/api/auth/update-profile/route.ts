import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gr4-swp-be2-sp25.onrender.com/api';

export async function PUT(req: NextRequest) {
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

    // Get current user to get userId and email
    const meResponse = await fetch(`${API_URL}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!meResponse.ok) {
      return NextResponse.json({ success: false, message: 'Failed to get user info' }, { status: 401 });
    }

    const meData = await meResponse.json();
    const userData = meData?.Data || meData?.data || meData;
    const userId = userData?.UserID || userData?.userID || userData?.id;
    const currentEmail = userData?.Email || userData?.email;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID not found' }, { status: 400 });
    }

    // Get request body
    const body = await req.json();
    const { name, phoneNumber } = body || {};

    if (!name && !phoneNumber) {
      return NextResponse.json({ success: false, message: 'At least one field (name or phoneNumber) must be provided' }, { status: 400 });
    }

    // Map frontend format to backend format
    // Backend expects: { Username, PhoneNumber, Email }
    const backendPayload = {
      Username: name || userData?.Username || userData?.username || '',
      PhoneNumber: phoneNumber || userData?.PhoneNumber || userData?.phoneNumber || '',
      Email: currentEmail || '', // Keep current email
    };

    // Call backend API: PATCH /api/users/{id}
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.message || data?.Message || 'Failed to update profile';
      return NextResponse.json({ success: false, message }, { status: response.status });
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });
  } catch (error: any) {
    console.error('[update-profile] Error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
