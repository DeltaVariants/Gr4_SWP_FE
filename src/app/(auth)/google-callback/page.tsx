"use client";

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getRedirectPathByRole } from '@/lib/roleUtils';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setIsAuthenticated } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Google login...');

 
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

  // Save token locally and as cookie for middleware
  localStorage.setItem('accessToken', token);
  try { document.cookie = `token=${token}; path=/`; } catch {}

        
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
            try { document.cookie = `role=${role}; path=/`; } catch {}
          } catch (e) {
           
          }
        }

        if (!haveUser) {
          try {
            
            const resp = await fetch('/api/auth/me', {
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
              try { document.cookie = `role=${role}; path=/`; } catch {}
            }
          } catch {
           
          }
        }

        
        // Create server session
        try {
          const sessionResponse = await fetch('/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, role, maxAge: 60 * 60 }), // 1h
          });
          
          if (!sessionResponse.ok) {
            const sessionError = await sessionResponse.text().catch(() => 'Unknown error');
            console.error('[GoogleCallback] Session creation failed:', sessionError);
          }
        } catch (error) {
          console.error('[GoogleCallback] Session creation error:', error);
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
