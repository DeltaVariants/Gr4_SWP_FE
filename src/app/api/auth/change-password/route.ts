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

    // Backend validation:
    // - OldPassword: StringLength(6, MinimumLength = 6) - at least 6 characters
    // - NewPassword: MinLength(6) - at least 6 characters
    // - ConfirmNewPassword: MinLength(6) - at least 6 characters
    // Note: Let backend validate OldPassword - it might be correct but short
    
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

    // Call backend API: POST /api/Auth/change-password
    console.log('[change-password] Calling backend:', `${API_URL}/Auth/change-password`);
    console.log('[change-password] Token present:', !!token);
    console.log('[change-password] Payload:', JSON.stringify({ 
      OldPassword: '***', 
      NewPassword: '***', 
      ConfirmNewPassword: '***' 
    }));
    
    const response = await fetch(`${API_URL}/Auth/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload),
    });
    
    console.log('[change-password] Response status:', response.status);
    console.log('[change-password] Response headers:', Object.fromEntries(response.headers.entries()));

    // Handle response - try to parse as JSON, fallback to text
    let data: any = {};
    try {
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          // If not JSON, treat as plain text error message
          data = { message: text };
        }
      }
    } catch (e) {
      console.error('[change-password] Failed to read response:', e);
      data = { message: 'Failed to read response from server' };
    }
    
    console.log('[change-password] Response status:', response.status);
    console.log('[change-password] Response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      // Try to extract error message from various possible formats
      console.log('[change-password] Error response - full data:', JSON.stringify(data, null, 2));
      
      // Check for validation errors (ASP.NET Core format)
      let errorMessage = 
        data?.message || 
        data?.Message || 
        data?.error ||
        data?.Error;
      
      // Handle ASP.NET Core validation errors
      if (data?.errors && typeof data.errors === 'object') {
        const validationErrors: string[] = [];
        for (const [key, value] of Object.entries(data.errors)) {
          if (Array.isArray(value)) {
            validationErrors.push(`${key}: ${value.join(', ')}`);
          } else if (typeof value === 'string') {
            validationErrors.push(`${key}: ${value}`);
          }
        }
        if (validationErrors.length > 0) {
          errorMessage = validationErrors.join('; ');
        }
      }
      
      // Fallback
      if (!errorMessage) {
        errorMessage = typeof data === 'string' ? data : `Failed to change password (${response.status})`;
      }
      
      console.log('[change-password] Extracted error message:', errorMessage);
      return NextResponse.json({ success: false, message: errorMessage }, { status: response.status });
    }

    return NextResponse.json({ success: true, message: data?.message || 'Password changed successfully' });
  } catch (error: any) {
    console.error('[change-password] Error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
