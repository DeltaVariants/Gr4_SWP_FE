'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export const ResetPasswordBanner = () => {
  const router = useRouter();

  return (
    <div className="hidden md:flex w-1/2 bg-gradient-to-b from-[#295E9C] to-[#1C4078] text-white flex-col items-center justify-center p-8 relative">
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 text-white p-2 rounded-full hover:bg-white/20 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
          viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="text-center max-w-sm">
        <div className="w-25 h-25 mx-auto mb-6 flex items-center justify-center rounded-full bg-white p-4">
          <Image 
            src="/logo.png" 
            alt="Logo" 
            width={200} 
            height={200} 
            className="w-full h-full object-contain" 
          />
        </div>
        <h1 className="text-2xl font-semibold mb-4">Forgot Your Password?</h1>
        <p className="text-base opacity-90 leading-relaxed">
          Enter the 6-digit code sent to your email to reset your password.
        </p>
      </div>
    </div>
  );
};