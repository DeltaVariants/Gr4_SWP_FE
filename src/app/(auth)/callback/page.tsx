'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/presentation/components/ui/Notification';
import { getRedirectPathByRole } from '@/lib/roleUtils';
import { RefreshCw } from 'lucide-react';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setIsAuthenticated } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Lấy token từ URL query params
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');

        console.log('[GoogleCallback] Token:', token ? '✓' : '✗');
        console.log('[GoogleCallback] RefreshToken:', refreshToken ? '✓' : '✗');

        if (!token || !refreshToken) {
          showToast({ 
            type: 'error', 
            message: 'Thiếu thông tin xác thực. Vui lòng thử lại.' 
          });
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        // Decode JWT để lấy thông tin user
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('[GoogleCallback] User payload:', payload);
        
        // Lưu tokens vào localStorage
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', decodeURIComponent(refreshToken));

        // Tạo user object từ payload
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

        console.log('[GoogleCallback] User info:', user);
        console.log('[GoogleCallback] Station - ID:', user.stationId, 'Name:', user.stationName);

        // Lưu user info
        localStorage.setItem('userInfo', JSON.stringify(user));

        // Set cookies cho middleware
        try {
          document.cookie = `token=${token}; path=/; max-age=3600`;
          document.cookie = `role=${user.role}; path=/; max-age=3600`;
        } catch (e) {
          console.warn('[GoogleCallback] Cookie warning:', e);
        }

        // Update auth context
        setUser(user);
        setIsAuthenticated(true);

        // Tạo server session
        try {
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              token, 
              role: user.role, 
              maxAge: 60 * 60 
            }),
          });
        } catch (e) {
          console.warn('[GoogleCallback] Session warning:', e);
        }

        // Show success toast
        showToast({ 
          type: 'success', 
          message: `Chào mừng ${user.name}!` 
        });

        // Redirect theo role - Customer/User -> /home
        const targetPath = getRedirectPathByRole(user.role);
        console.log('[GoogleCallback] Redirecting to:', targetPath);

        setTimeout(() => {
          router.replace(targetPath);
        }, 800);

      } catch (error) {
        console.error('[GoogleCallback] Error:', error);
        showToast({ 
          type: 'error', 
          message: 'Đăng nhập thất bại. Vui lòng thử lại.' 
        });
        
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    };

    handleGoogleCallback();
  }, [searchParams, router, setUser, setIsAuthenticated, showToast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Đang xử lý đăng nhập...
        </h2>
        
        <p className="text-gray-600 mb-6">
          Vui lòng đợi trong giây lát
        </p>
        
        {/* Progress bar animation */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-progress"
          />
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Đang xác thực với Google...
        </p>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { 
            transform: translateX(-100%);
            width: 50%;
          }
          50% {
            width: 70%;
          }
          100% { 
            transform: translateX(300%);
            width: 50%;
          }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
