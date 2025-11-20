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

        
        const resp = await fetch('/api/auth/me', { 
          cache: 'no-store',
          credentials: 'include'
        });
        if (!resp.ok) {
          const payload = await resp.json().catch(() => ({}));
          const message = payload?.message || 'Session expired';
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
        No profile data
      </div>
    );
  }

  // Check if user is staff/admin - these accounts cannot be edited
  const role = String(profile.role || '').toLowerCase();
  const isStaffOrAdmin = role.includes('staff') || role.includes('employee') || role.includes('admin') || role.includes('operator');
  const canEdit = !isStaffOrAdmin; // Only customers can edit

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-xl font-semibold text-slate-700">{String(profile.name || '').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}</div>
            <div>
              <div className="text-lg font-semibold text-gray-900">{profile.name || '-'}</div>
              <div className="text-sm text-black">{profile.email || '-'}</div>
              {((profile.stationName && profile.stationName !== '') || profile.stationId) && (
                <div className="text-xs text-black mt-1 flex items-center gap-2">
                  <span className="inline-block">Station: {profile.stationName || profile.stationId}</span>
                  {/* show stationId copy for staff/admin */}
                  {(() => {
                    if (!isStaffOrAdmin || !profile.stationId) return null;
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

          <div className="flex items-center gap-2">
            {canEdit && (
              <>
                <button onClick={() => canEdit && setEditing(true)} title="Edit profile" className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                  <Edit2 className="w-4 h-4" /> <span className="text-sm">Edit</span>
                </button>
                <button onClick={() => canEdit && setPwdOpen(true)} title="Change password" className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-rose-500 text-white hover:bg-rose-600">
                  <Lock className="w-4 h-4" /> <span className="text-sm">Change</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-black font-medium">Full Name</label>
            <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} readOnly={!editing || !canEdit} className={`mt-1 p-2 rounded-md w-full text-black ${editing ? 'border-gray-300' : 'bg-transparent border-0'}`} />
          </div>
          <div>
            <label className="block text-xs text-black font-medium">Phone Number</label>
            <input value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} readOnly={!editing || !canEdit} className={`mt-1 p-2 rounded-md w-full text-black ${editing ? 'border-gray-300' : 'bg-transparent border-0'}`} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          {editing ? (
            <>
              <button 
                onClick={async () => {
                  try {
                    setLoading(true);
                    const payload = { name: nameInput, phoneNumber: phoneInput };
                    const res = await fetch('/api/auth/update-profile', { 
                      method: 'PUT', 
                      headers: { 'Content-Type': 'application/json' }, 
                      credentials: 'include',
                      body: JSON.stringify(payload) 
                    });
                    const p = await res.json().catch(() => ({}));
                    if (!res.ok) {
                      const errorMsg = p?.message || p?.Message || 'Update failed';
                      throw new Error(errorMsg);
                    }
                    toast.showToast({ type: 'success', message: 'Profile updated successfully' });
                    
                    // Reload user data from API
                    try {
                      const meResp = await fetch('/api/auth/me', { 
                        cache: 'no-store',
                        credentials: 'include'
                      });
                      if (meResp.ok) {
                        const meData = await meResp.json();
                        const me: MeResponse = meData.data;
                        const normalized = {
                          id: me.UserID || me.userID,
                          email: me.Email || me.email,
                          name: me.Username || me.username,
                          role: me.RoleName || me.roleName,
                          phone: me.PhoneNumber || me.phoneNumber,
                          stationId: (me as any).StationID || (me as any).stationID || (me as any).stationId || (me as any).StationId || (me as any).station || undefined,
                          stationName: (me as any).StationName || (me as any).stationName || (me as any).station || undefined,
                        };
                        setProfile(normalized);
                        setNameInput(normalized.name || '');
                        setPhoneInput(normalized.phone || '');
                      }
                    } catch (e) {
                      // If reload fails, just update local state
                      setProfile((prev) => prev ? { ...prev, name: nameInput, phone: phoneInput } : prev);
                    }
                    
                    setEditing(false);
                  } catch (err: unknown) {
                    const msg = err && typeof err === 'object' && 'message' in (err as Record<string, unknown>) ? String((err as Record<string, unknown>)['message']) : String(err || 'Failed to update');
                    toast.showToast({ type: 'error', message: msg });
                  } finally { setLoading(false); }
                }}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" /> Save
              </button>
              <button onClick={() => { setEditing(false); setNameInput(profile.name || ''); setPhoneInput(profile.phone || ''); }} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100">
                <X className="w-4 h-4" /> Cancel
              </button>
            </>
          ) : (
            <div className="text-sm text-black"><span className="font-medium text-black"></span></div>
          )}
        </div>
      </div>

      {/* Change password modal */}
      {pwdOpen && canEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPwdOpen(false)} />
          <div className="relative bg-white rounded-xl p-6 w-[480px] shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Change Password</h3>
              <button onClick={() => setPwdOpen(false)} className="text-sm text-gray-500">Close</button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs text-gray-600">Current Password</label>
                <input type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} className="mt-2 w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-xs text-gray-600">New Password</label>
                <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className="mt-2 w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Confirm New Password</label>
                <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} className="mt-2 w-full p-2 border rounded-md" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setPwdOpen(false)} className="px-4 py-2 rounded-md bg-gray-100">Cancel</button>
              <button 
                onClick={async () => {
                  // Validation
                  if (!currentPwd || !newPwd || !confirmPwd) {
                    toast.showToast({ type: 'error', message: 'Please fill in all password fields' });
                    return;
                  }
                  
                  // Backend requires: OldPassword (min 6), NewPassword (min 6), ConfirmNewPassword (min 6)
                  if (currentPwd.length < 6) {
                    toast.showToast({ 
                      type: 'error', 
                      message: 'Current password must be at least 6 characters' 
                    });
                    return;
                  }
                  
                  if (newPwd.length < 6) {
                    toast.showToast({ type: 'error', message: 'New password must be at least 6 characters' });
                    return;
                  }
                  if (newPwd !== confirmPwd) { 
                    toast.showToast({ type: 'error', message: 'New passwords do not match' }); 
                    return; 
                  }
                  if (currentPwd === newPwd) {
                    toast.showToast({ type: 'error', message: 'New password must be different from current password' });
                    return;
                  }
                  
                  try {
                    setLoading(true);
                    const payload = { currentPassword: currentPwd, newPassword: newPwd };
                    
                    console.log('[ProfileCard] Calling change-password API');
                    console.log('[ProfileCard] Payload (masked):', {
                      currentPassword: currentPwd ? `${currentPwd.substring(0, 1)}***` : 'empty',
                      newPassword: newPwd ? `${newPwd.substring(0, 1)}***` : 'empty',
                      currentPasswordLength: currentPwd?.length || 0,
                      newPasswordLength: newPwd?.length || 0
                    });
                    
                    const res = await fetch('/api/auth/change-password', { 
                      method: 'POST', 
                      headers: { 
                        'Content-Type': 'application/json'
                      },
                      credentials: 'include',
                      body: JSON.stringify(payload) 
                    });
                    
                    console.log('[ProfileCard] Response status:', res.status);
                    console.log('[ProfileCard] Response headers:', Object.fromEntries(res.headers.entries()));
                    
                    // Parse response - use clone if needed
                    let p: any = {};
                    try {
                      const contentType = res.headers.get('content-type');
                      console.log('[ProfileCard] Content-Type:', contentType);
                      
                      if (contentType && contentType.includes('application/json')) {
                        p = await res.json();
                      } else {
                        const text = await res.text();
                        console.log('[ProfileCard] Response text:', text);
                        if (text) {
                          try {
                            p = JSON.parse(text);
                          } catch {
                            p = { message: text };
                          }
                        }
                      }
                    } catch (e) {
                      console.error('[ProfileCard] Failed to parse response:', e);
                      p = { message: 'Failed to read response from server' };
                    }
                    
                    console.log('[ProfileCard] Response data (full):', JSON.stringify(p, null, 2));
                    console.log('[ProfileCard] Response data keys:', Object.keys(p));
                    
                    if (!res.ok) {
                      // Try to extract error message from various possible formats
                      const errorMsg = 
                        p?.message || 
                        p?.Message || 
                        p?.error ||
                        p?.Error ||
                        p?.errors?.join?.('; ') ||
                        (p?.errors && Array.isArray(p.errors) ? p.errors.map((e: any) => e?.message || e).join('; ') : null) ||
                        (typeof p === 'string' ? p : null) ||
                        `Cannot change password (${res.status})`;
                      console.error('[ProfileCard] Change password failed. Full error object:', p);
                      console.error('[ProfileCard] Extracted error message:', errorMsg);
                      throw new Error(errorMsg);
                    }
                    
                    // Success
                    const successMsg = p?.message || p?.Message || 'Password changed successfully';
                    toast.showToast({ type: 'success', message: successMsg });
                    setPwdOpen(false);
                    setCurrentPwd(''); 
                    setNewPwd(''); 
                    setConfirmPwd('');
                  } catch (err: unknown) {
                    console.error('[ProfileCard] Change password error:', err);
                    let msg = 'Failed to change password';
                    if (err instanceof Error) {
                      msg = err.message;
                    } else if (err && typeof err === 'object' && 'message' in err) {
                      msg = String(err.message);
                    }
                    toast.showToast({ type: 'error', message: msg });
                  } finally { 
                    setLoading(false); 
                  }
                }}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-rose-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}