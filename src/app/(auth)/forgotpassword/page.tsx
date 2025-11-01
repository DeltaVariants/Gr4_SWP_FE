'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // bắt buộc @gmail.com
  const validateEmail = (value: string) => {
    if (!value) return 'Email is required';
    const regex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!regex.test(value)) return 'Please enter a valid email ending with @gmail.com';
    return '';
  };

  const handleBlur = () => {
    setError(validateEmail(email));
  };

  const handleChange = (value: string) => {
    setEmail(value);
    setError(validateEmail(value)); // kiểm tra ngay khi nhập
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
      await fetch('/api/auth/send-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      router.push(`/resetpassword?email=${encodeURIComponent(email)}`);
    } catch (err) {
      alert('Error sending reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E6F4FE] p-4">
      <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Cột trái */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-b from-[#295E9C] to-[#1C4078] text-white flex-col relative p-8">
            {/* Nút Back */}
            <button
              onClick={() => router.back()}
              className="absolute top-4 left-4 text-white p-2 rounded-full hover:bg-white/20 transition"
            >
              
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

          <div className="flex flex-col items-center justify-center flex-1 text-center max-w-sm mx-auto">
            <div className="w-25 h-25 mx-auto mb-6 flex items-center justify-center rounded-full bg-white p-4">
              <Image src="/logo.png" alt="Logo" width={200} height={200} className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-semibold mb-4">Forgot Your Password?</h1>
            <p className="text-base opacity-90 leading-relaxed">
              Enter your email to receive a code to reset your password.
            </p>
          </div>
        </div>

        {/* Cột phải */}
        <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
          <div className="w-full max-w-sm md:w-[368px] md:h-[533px] flex flex-col justify-center">
            <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">Reset Password</h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Please enter your registered email address
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => handleChange(e.target.value)}
                  onBlur={handleBlur}
                  placeholder="Enter your email"
                  className={`w-full px-3 py-2 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:border-[#0062FF] ${
                    error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#0062FF]'
                  }`}
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#295E9C] text-white py-2 rounded-md font-medium hover:bg-[#1C4078] transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <p className="text-center text-sm text-gray-600 mt-4">
                Remember your password?{' '}
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
