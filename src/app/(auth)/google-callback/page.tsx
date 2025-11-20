"use client";

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getRedirectPathByRole } from '@/lib/roleUtils';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    let isMounted = true; // Prevent state updates after unmount
    
    const handle = async () => {
      try {
        if (error) {
          throw new Error(decodeURIComponent(error));
        }

        if (!token) {
          if (isMounted) {
            setStatus('error');
            setMessage('Missing token from Google callback');
          }
          setTimeout(() => router.push('/login?error=no_token'), 2000);
          return;
        }

        console.log('[GoogleCallback] Token received, length:', token.length);
        
        // Validate token format (basic check)
        if (token.length < 20) {
          throw new Error('Invalid token format');
        }
        
        // Save token to localStorage
        localStorage.setItem('accessToken', token);

        let role = 'CUSTOMER'; // Default to CUSTOMER for Google login (drivers)
        let userData = null;
        
        // Try to get user info from URL params first
        if (userInfoRaw) {
          try {
            const userObj = JSON.parse(decodeURIComponent(userInfoRaw));
            console.log('[GoogleCallback] User info from URL:', userObj);
            
            role = userObj.RoleName || userObj.roleName || userObj.role || 'CUSTOMER';
            userData = {
              id: userObj.UserID || userObj.userID || userObj.id,
              email: userObj.Email || userObj.email,
              name: userObj.Username || userObj.username || userObj.name,
              role: role,
              phone: userObj.PhoneNumber || userObj.phoneNumber || userObj.phone,
            };
            
            // Save to localStorage for AuthContext
            localStorage.setItem('userInfo', JSON.stringify(userData));
            console.log('[GoogleCallback] User saved from URL params, role:', role);
          } catch (e) {
            console.error('[GoogleCallback] Error parsing user info:', e);
          }
        }

        // If no user info in URL, fetch from backend
        if (!userData) {
          try {
            console.log('[GoogleCallback] Fetching user info from /api/auth/me...');
            const resp = await fetch('/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            if (resp.ok) {
              const me = await resp.json();
              console.log('[GoogleCallback] User info from API:', me);
              
              role = me.RoleName || me.roleName || me.role || 'CUSTOMER';
              userData = {
                id: me.UserID || me.userID || me.id,
                email: me.Email || me.email,
                name: me.Username || me.username || me.name,
                role: role,
                phone: me.PhoneNumber || me.phoneNumber || me.phone,
              };
              
              // Save to localStorage for AuthContext
              localStorage.setItem('userInfo', JSON.stringify(userData));
              console.log('[GoogleCallback] User saved from API, role:', role);
            } else {
              console.warn('[GoogleCallback] Failed to fetch user info, using default role');
            }
          } catch (error) {
            console.error('[GoogleCallback] Error fetching user info:', error);
          }
        }

        // Store role in localStorage for middleware
        localStorage.setItem('role', role);
        
        // Set cookies via API route for middleware (httpOnly cookies)
        try {
          console.log('[GoogleCallback] Setting cookies via API...');
          const cookieResponse = await fetch('/api/auth/set-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              accessToken: token,
              role: role,
            }),
          });
          
          if (cookieResponse.ok) {
            console.log('[GoogleCallback] Cookies set successfully');
          } else {
            console.error('[GoogleCallback] Failed to set cookies:', await cookieResponse.text());
          }
        } catch (error) {
          console.error('[GoogleCallback] Error setting cookies:', error);
        }

        // Redirect immediately without showing UI
        const redirectPath = getRedirectPathByRole(role);
        console.log('[GoogleCallback] Login complete, redirecting immediately to:', redirectPath);
        
        // Use window.location.replace to redirect immediately without showing callback page
        // This ensures AuthContext re-initializes and loads user from localStorage
        if (isMounted) {
          // Clear URL params to avoid showing token in URL
          window.history.replaceState({}, '', redirectPath);
          window.location.href = redirectPath;
        }
      } catch (err: any) {
        console.error('[GoogleCallback] Error:', err);
        if (isMounted) {
          setStatus('error');
          setMessage(err?.message || 'Google login failed');
        }
        setTimeout(() => router.push('/login?error=oauth_failed'), 2000);
      }
    };

    handle();
    
    // Cleanup
    return () => {
      isMounted = false;
    };
  }, [error, router, token, userInfoRaw]);

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
