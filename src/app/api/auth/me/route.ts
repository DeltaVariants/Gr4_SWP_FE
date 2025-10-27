import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gr4-swp-be2-sp25.onrender.com';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const resp = await fetch(`${API_URL}/api/Auth/me`, {
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
      const message = data?.message || data?.error || raw || 'Failed to fetch profile';
      const status = resp.status || 500;
      return NextResponse.json({ success: false, message }, { status });
    }

    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
