'use client';

import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      try {
        
        await fetch('/api/auth/logout-local', { method: 'POST' });
      } catch {}
      try {
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } catch {}
      router.replace('/login');
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-700">Đang đăng xuất...</div>
    </div>
  );
}
