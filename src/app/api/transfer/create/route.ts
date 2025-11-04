import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gr4-swp-be2-sp25.onrender.com/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    
    // Use same base endpoint as update-status route
    const url = `${API_URL}/battery-transfers`;
    
    const forwardHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    const incomingAuth = req.headers.get('authorization');
    const incomingCookie = req.headers.get('cookie');
    if (incomingAuth) forwardHeaders['Authorization'] = incomingAuth;
    if (incomingCookie) forwardHeaders['Cookie'] = incomingCookie;
    
    console.log('[transfer/create] Proxying to:', url);
    console.log('[transfer/create] Auth header:', incomingAuth ? 'Present' : 'Missing');
    console.log('[transfer/create] Body:', body);

    const resp = await fetch(url, { method: 'POST', headers: forwardHeaders, body });
    const text = await resp.text().catch(() => '');
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
    
    console.log('[transfer/create] Backend response:', {
      status: resp.status,
      ok: resp.ok,
      data
    });
    
    if (!resp.ok) {
      console.error('[transfer/create] Backend error:', data);
      return NextResponse.json({ success: false, message: data?.message || 'Backend error', backend: data }, { status: resp.status });
    }
    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error('[proxy transfer create] error', e);
    return NextResponse.json({ success: false, message: 'Error connecting to backend' }, { status: 500 });
  }
}
