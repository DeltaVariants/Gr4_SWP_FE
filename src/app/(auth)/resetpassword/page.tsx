'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CodePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email') || '';
  const [email] = useState(emailFromQuery);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!code) {
      setError('Please enter the code');
      return;
    }
    if (code.length !== 5) {
      setError('Code must be exactly 5 digits');
      return;
    }

    setLoading(true);
    setError('');

    // pha ke code là 12345
    setTimeout(() => {
      if (code === '12345') {
        router.push(`/newpassword?email=${email}`);
      } else {
        setError('Invalid code, please try again');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E6F4FE] p-4">
      <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Cột trái */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-b from-[#295E9C] to-[#1C4078] text-white flex-col items-center justify-center p-8 relative">
          
        
          <button
            onClick={() => router.back()}//Nút Back trong cột trái
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
            <h1 className="text-2xl font-semibold mb-4">Forgot Your Password?</h1>
            <p className="text-base opacity-90 leading-relaxed">
              Enter the 5-digit code sent to your email to reset your password.
            </p>
          </div>
        </div>

        {/* Cột phải */}
        <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
          <div className="w-full max-w-sm md:w-[368px] md:h-[533px] flex flex-col justify-center">
            <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">Enter Verification Code</h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Code sent to <span className="font-medium">{email}</span>
            </p>
            <form onSubmit={handleVerify} className="space-y-5">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 5-digit code"
                maxLength={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#295E9C] text-white py-2 rounded-md font-medium hover:bg-[#1C4078] transition-colors disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
