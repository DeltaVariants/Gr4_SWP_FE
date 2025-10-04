import { NextRequest, NextResponse } from 'next/server';
import { codeDB } from '../fakeDB';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ success: false, message: 'Email missing' });

  const code = '12345'; // code cứng
  codeDB.set(email, code);
  console.log(`[FAKE DB] Code for ${email}: ${code}`);

  return NextResponse.json({ success: true });
}
