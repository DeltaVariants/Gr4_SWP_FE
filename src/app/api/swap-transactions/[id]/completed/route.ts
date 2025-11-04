import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gr4-swp-be2-sp25.onrender.com/api';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const incomingAuth = req.headers.get('authorization');
    const body = await req.json().catch(() => ({}));

    const url = `${API_URL}/swap-transactions/${encodeURIComponent(id)}/completed`;

    console.log('[swap-transactions/completed] Proxying to:', url);
    console.log('[swap-transactions/completed] Auth header:', incomingAuth ? 'Present' : 'Missing');
    console.log('[swap-transactions/completed] Body:', body);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(incomingAuth && { Authorization: incomingAuth }),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    console.log('[swap-transactions/completed] Backend response:', {
      status: res.status,
      ok: res.ok,
      data,
    });

    if (!res.ok) {
      console.error('[swap-transactions/completed] Backend error:', data);
    }

    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error('[proxy swap-transactions/completed] error', e);
    return NextResponse.json({ error: 'Internal proxy error' }, { status: 500 });
  }
}
