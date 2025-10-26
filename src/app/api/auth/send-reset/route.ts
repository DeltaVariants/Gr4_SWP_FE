import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ForgotPasswordRequest {
  email: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // DEV DEBUG: log incoming request body and some headers to help trace 500s.
    try {
      // Avoid logging full cookie/header values in prod; this is dev-only.
      const headersToShow: Record<string, string> = {};
      [ 'content-type', 'user-agent', 'referer', 'origin' ].forEach((h) => {
        const v = req.headers.get(h);
        if (v) headersToShow[h] = v;
      });
      console.log('[send-reset] incoming', { body, headers: headersToShow });
    } catch (e) {
      console.warn('[send-reset] failed to log incoming request', e);
    }
    
    // Validate request body
    if (!body.email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email is required' 
      }, { status: 400 });
    }

    const forgotRequest: ForgotPasswordRequest = {
      email: body.email
    };

    if (!API_URL) {
      console.error('[send-reset] NEXT_PUBLIC_API_URL not set');
      return NextResponse.json({ success: false, message: 'Backend API URL not configured' }, { status: 500 });
    }

    const url = `${API_URL}/api/Auth/forgot-password`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    let data: any = null;
    try {
      data = await response.json();
    } catch (e) {
      // backend returned non-json body
      try {
        data = { raw: await response.text() };
      } catch (e2) {
        data = { raw: '<unreadable response body>' };
      }
    }

    if (!response.ok) {
      // Log full backend response for dev troubleshooting
      console.error('[send-reset] backend error', { url, status: response.status, data });
      return NextResponse.json({ 
        success: false, 
        message: data?.message || 'Error sending reset code',
        backend: data,
      }, { status: response.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Error connecting to server' 
    }, { status: 500 });
  }
}
