import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gr4-swp-be2-sp25.onrender.com/api';

export async function GET(req: NextRequest) {
  try {
    const incomingAuth = req.headers.get('authorization');
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();
    
    const url = queryString 
      ? `${API_URL}/bookings?${queryString}`
      : `${API_URL}/bookings`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        ...(incomingAuth && { Authorization: incomingAuth }),
      },
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error('[proxy bookings GET] error', e);
    return NextResponse.json({ error: 'Internal proxy error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const incomingAuth = req.headers.get('authorization');
    const body = await req.json().catch(() => ({}));
    const url = `${API_URL}/bookings`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(incomingAuth && { Authorization: incomingAuth }),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error('[proxy bookings POST] error', e);
    return NextResponse.json({ error: 'Internal proxy error' }, { status: 500 });
  }
}
