'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

export default function NewPasswordPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || ''; 
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const validateNewPassword = (pwd: string) => {
    if (!pwd) return 'New password is required';
    if (pwd.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const validateConfirmPassword = (pwd: string, confirm: string) => {
    if (!confirm) return 'Confirm password is required';
    if (pwd !== confirm) return 'Passwords do not match';
    return '';
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newPwdError = validateNewPassword(newPassword);
    const confirmPwdError = validateConfirmPassword(newPassword, confirmPassword);
    setErrors({ newPassword: newPwdError, confirmPassword: confirmPwdError });

    if (newPwdError || confirmPwdError) return;

    setLoading(true);
    try {
      // gọi API reset password
      const res = await fetch('/api/auth/resetpass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: '12345', 
          newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Password reset successfully!');
        router.push('/login');
      } else {
        alert(data.message || 'Error resetting password');
      }
    } catch {
      alert('Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E6F4FE] p-4">
      <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
      
        {/* Cột trái */}
        <div className="hidden md:flex relative w-1/2 bg-gradient-to-b from-[#295E9C] to-[#1C4078] text-white flex-col items-center justify-center p-8">
       
          <button
            onClick={() => router.back()} //Nút Back trong cột trái 
            className="absolute top-4 left-4 text-white p-2 rounded-full hover:bg-white/20 transition"
          >
           
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center max-w-sm">
            <div className="w-25 h-25 mx-auto mb-6 flex items-center justify-center rounded-full bg-white p-4">
              <Image src="/logo.png" alt="Logo" width={200} height={200} className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-semibold mb-4">Reset Your Password</h1>
            <p className="text-base opacity-90 leading-relaxed">
              Enter your new password to finish resetting.
            </p>
          </div>
        </div>

        {/* Cột phải */}
        <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
          <div className="w-full max-w-sm md:w-[368px] md:h-[533px] flex flex-col justify-center">
            <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">Create New Password</h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              For <span className="font-medium">{email}</span>
            </p>

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, newPassword: '' }));
                  }}
                  placeholder="Enter new password"
                  className={`w-full px-3 py-2 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:border-[#0062FF] ${
                    errors.newPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#0062FF]'
                  }`}
                />
                {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }}
                  placeholder="Confirm new password"
                  className={`w-full px-3 py-2 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:border-[#0062FF] ${
                    errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#0062FF]'
                  }`}
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#295E9C] text-white py-2 rounded-md font-medium hover:bg-[#1C4078] transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Update Password'}
              </button>

              <p className="text-center text-sm text-gray-600 mt-4">
                Remembered your password?{' '}
                <Link href="/login" className="font-medium text-[#0062FF] hover:text-[#0055E0]">
                  Back to Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
