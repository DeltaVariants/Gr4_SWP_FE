"use client";

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setIsAuthenticated } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Google login...');

  // Accept multiple possible token param names from BE
  const token = useMemo(() => {
    return (
      searchParams.get('token') ||
      searchParams.get('Token') ||
      searchParams.get('access_token') ||
      null
    );
  }, [searchParams]);
  const userInfoRaw = useMemo(() => searchParams.get('user'), [searchParams]);
  const error = useMemo(() => searchParams.get('error'), [searchParams]);

  useEffect(() => {
    const handle = async () => {
      try {
        if (error) throw new Error(decodeURIComponent(error));

        if (!token) {
          setStatus('error');
          setMessage('Missing token from Google callback');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        // Save token locally
        localStorage.setItem('accessToken', token);

        // Parse user if provided; otherwise try to fetch via /api/Auth/me
        let role = 'Driver';
        let haveUser = false;
        if (userInfoRaw) {
          try {
            const userObj = JSON.parse(decodeURIComponent(userInfoRaw));
            setUser({
              id: userObj.UserID || userObj.userID,
              email: userObj.Email || userObj.email,
              name: userObj.Username || userObj.username,
              role: userObj.RoleName || userObj.roleName || 'Driver',
              phone: userObj.PhoneNumber || userObj.phoneNumber,
            });
            role = userObj.RoleName || userObj.roleName || role;
            haveUser = true;
          } catch (e) {
            // ignore parse error
          }
        }

        if (!haveUser) {
          try {
            // Use Next.js rewrite to BE; same-origin call
            const resp = await fetch('/api/Auth/me', {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (resp.ok) {
              const me = await resp.json();
              setUser({
                id: me.UserID || me.userID || me.id,
                email: me.Email || me.email,
                name: me.Username || me.username || me.name,
                role: me.RoleName || me.roleName || me.role || 'Driver',
                phone: me.PhoneNumber || me.phoneNumber || me.phone,
              });
              role = me.RoleName || me.roleName || me.role || role;
            }
          } catch {
            // ignore, fallback to token only
          }
        }

        setIsAuthenticated(true);

        setStatus('success');
        setMessage('Google login successful! Redirecting...');
        const redirectPath = getRedirectPathByRole(role);
        setTimeout(() => router.push(redirectPath), 1200);
      } catch (err: any) {
        setStatus('error');
        setMessage(err?.message || 'Google login failed');
        setTimeout(() => router.push('/login'), 2000);
      }
    };

    handle();
  }, [error, router, setIsAuthenticated, setUser, token, userInfoRaw]);

  const getRedirectPathByRole = (role: string): string => {
    switch ((role || '').toUpperCase()) {
      case 'ADMIN':
        return '/admin';
      case 'EMPLOYEE':
        return '/employee';
      case 'DRIVER':
      case 'CUSTOMER':
        return '/customer';
      default:
        return '/dashboard';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-md text-center">
        <h1 className="text-xl font-semibold mb-2">Google Authentication</h1>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow w-full max-w-md text-center">
          <h1 className="text-xl font-semibold mb-2">Google Authentication</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
