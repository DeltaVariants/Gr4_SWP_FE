import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const STRICT_VERIFY = process.env.NEXT_PUBLIC_STRICT_VERIFY === 'true';
const VERIFY_CODE_PATH = process.env.NEXT_PUBLIC_AUTH_VERIFY_CODE_PATH || '/api/Auth/verifyCode';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const email = body?.email;
    const code = body?.code;
    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: 'Email and code are required' },
        { status: 400 }
      );
    }

    // If strict mode is enabled and BE provides verify-only endpoint, call it directly.
    if (STRICT_VERIFY) {
      const url = `${API_URL}${VERIFY_CODE_PATH}`;
      const resp = await fetch(url, {



        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok) return NextResponse.json({ success: true, data });
      return NextResponse.json(
        { success: false, message: data?.message || 'Invalid or expired code' },
        { status: resp.status || 400 }
      );
    }

    // Non-strict: Try common verify-only endpoints on backend, fallback if needed
    const endpoints = [
      `${API_URL}/api/Auth/verifyCode`,
    ];

    let lastError: { status: number; message: string } | null = null;

    for (const url of endpoints) {
      try {
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code }),
        });

        const data = await resp.json().catch(() => ({}));

        if (resp.ok) {
          return NextResponse.json({ success: true, data });
        }

        // If endpoint explicitly requires password fields (combined endpoint),
        // consider this a soft-success to proceed to new password step where BE will fully validate.
        if (
          resp.status === 400 && (
            /password|newpassword|confirm/i.test(String(data?.message || '')) ||
            new URL(url).pathname.toLowerCase().endsWith('/api/auth/verify-reset-password')
          )
        ) {
          return NextResponse.json({ success: true, data: { requiresPassword: true } });
        }

        // Save last error and continue trying next endpoint
        lastError = {
          status: resp.status,
          message: data?.message || `Backend responded ${resp.status} for ${new URL(url).pathname}`,
        };
      } catch (e: unknown) {
        lastError = { status: 500, message: 'Failed to reach backend' };
        // try next
      }
    }

    // If we reach here, all attempts failed
    return NextResponse.json(
      { success: false, message: lastError?.message || 'Error verifying code' },
      { status: lastError?.status || 500 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error connecting to server' },
      { status: 500 }
    );
  }
}
