import { NextRequest, NextResponse } from 'next/server';
import { codeDB } from '../fakeDB';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ success: false, message: 'Missing email or code' });
    }

    const savedCode = codeDB.get(email);

    if (!savedCode) {
      return NextResponse.json({ success: false, message: 'Code not found or expired' });
    }

    if (savedCode === code) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid code' });
    }
  } catch {
    return NextResponse.json({ success: false, message: 'Error verifying code' });
  }
}
