'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CodeInput } from './CodeInput';

interface ResetPasswordFormProps {
  email: string;
}

export const ResetPasswordForm = ({ email }: ResetPasswordFormProps) => {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const STRICT_VERIFY = process.env.NEXT_PUBLIC_STRICT_VERIFY === 'true';

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!code) {
      setError('Please enter the code');
      return;
    }
    if (code.length !== 6) {
      setError('Code must be exactly 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!STRICT_VERIFY) {
        // Non-strict mode: skip backend verify here; verify will happen on reset-password step
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('reset_code', code);
        }
        router.push(`/newpassword?email=${encodeURIComponent(email)}`);
        return;
      }

      // Strict mode: verify code with backend before proceeding
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (!res.ok || data?.success === false) {
        const msg = data?.message || 'Invalid or expired code. Please try again.';
        setError(msg);
        return;
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('reset_code', code);
      }
      router.push(`/newpassword?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError('Cannot verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm md:w-[368px] md:h-[533px] flex flex-col justify-center">
      <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
        Enter Verification Code
      </h2>
      <p className="text-sm text-gray-600 text-center mb-6">
        Code sent to <span className="font-medium">{email}</span>
      </p>

      <form onSubmit={handleVerify} className="space-y-5">
        <CodeInput
          value={code}
          onChange={(e) => setCode(e.target.value)}
          error={error}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#295E9C] text-white py-2 rounded-md font-medium hover:bg-[#1C4078] transition-colors disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>
      </form>
    </div>
  );
};