import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gr4-swp-be2-sp25.onrender.com/api';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const incomingAuth = req.headers.get('authorization');
    const body = await req.json().catch(() => ({}));

    const url = `${API_URL}/bookings/${encodeURIComponent(id)}`;

    console.log('[bookings/:id PATCH] Proxying to:', url);
    console.log('[bookings/:id PATCH] Body:', body);

    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(incomingAuth && { Authorization: incomingAuth }),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    console.log('[bookings/:id PATCH] Response:', {
      status: res.status,
      ok: res.ok,
      data,
    });

    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error('[proxy bookings/:id PATCH] error', e);
    return NextResponse.json({ error: 'Internal proxy error' }, { status: 500 });
  }
}
