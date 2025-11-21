import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gr4-swp-be2-sp25.onrender.com/api';

export async function GET(req: NextRequest) {
  try {
    // Prefer explicit Authorization header from incoming request (client may send Bearer token)
    const incomingAuth = req.headers.get('authorization');
    let token = undefined;
    if (incomingAuth) {
      token = incomingAuth.replace(/^Bearer\s+/i, '');
    } else {
      // Try both cookie names (accessToken is new, token is legacy)
      token = req.cookies.get('accessToken')?.value || req.cookies.get('token')?.value;
    }

    if (!token) {
      // DEV LOG: show whether an Authorization header or token cookie was present
      try {
        if (process.env.NODE_ENV === 'development') {
          const incomingAuth = req.headers.get('authorization');
          const incomingCookie = req.headers.get('cookie');
          const tokenCookie = req.cookies.get('accessToken')?.value || req.cookies.get('token')?.value;
          const maskedCookie = tokenCookie ? `${tokenCookie.slice(0,8)}...(${tokenCookie.length}ch)` : null;
          const maskedIncomingAuth = incomingAuth ? (() => {
            try { const t = incomingAuth.replace(/^Bearer\s+/i, ''); return `${t.slice(0,8)}...(${t.length}ch)`; } catch { return 'present'; }
          })() : null;
          console.log('[proxy auth me] incomingAuth present:', !!incomingAuth, 'masked:', maskedIncomingAuth);
          console.log('[proxy auth me] cookie header present:', !!incomingCookie, 'tokenCookie:', maskedCookie);
        }
      } catch (e) {}

      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Retry logic for 502 errors (backend cold start)
    let resp;
    let retries = 3;
    let lastError;
    
    for (let i = 0; i < retries; i++) {
      try {
        resp = await fetch(`${API_URL}/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(10000), // 10s timeout
        });
        
        // If we get 502, retry after delay
        if (resp.status === 502 && i < retries - 1) {
          console.log(`[auth/me] Got 502, retrying (${i + 1}/${retries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
          continue;
        }
        
        break; // Success or non-502 error, exit retry loop
      } catch (error) {
        lastError = error;
        if (i < retries - 1) {
          console.log(`[auth/me] Fetch error, retrying (${i + 1}/${retries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }
    
    if (!resp) {
      console.error('[auth/me] All retries failed:', lastError);
      return NextResponse.json(
        { success: false, message: 'Backend temporarily unavailable' },
        { status: 503 }
      );
    }

    const contentType = resp.headers.get('content-type') || '';
    let backendResponse: any = {};
    let raw = '';
    if (contentType.includes('application/json')) {
      backendResponse = await resp.json().catch(() => ({}));
    } else {
      raw = await resp.text().catch(() => '');
    }

    if (!resp.ok) {
      // DEV LOG: surface backend response (mask token values) to help debugging
      try {
        if (process.env.NODE_ENV === 'development') {
          const incomingAuth = req.headers.get('authorization');
          const incomingCookie = req.headers.get('cookie');
          const tokenCookie = req.cookies.get('accessToken')?.value || req.cookies.get('token')?.value;
          const maskedCookie = tokenCookie ? `${tokenCookie.slice(0,8)}...(${tokenCookie.length}ch)` : null;
          const maskedIncomingAuth = incomingAuth ? (() => {
            try { const t = incomingAuth.replace(/^Bearer\s+/i, ''); return `${t.slice(0,8)}...(${t.length}ch)`; } catch { return 'present'; }
          })() : null;
          
          console.error('[proxy auth me] ❌ Backend error:', resp.status);
          console.error('[proxy auth me] Backend URL called:', `${API_URL}/me`);
          console.error('[proxy auth me] Backend response:', JSON.stringify(backendResponse, null, 2));
          console.error('[proxy auth me] Forwarded incomingAuth present:', !!incomingAuth, 'masked:', maskedIncomingAuth);
          console.error('[proxy auth me] Forwarded cookie header present:', !!incomingCookie, 'tokenCookie:', maskedCookie);
          
          // Decode token to check user info (for debugging)
          if (tokenCookie) {
            try {
              const parts = tokenCookie.split('.');
              if (parts.length >= 2) {
                const payload = JSON.parse(atob(parts[1]));
                console.error('[proxy auth me] Token payload:', {
                  userId: payload.nameid || payload.unique_name,
                  email: payload.email,
                  role: payload.role,
                  stationID: payload.StationID || payload.stationID,
                });
              }
            } catch (e) {
              console.error('[proxy auth me] Could not decode token:', e);
            }
          }
        }
      } catch (e) {
        console.error('[proxy auth me] Error in logging:', e);
      }

      // Backend returns ApiResponse format: { Success: false, Message: "...", Data: null }
      // Or camelCase: { success: false, message: "...", data: null }
      const message = backendResponse?.Message || backendResponse?.message || backendResponse?.error || raw || 'Failed to fetch profile';
      const status = resp.status || 500;
      
      // Log specific error for staff users
      if (message.includes('Object reference not set') || message.includes('NullReferenceException')) {
        console.error('[proxy auth me] ⚠️ Backend NullReferenceException - likely _stationService not injected when user has StationID');
      }
      
      return NextResponse.json({ success: false, message }, { status });
    }

    // Backend returns ApiResponse format: { Success: true, Message: "OK", Data: {...} }
    // ASP.NET Core may serialize as camelCase: { success: true, message: "OK", data: {...} }
    // Extract data from ApiResponse.Data (handle both PascalCase and camelCase)
    const userData = backendResponse?.Data || backendResponse?.data || backendResponse;
    
    // Validate that we got user data
    if (!userData || typeof userData !== 'object') {
      console.error('[auth/me] Invalid user data structure:', backendResponse);
      return NextResponse.json(
        { success: false, message: 'Invalid response format from backend' },
        { status: 500 }
      );
    }
    
    // Log full response structure for debugging (staff needs StationID)
    if (process.env.NODE_ENV === 'development') {
      // Try all possible field name variations (backend may use different casing)
      const stationId = userData?.stationID || 
                       userData?.StationID || 
                       userData?.stationId || 
                       userData?.StationId ||
                       userData?.station_id ||
                       (userData as any)?.StationID;
      const stationName = userData?.stationName || 
                         userData?.StationName || 
                         userData?.station_name ||
                         (userData as any)?.StationName;
      const roleName = userData?.roleName || 
                      userData?.RoleName || 
                      userData?.role ||
                      (userData as any)?.RoleName;
      
      // Check if user is staff/employee (needs stationID) or customer/driver (doesn't need stationID)
      const isStaffRole = roleName === 'Staff' || roleName === 'STAFF' || roleName === 'Employee' || roleName === 'EMPLOYEE';
      const isCustomerRole = roleName === 'Customer' || roleName === 'CUSTOMER' || roleName === 'Driver' || roleName === 'DRIVER';
      
      console.log('[auth/me] Backend response structure:', {
        hasSuccess: 'Success' in backendResponse || 'success' in backendResponse,
        hasData: 'Data' in backendResponse || 'data' in backendResponse,
        responseKeys: Object.keys(backendResponse || {}),
        userDataKeys: Object.keys(userData || {}),
      });
      
      console.log('[auth/me] User data received:');
      console.log('[auth/me] - roleName:', roleName || 'NOT FOUND');
      
      // Only log stationID/stationName for staff roles (customers don't have stations)
      if (isStaffRole) {
        console.log('[auth/me] - stationId:', stationId || 'NOT FOUND');
        console.log('[auth/me] - stationName:', stationName || 'NOT FOUND');
        
        // Warn if staff role but no StationID
        if (!stationId) {
          console.warn('[auth/me] ⚠️ Staff user but no StationID found! This may cause issues.');
        }
      } else if (isCustomerRole) {
        // Customer/Driver roles don't need stationID - this is normal
        console.log('[auth/me] - Customer/Driver role - stationID not required');
      }
      
      // Only log available keys if staff role and missing station info
      if (isStaffRole && !stationId && !stationName && userData) {
        console.log('[auth/me] - Available userData keys:', Object.keys(userData));
      }
    }

    // Set cookies for middleware to recognize auth state
    const response = NextResponse.json({ success: true, data: userData });
    
    // Set accessToken cookie (if we have it from request)
    if (token) {
      response.cookies.set('accessToken', token, {
        httpOnly: false, // Need to be accessible by client-side code
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }
    
    // Set role cookie for middleware
    const roleName = userData?.roleName || userData?.RoleName || userData?.role;
    if (roleName) {
      response.cookies.set('role', roleName.toUpperCase(), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return response;
  } catch (e) {
    console.error('[auth/me] Error:', e);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
