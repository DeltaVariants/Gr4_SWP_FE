'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/presentation/components/ui/Notification';
import { getRedirectPathByRole } from '@/lib/roleUtils';

/**
 * Hook để xử lý Google OAuth callback
 * Kiểm tra URL có token không, nếu có thì xử lý authentication
 */
export function useGoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setIsAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');

    if (token && refreshToken && !isProcessing) {
      setHasToken(true);
      setIsProcessing(true);
      handleCallback(token, refreshToken);
    }
  }, [searchParams]);

  const handleCallback = async (token: string, refreshToken: string) => {
    try {
      console.log('[GoogleCallback] Processing...');

      // Decode JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('[GoogleCallback] Payload:', payload);
      
      // Save tokens
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', decodeURIComponent(refreshToken));

      // Create user object
      const stationValue = payload.StationID || payload.stationID || payload.stationId || payload.StationId;
      const stationNameValue = payload.StationName || payload.stationName;
      
      const user = {
        id: payload.nameid || payload.sub || payload.userId,
        email: payload.email || payload.Email,
        name: payload.unique_name || payload.username || payload.Username || payload.name,
        role: payload.role || payload.Role || payload.RoleName || payload.roleName || 'Customer',
        phone: payload.phone || payload.PhoneNumber || payload.phoneNumber || '',
        // Nếu StationID là GUID thì dùng, nếu là tên thì để null và dùng stationName
        stationId: (stationValue && stationValue !== 'null' && /^[0-9a-f-]{36}$/i.test(stationValue)) ? stationValue : null,
        // Lưu tên trạm (có thể lấy từ StationName hoặc StationID nếu nó là tên)
        stationName: stationNameValue || (stationValue && stationValue !== 'null' && !/^[0-9a-f-]{36}$/i.test(stationValue)) ? stationValue : null,
      };

      console.log('[GoogleCallback] User:', user);
      console.log('[GoogleCallback] Station - ID:', user.stationId, 'Name:', user.stationName);

      // Save user info
      localStorage.setItem('userInfo', JSON.stringify(user));

      // Set cookies
      try {
        document.cookie = `token=${token}; path=/; max-age=3600`;
        document.cookie = `role=${user.role}; path=/; max-age=3600`;
      } catch (e) {
        console.warn('[GoogleCallback] Cookie warning:', e);
      }

      // Update context
      setUser(user);
      setIsAuthenticated(true);

      // Create session
      try {
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, role: user.role, maxAge: 3600 }),
        });
      } catch (e) {
        console.warn('[GoogleCallback] Session warning:', e);
      }

      // Show toast
      showToast({ 
        type: 'success', 
        message: `Chào mừng ${user.name}!` 
      });

      // Clean URL và redirect
      const targetPath = getRedirectPathByRole(user.role);
      console.log('[GoogleCallback] Redirecting to:', targetPath);

      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname);
        router.replace(targetPath);
      }, 800);

    } catch (error) {
      console.error('[GoogleCallback] Error:', error);
      setIsProcessing(false);
      showToast({ 
        type: 'error', 
        message: 'Đăng nhập thất bại. Vui lòng thử lại.' 
      });
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  };

  return { isProcessing: hasToken && isProcessing };
}
