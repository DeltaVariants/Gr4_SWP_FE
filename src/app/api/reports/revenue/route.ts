import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gr4-swp-be2-sp25.onrender.com/api';

export async function GET(req: NextRequest) {
  try {
    const qs = req.nextUrl.searchParams.toString();
    const url = `${API_URL}/reports/daily-revenue${qs?('?'+qs):''}`;
    const forwardHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    const incomingAuth = req.headers.get('authorization');
    const incomingCookie = req.headers.get('cookie');
    if (incomingAuth) forwardHeaders['Authorization'] = incomingAuth;
    if (incomingCookie) forwardHeaders['Cookie'] = incomingCookie;

    console.log('[reports/revenue] Request:', {
      url,
      hasAuth: !!incomingAuth,
      hasCookie: !!incomingCookie
    });

    const resp = await fetch(url, { method: 'GET', headers: forwardHeaders });
    const text = await resp.text().catch(() => '');
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
    
    if (!resp.ok) {
      console.error('[reports/revenue] Backend error:', {
        status: resp.status,
        data
      });
      return NextResponse.json({ success: false, message: data?.message || 'Backend error', backend: data }, { status: resp.status });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error('[proxy reports revenue] error', e);
    return NextResponse.json({ success: false, message: 'Error connecting to backend' }, { status: 500 });
  }
}
