'use client';

import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export const SocialLogin = () => {
  const { loading, googleLogin } = useAuth();

  const handleGoogleLogin = () => {
    
    googleLogin();
  };

  return (
    <>
      <div className="flex items-center my-4">
        <div className="flex-1 h-px bg-gray-300" />
        <span className="px-2 text-sm text-gray-500">Or continue with</span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-md py-3 px-4 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white"
      >
        <Image 
          src="/google-logo.png" 
          alt="Google" 
          width={20} 
          height={20}
          style={{ width: 'auto', height: 'auto' }}
        />
        <span className="text-sm font-medium text-gray-700">
          {loading ? 'Connecting...' : 'Continue with Google'}
        </span>
      </button>
    </>
  );
};