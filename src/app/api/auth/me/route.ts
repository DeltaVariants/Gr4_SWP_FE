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
      token = req.cookies.get('token')?.value;
    }

    if (!token) {
      // DEV LOG: show whether an Authorization header or token cookie was present
      try {
        if (process.env.NODE_ENV === 'development') {
          const incomingAuth = req.headers.get('authorization');
          const incomingCookie = req.headers.get('cookie');
          const tokenCookie = req.cookies.get('token')?.value;
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

    const resp = await fetch(`${API_URL}/Auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    
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
          const tokenCookie = req.cookies.get('token')?.value;
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

    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
