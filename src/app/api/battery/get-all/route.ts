import { NextRequest, NextResponse } from 'next/server';

// Use same fallback as other routes
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gr4-swp-be2-sp25.onrender.com';

export async function GET(req: NextRequest) {
  try {
    const url = `${API_URL}/api/Battery/getAllBatteries`;
    const forwardHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward Authorization or Cookie from the incoming request if present
    try {
      const incomingAuth = req.headers.get('authorization');
      const incomingCookie = req.headers.get('cookie');
      if (incomingAuth) forwardHeaders['Authorization'] = incomingAuth;
      if (incomingCookie) forwardHeaders['Cookie'] = incomingCookie;
    } catch (e) {
      // ignore header read errors
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: forwardHeaders,
    });

    // Try parse JSON, fallback to text
    let data: any = null;
    try {
      data = await response.json();
    } catch (e) {
      try {
        data = { raw: await response.text() };
      } catch (e2) {
        data = { raw: '<unreadable response>' };
      }
    }

    if (!response.ok) {
      console.error('[proxy getAllBatteries] backend error', { url, status: response.status, data });
      return NextResponse.json({ success: false, message: data?.message || 'Backend error', backend: data }, { status: response.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[proxy getAllBatteries] error', error);
    return NextResponse.json({ success: false, message: 'Error connecting to backend' }, { status: 500 });
  }
}
