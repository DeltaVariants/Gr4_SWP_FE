'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EmailInput } from '../login/EmailInput';

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (value: string) => {
    if (!value) return 'Email is required';
    const regex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!regex.test(value)) return 'Please enter a valid email ending with @gmail.com';
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEmail(value);
    setError(validateEmail(value));
  };

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setError(validateEmail(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const err = validateEmail(email);
    if (err) {
      setError(err);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        const msg = data?.message || 'Failed to send password reset email.';
        alert(msg);
        return;
      }
      router.push(`/resetpassword?email=${encodeURIComponent(email)}`);
    } catch (err) {
      alert('Error sending password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm md:w-[368px] md:h-[533px] flex flex-col justify-center">
      <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
        Reset Password
      </h2>
      <p className="text-sm text-gray-600 text-center mb-6">
        Please enter your registered email address
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <EmailInput
          value={email}
          onChange={handleEmailChange}
          onBlur={handleEmailBlur}
          error={error}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#295E9C] text-white py-2 rounded-md font-medium hover:bg-[#1C4078] transition-colors disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Remember your password?{' '}
          <Link
            href="/login"
            className="font-medium text-[#0062FF] hover:text-[#0055E0]"
          >
            Back to Login
          </Link>
        </p>
      </form>
    </div>
  );
};