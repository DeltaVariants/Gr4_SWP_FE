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
        resp = await fetch(`${API_URL}/Auth/me`, {
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
    let data: any = {};
    let raw = '';
    if (contentType.includes('application/json')) {
      data = await resp.json().catch(() => ({}));
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
          console.log('[proxy auth me] backend returned status:', resp.status, 'message:', data?.message || raw || 'no message');
          console.log('[proxy auth me] forwarded incomingAuth present:', !!incomingAuth, 'masked:', maskedIncomingAuth);
          console.log('[proxy auth me] forwarded cookie header present:', !!incomingCookie, 'tokenCookie:', maskedCookie);
        }
      } catch (e) {}

      const message = data?.message || data?.error || raw || 'Failed to fetch profile';
      const status = resp.status || 500;
      return NextResponse.json({ success: false, message }, { status });
    }

    // Log stationId/stationName for debugging
    if (process.env.NODE_ENV === 'development') {
      const stationId = data?.stationId || data?.StationID || data?.stationID || data?.StationId;
      const stationName = data?.stationName || data?.StationName;
      console.log('[auth/me] User data received');
      console.log('[auth/me] - stationId:', stationId || 'NOT FOUND');
      console.log('[auth/me] - stationName:', stationName || 'NOT FOUND');
      if (!stationId && !stationName && data) {
        console.log('[auth/me] - Available keys:', Object.keys(data));
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error('[auth/me] Error:', e);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
