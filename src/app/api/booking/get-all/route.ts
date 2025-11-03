import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gr4-swp-be2-sp25.onrender.com/api';

export async function GET(req: NextRequest) {
  try {
    const stationIDParam = req.nextUrl.searchParams.get('stationID');

    // Try to decode token early so we can pick the correct backend endpoint
    const incomingAuthHeader = req.headers.get('authorization');
    const tokenCookieRaw = req.cookies.get('token')?.value;
    const rawToken = incomingAuthHeader ? incomingAuthHeader.replace(/^Bearer\s+/i, '') : tokenCookieRaw;

    let decodedToken: any = null;
    try {
      if (rawToken) {
        const parts = rawToken.split('.');
        if (parts.length >= 2) {
          const payload = parts[1];
          decodedToken = JSON.parse(Buffer.from(payload.padEnd(Math.ceil(payload.length / 4) * 4, '='), 'base64').toString('utf8'));
        }
      }
    } catch (e) {
      // ignore decode errors
      decodedToken = null;
    }

    // Determine stationID to use: prefer explicit query param, fallback to token claim when role=Staff
    let stationID = stationIDParam || null;
    const tokenRole = decodedToken ? (decodedToken.role || decodedToken.RoleName || decodedToken.roleName || decodedToken.unique_name) : null;
    const tokenStationId = decodedToken ? (decodedToken.stationId || decodedToken.StationID || decodedToken.stationID || decodedToken.StationId) : null;

    if (!stationID && tokenRole && tokenRole.toString().toLowerCase() === 'staff' && tokenStationId) {
      stationID = tokenStationId;
    }

  // Fallback: if still no stationID but we have a token, try fetching the user's profile from backend
  // to obtain station association (some setups don't embed station in JWT).
    if (!stationID && rawToken) {
      try {
        const meResp = await fetch(`${API_URL}/Auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${rawToken}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });
        const meText = await meResp.text().catch(() => '');
        let meJson: any = null;
        try { meJson = meText ? JSON.parse(meText) : null; } catch { meJson = null; }
        const userObj = meJson && meJson.success ? meJson.data : meJson;
        const fetchedStation = userObj ? (userObj.stationId || userObj.StationID || userObj.stationID || userObj.StationId) : null;
        if (fetchedStation) {
          stationID = fetchedStation;
        }
      } catch (e) {
        // ignore errors from profile fetch; we'll fall back to global endpoint
      }
    }

    // If the token role is Staff and we still don't have a stationID, reject early with clear 403
    if ((!stationID) && tokenRole && tokenRole.toString().toLowerCase() === 'staff') {
      return NextResponse.json({ success: false, message: 'Staff users must specify stationID or have station assigned in profile/token' }, { status: 403 });
    }

    const url = stationID
      ? `${API_URL}/stations/bookings?stationID=${encodeURIComponent(stationID)}`
      : `${API_URL}/bookings`;

    const forwardHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      // Prefer explicit Authorization header
      const incomingAuth = req.headers.get('authorization');
      if (incomingAuth) {
        forwardHeaders['Authorization'] = incomingAuth;
      } else {
        // Fallback: check cookie named 'token' (set by AuthContext/session)
        try {
          const tokenCookie = req.cookies.get('token')?.value;
          if (tokenCookie) forwardHeaders['Authorization'] = `Bearer ${tokenCookie}`;
        } catch (e) {}
      }

      // Forward raw cookie header as well so backend can read other cookies if needed
      const incomingCookie = req.headers.get('cookie');
      if (incomingCookie) forwardHeaders['Cookie'] = incomingCookie;

      // DEV LOG: print presence of auth/cookie and (masked) token cookie if available
      try {
        if (process.env.NODE_ENV === 'development') {
          const tokenCookie = req.cookies.get('token')?.value;
          const maskedCookie = tokenCookie ? `${tokenCookie.slice(0, 8)}...(${tokenCookie.length}ch)` : null;
          // incomingAuth may be like 'Bearer <token>' — mask it as well
          const maskedIncomingAuth = incomingAuth ? (() => {
            try {
              const t = incomingAuth.replace(/^Bearer\s+/i, '');
              return `${t.slice(0,8)}...(${t.length}ch)`;
            } catch { return 'present'; }
          })() : null;

          console.log('[proxy booking get-all] incomingAuth present:', !!incomingAuth, 'masked:', maskedIncomingAuth);
          console.log('[proxy booking get-all] cookie header present:', !!incomingCookie, 'tokenCookie:', maskedCookie);
        }
      } catch (e) {}
    } catch (e) {}

    // Perform fetch to backend
    const response = await fetch(url, { method: 'GET', headers: forwardHeaders });

    // Read backend response as text first so we can log raw body if needed
    const respText = await response.text().catch(() => '');
    let data: any = null;
    try {
      data = respText ? JSON.parse(respText) : null;
    } catch (e) {
      data = { raw: respText };
    }

    // DEV LOG: more verbose info to help debug 403
    try {
      if (process.env.NODE_ENV === 'development') {
        // decode token payload if present (mask token and show role/nameid/exp)
        const incomingAuth = req.headers.get('authorization');
        const tokenCookie = req.cookies.get('token')?.value;
        const rawToken = incomingAuth ? incomingAuth.replace(/^Bearer\s+/i, '') : tokenCookie;
        let decoded: any = null;
        if (rawToken) {
          try {
            const parts = rawToken.split('.');
            if (parts.length >= 2) {
              const payload = parts[1];
              const json = JSON.parse(Buffer.from(payload.padEnd(Math.ceil(payload.length/4)*4,'='), 'base64').toString('utf8'));
              decoded = {
                role: json.role || json.RoleName || json.roleName || json.unique_name || null,
                nameid: json.nameid || json.sub || null,
                exp: json.exp || null,
              };
            }
          } catch (e) { /* ignore decode errors */ }
        }

        console.log('[proxy booking get-all] -> backend URL:', url);
        console.log('[proxy booking get-all] forwarded headers:', Object.keys(forwardHeaders));
        console.log('[proxy booking get-all] stationID param present:', !!req.nextUrl.searchParams.get('stationID'), 'value:', req.nextUrl.searchParams.get('stationID'));
        console.log('[proxy booking get-all] decoded token payload snippet:', decoded ? decoded : 'no-token');
        console.log('[proxy booking get-all] backend status:', response.status, 'response body (raw):', respText || '<empty>');
      }
    } catch (e) {}

    if (!response.ok) {
      return NextResponse.json({ success: false, message: data?.message || 'Backend error', backend: data }, { status: response.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[proxy booking get-all] error', error);
    return NextResponse.json({ success: false, message: 'Error connecting to backend' }, { status: 500 });
  }
}
