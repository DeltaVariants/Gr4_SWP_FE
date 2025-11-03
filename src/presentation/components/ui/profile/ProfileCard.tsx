"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/presentation/components/ui/Notification/ToastProvider';
import { Edit2, Lock, Check, X, Clipboard } from 'lucide-react';

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
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [pwdOpen, setPwdOpen] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

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
        if (!cancelled) {
          setNameInput(normalized.name || '');
          setPhoneInput(normalized.phone || '');
        }
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

          <div className="flex items-center gap-3">
            <button onClick={() => setEditing(true)} title="Edit profile" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:shadow-lg">
              <Edit2 className="w-4 h-4" /> <span className="text-sm">Edit</span>
            </button>
            <button onClick={() => setPwdOpen(true)} title="Change password" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium shadow-md hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 hover:shadow-lg">
              <Lock className="w-4 h-4" /> <span className="text-sm">Change</span>
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
            <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} readOnly={!editing} className={`mt-1 p-3 rounded-lg w-full text-gray-900 font-medium ${editing ? 'border-2 border-blue-300 bg-blue-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' : 'bg-gray-50 border-0'}`} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
            <input value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} readOnly={!editing} className={`mt-1 p-3 rounded-lg w-full text-gray-900 font-medium ${editing ? 'border-2 border-blue-300 bg-blue-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' : 'bg-gray-50 border-0'}`} />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          {editing ? (
            <>
              <button onClick={async () => {
                try {
                  setLoading(true);
                  const payload = { name: nameInput, phoneNumber: phoneInput };
                  const res = await fetch('/api/auth/update-profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                  const p = await res.json().catch(() => ({}));
                  if (!res.ok) throw new Error(p?.message || 'Cập nhật thất bại');
                  toast.showToast({ type: 'success', message: 'Profile updated' });
                  setProfile((prev) => prev ? { ...prev, name: nameInput, phone: phoneInput } : prev);
                  setEditing(false);
                } catch (err: unknown) {
                  const msg = err && typeof err === 'object' && 'message' in (err as Record<string, unknown>) ? String((err as Record<string, unknown>)['message']) : String(err || 'Failed to update');
                  toast.showToast({ type: 'error', message: msg });
                } finally { setLoading(false); }
              }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-md hover:from-emerald-600 hover:to-teal-700 transition-all">
                <Check className="w-4 h-4" /> Save
              </button>
              <button onClick={() => { setEditing(false); setNameInput(profile.name || ''); setPhoneInput(profile.phone || ''); }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-all">
                <X className="w-4 h-4" /> Cancel
              </button>
            </>
          ) : (
            <div className="text-sm text-gray-600 font-medium">Đã cập nhật lần cuối: <span className="font-semibold text-gray-800">—</span></div>
          )}
        </div>
      </div>

      {/* Change password modal */}
      {pwdOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPwdOpen(false)} />
          <div className="relative bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Lock className="w-6 h-6 text-emerald-600" />
                Thay đổi mật khẩu
              </h3>
              <button onClick={() => setPwdOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu hiện tại</label>
                <input type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all" placeholder="Nhập mật khẩu hiện tại" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu mới</label>
                <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all" placeholder="Nhập mật khẩu mới" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all" placeholder="Nhập lại mật khẩu mới" />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setPwdOpen(false)} className="px-5 py-2.5 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-all">Hủy</button>
              <button onClick={async () => {
                if (!newPwd || newPwd !== confirmPwd) { toast.showToast({ type: 'error', message: 'Mật khẩu mới không khớp' }); return; }
                try {
                  setLoading(true);
                  const payload = { currentPassword: currentPwd, newPassword: newPwd };
                  const res = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                  const p = await res.json().catch(() => ({}));
                  if (!res.ok) throw new Error(p?.message || 'Không thể đổi mật khẩu');
                  toast.showToast({ type: 'success', message: 'Đổi mật khẩu thành công' });
                  setPwdOpen(false);
                  setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
                } catch (err: unknown) {
                  const msg = err && typeof err === 'object' && 'message' in (err as Record<string, unknown>) ? String((err as Record<string, unknown>)['message']) : String(err || 'Failed');
                  toast.showToast({ type: 'error', message: msg });
                } finally { setLoading(false); }
              }} className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all hover:shadow-xl">Đổi mật khẩu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
