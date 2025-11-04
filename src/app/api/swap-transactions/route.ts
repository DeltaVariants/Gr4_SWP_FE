import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gr4-swp-be2-sp25.onrender.com/api';

export async function GET(req: NextRequest) {
  try {
    const incomingAuth = req.headers.get('authorization');
    const url = `${API_URL}/swap-transactions`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        ...(incomingAuth && { Authorization: incomingAuth }),
      },
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error('[proxy swap-transactions GET] error', e);
    return NextResponse.json({ error: 'Internal proxy error' }, { status: 500 });
  }
}
