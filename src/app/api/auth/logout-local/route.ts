import { NextResponse } from 'next/server';

export async function POST() {
  console.log('[Logout API] Clearing all auth cookies...');
  
  const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
 
  // Clear all possible cookie names
  const cookiesToClear = ['token', 'accessToken', 'refreshToken', 'role'];
  cookiesToClear.forEach(cookieName => {
    res.cookies.set(cookieName, '', { 
      path: '/', 
      maxAge: 0,
      httpOnly: true,
      sameSite: 'lax',
    });
    console.log(`[Logout API] Cleared cookie: ${cookieName}`);
  });
  
  return res;
}
