'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

type MeResponse = {
  userID?: string;
  UserID?: string;
  email?: string;
  Email?: string;
  username?: string;
  Username?: string;
  roleName?: string;
  RoleName?: string;
  phoneNumber?: string;
  PhoneNumber?: string;
};

export function ProfileCard() {
  const { user: ctxUser, isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    id?: string;
    email?: string;
    name?: string;
    role?: string;
    phone?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Prefer context user if available
        if (ctxUser) {
          if (!cancelled) setProfile(ctxUser);
        }

        // Always attempt to refresh from BE for latest info if authenticated
        const token = localStorage.getItem('accessToken');
        if (!token) {
          if (!cancelled) setError('Bạn chưa đăng nhập');
          return;
        }
        const resp = await api.get('/api/Auth/me');
        if (resp.status === 401) {
          if (!cancelled) setError('Phiên đăng nhập đã hết hạn');
          return;
        }
        const me: MeResponse = resp.data;
        const normalized = {
          id: me.UserID || me.userID,
          email: me.Email || me.email,
          name: me.Username || me.username,
          role: me.RoleName || me.roleName,
          phone: me.PhoneNumber || me.phoneNumber,
        };
        if (!cancelled) setProfile(normalized);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Lỗi không xác định');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [ctxUser, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-50 text-red-700 border border-red-200">
        {error}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200">
        Không có dữ liệu hồ sơ
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-500">Họ tên</div>
          <div className="font-medium">{profile.name || '-'} </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Email</div>
          <div className="font-medium">{profile.email || '-'} </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Số điện thoại</div>
          <div className="font-medium">{profile.phone || '-'} </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Vai trò</div>
          <div className="font-medium">{profile.role || '-'} </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={logout}
          className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
