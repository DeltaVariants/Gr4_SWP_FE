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

        
        const resp = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!resp.ok) {
          const payload = await resp.json().catch(() => ({}));
          const message = payload?.message || 'Phiên đăng nhập đã hết hạn';
          if (!cancelled) setError(message);
          return;
        }
        const payload = await resp.json();
        const me: MeResponse = payload.data;
        const normalized = {
          id: me.UserID || me.userID,
          email: me.Email || me.email,
          name: me.Username || me.username,
          role: me.RoleName || me.roleName,
          phone: me.PhoneNumber || me.phoneNumber,
        };
        if (!cancelled) setProfile(normalized);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Lỗi không xác định';
        if (!cancelled) setError(message);
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
      <div className="h-20 flex items-center justify-center">
        <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 rounded-md bg-red-50 text-red-700 border border-red-200 text-sm">
        {error}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-3 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200 text-sm">
        Không có dữ liệu hồ sơ
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-500">Họ tên</label>
        <div className="font-medium text-gray-900">{profile.name || '-'} </div>
      </div>
      <div>
        <label className="block text-sm text-gray-500">Email</label>
        <div className="font-medium text-gray-900">{profile.email || '-'} </div>
      </div>
      <div>
        <label className="block text-sm text-gray-500">Số điện thoại</label>
        <div className="font-medium text-gray-900">{profile.phone || '-'} </div>
      </div>
      <div>
        <label className="block text-sm text-gray-500">Vai trò</label>
        <div className="font-medium text-gray-900">{profile.role || '-'} </div>
      </div>

     
    </div>
  );
}
