import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gr4-swp-be2-sp25.onrender.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phoneNumber } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: 'name, email, password are required' }, { status: 400 });
    }

    
    const payload = {
      Username: name,
      username: name,
      Email: email,
      email: email,
      Password: password,
      password: password,
      PhoneNumber: phoneNumber || '',
      phoneNumber: phoneNumber || '',
    } as Record<string, string>;

    const response = await fetch(`${API_URL}/api/Auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
      
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json().catch(() => ({}))
      : { raw: await response.text().catch(() => '') };

    if (!response.ok) {
      let message = (data && (data.message || data.error)) || (data as any)?.raw || 'Register failed';
      
      if (response.status === 409) {
        message = 'Email đã tồn tại, vui lòng sử dụng email khác';
      }
      return NextResponse.json({ success: false, message }, { status: response.status });
    }


    const normalized = (data && ((data as any).data || (data as any).Data)) || data;
    return NextResponse.json({ success: true, data: normalized });
  } catch (error: any) {
    console.error('Register proxy error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
