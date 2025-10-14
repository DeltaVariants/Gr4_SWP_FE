import { NextRequest, NextResponse } from 'next/server';
import { codeDB } from '../fakeDB';

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword } = await req.json();
    if (!email || !code || !newPassword) {
      return NextResponse.json({ success: false, message: 'Missing fields' });
    }

    const savedCode = codeDB.get(email);
    if (!savedCode || savedCode !== code) {
      return NextResponse.json({ success: false, message: 'Invalid or expired code' });
    }

    codeDB.delete(email); // xóa code sau khi reset thành công
    console.log(`[FAKE DB] Password for ${email} reset to: ${newPassword}`);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: 'Error resetting password' });
  }
}
