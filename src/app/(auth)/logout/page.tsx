'use client';

import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      console.log('🧹 Starting logout process...');
      
      // Clear localStorage
      try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role');
        console.log('✅ localStorage cleared');
      } catch (e) {
        console.error('Error clearing localStorage:', e);
      }
      
      // Clear cookies via API
      try {
        await fetch('/api/auth/logout-local', { method: 'POST' });
        console.log('✅ Logout API called');
      } catch (e) {
        console.error('Error calling logout API:', e);
      }
      
      // Force clear cookies on client side
      try {
        const cookiesToClear = ['token', 'accessToken', 'refreshToken', 'role'];
        cookiesToClear.forEach(cookieName => {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
        console.log('✅ Cookies cleared');
      } catch (e) {
        console.error('Error clearing cookies:', e);
      }
      
      console.log('✨ Logout complete! Redirecting...');
      
      // Wait a bit then redirect
      setTimeout(() => {
        router.replace('/login');
        // Force reload to clear any cached state
        setTimeout(() => window.location.href = '/login', 100);
      }, 500);
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-xl text-gray-700 mb-4">🧹 Signing out...</div>
        <div className="text-sm text-gray-500">Clearing authentication data...</div>
      </div>
    </div>
  );
}
