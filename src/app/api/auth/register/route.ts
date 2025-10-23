import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gr4-swp-be2-sp25.onrender.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phoneNumber } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: 'name, email, password are required' }, { status: 400 });
    }

    // Map FE fields to BE expected payload
    const payload = {
      Username: name,
      Email: email,
      Password: password,
      PhoneNumber: phoneNumber || ''
    };

    const response = await fetch(`${API_URL}/api/Auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // Do not forward cookies/credentials by default
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = (data && (data.message || data.error)) || 'Register failed';
      return NextResponse.json({ success: false, message }, { status: response.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Register proxy error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
