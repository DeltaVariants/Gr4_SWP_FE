"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ImpersonatePage() {
  const [token, setToken] = useState('');
  const [refresh, setRefresh] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [msg, setMsg] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMsg('Vui lòng dán access token');
      return;
    }
    try {
      localStorage.setItem('accessToken', token);
      if (refresh) localStorage.setItem('refreshToken', refresh);
      // call session to set cookie on server
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, role, maxAge: 60 * 60 }),
      });
      setMsg('Token đã lưu — chuyển tới dashboard...');
      setTimeout(() => router.push('/dashboardstaff'), 600);
    } catch (e: any) {
      console.error(e);
      setMsg('Lỗi khi set token');
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold">Impersonate (dev only)</h2>
        <p className="mt-4 text-sm text-gray-600">Chỉ khả dụng trong môi trường development.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Dev Impersonate</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Access Token</label>
          <textarea value={token} onChange={(e) => setToken(e.target.value)} rows={6} className="mt-1 block w-full rounded-md border-gray-300" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Refresh Token (optional)</label>
          <input value={refresh} onChange={(e) => setRefresh(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 block rounded-md border-gray-300">
            <option value="EMPLOYEE">EMPLOYEE</option>
            <option value="ADMIN">ADMIN</option>
            <option value="DRIVER">DRIVER</option>
            <option value="CUSTOMER">CUSTOMER</option>
          </select>
        </div>
        <div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Set token & go to dashboard</button>
        </div>
      </form>
      {msg && <div className="mt-4 text-sm text-gray-700">{msg}</div>}
    </div>
  );
}
