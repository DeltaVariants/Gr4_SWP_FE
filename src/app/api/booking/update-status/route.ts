import { NextRequest, NextResponse } from 'next/server';

// Normalize env base to avoid '/api/api' when joining
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'https://gr4-swp-be2-sp25.onrender.com';
const API_BASE = RAW_API_URL.replace(/\/+$/,'').replace(/\/api\/?$/,'');

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
  const url = `${API_BASE}/api/Booking/UpdateBookingStatus`;

    const forwardHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      const incomingAuth = req.headers.get('authorization');
      if (incomingAuth) {
        forwardHeaders['Authorization'] = incomingAuth;
      } else {
        try {
          const tokenCookie = req.cookies.get('token')?.value;
          if (tokenCookie) forwardHeaders['Authorization'] = `Bearer ${tokenCookie}`;
        } catch (e) {}
      }
      const incomingCookie = req.headers.get('cookie');
      if (incomingCookie) forwardHeaders['Cookie'] = incomingCookie;
    } catch (e) {}

    const response = await fetch(url, { method: 'PUT', headers: forwardHeaders, body: JSON.stringify(body) });
    let data: any = null;
    try { data = await response.json(); } catch (e) { data = { raw: await response.text().catch(() => '') }; }

    if (!response.ok) {
      return NextResponse.json({ success: false, message: data?.message || 'Backend error', backend: data }, { status: response.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[proxy booking update-status] error', error);
    return NextResponse.json({ success: false, message: 'Error connecting to backend' }, { status: 500 });
  }
}
