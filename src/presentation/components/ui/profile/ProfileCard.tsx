"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Clipboard } from 'lucide-react';
import { useToast } from '@/presentation/components/ui/Notification/ToastProvider';

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
  const { user: ctxUser, isAuthenticated } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    id?: string;
    email?: string;
    name?: string;
    role?: string;
    phone?: string;
    stationId?: string;
    stationName?: string;
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
          const message = payload?.message || 'Your session has expired.';
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
          stationId: (me as any).StationID || (me as any).stationID || (me as any).stationId || (me as any).StationId || (me as any).station || undefined,
          stationName: (me as any).StationName || (me as any).stationName || (me as any).station || undefined,
        };
        if (!cancelled) setProfile(normalized);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error';
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
      <div className="h-28 flex items-center justify-center">
        <div className="animate-spin h-6 w-6 border-2 border-gray-200 border-t-blue-600 rounded-full" />
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
        No profile data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xl font-bold text-gray-900">{profile.name || '-'}</div>
              <div className="text-sm font-medium text-gray-600">{profile.email || '-'}</div>
              {((profile.stationName && profile.stationName !== '') || profile.stationId) && (
                <div className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-2">
                  <span className="inline-block">Trạm: {profile.stationName || profile.stationId}</span>
                  {/* show stationId copy for staff/admin */}
                  {(() => {
                    const role = String(profile.role || '').toLowerCase();
                    const isStaff = role.includes('staff') || role.includes('employee') || role.includes('admin') || role.includes('operator');
                    if (!isStaff || !profile.stationId) return null;
                    return (
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(profile.stationId || '');
                            toast.showToast({ type: 'success', message: 'Station ID copied' });
                          } catch (e) {
                            toast.showToast({ type: 'error', message: 'Cannot copy station id' });
                          }
                        }}
                        className="text-xs text-gray-500 inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100"
                        title="Copy station id"
                      >
                        <Clipboard className="w-3 h-3" />
                        <span className="sr-only">Copy station id</span>
                      </button>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
            <div className="mt-1 p-3 rounded-lg w-full text-gray-900 font-medium bg-gray-50">
              {profile.name || '-'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
            <div className="mt-1 p-3 rounded-lg w-full text-gray-900 font-medium bg-gray-50">
              {profile.phone || '-'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <div className="mt-1 p-3 rounded-lg w-full text-gray-900 font-medium bg-gray-50">
              {profile.email || '-'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
            <div className="mt-1 p-3 rounded-lg w-full text-gray-900 font-medium bg-gray-50">
              {profile.role || '-'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
