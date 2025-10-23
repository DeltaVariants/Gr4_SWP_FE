'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NewPasswordFormProps {
  email: string;
}

export default function NewPasswordForm({ email }: NewPasswordFormProps) {
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

    if (!email) {
      alert('Email is missing. Please start the reset process again.');
      router.push('/forgotpassword');
      return;
    }

    setLoading(true);
    try {
      const code = typeof window !== 'undefined' ? sessionStorage.getItem('reset_code') : null;
      if (!code) {
        alert('Verification code not found. Please request a new code.');
        router.push('/forgotpassword');
        return;
      }

      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code,
          newPassword,
          confirmNewPassword: confirmPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Clear the saved code
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('reset_code');
        }
        alert('Password reset successfully!');
        router.push('/login');
      } else {
        alert(data.message || 'Error resetting password');
      }
    } catch (err) {
      alert('Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}