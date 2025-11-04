'use client';

import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export const SocialLogin = () => {
  const { loading, googleLogin } = useAuth();

  const handleGoogleLogin = () => {
    console.log('[SocialLogin] Initiating Google OAuth flow...');
    googleLogin();
  };

  return (
    <>
      <div className="flex items-center my-4">
        <div className="flex-1 h-px bg-gray-300" />
        <span className="px-2 text-sm text-gray-500">Hoặc đăng nhập với</span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 border-2 border-gray-300 rounded-md py-3 px-4 hover:bg-gray-50 hover:border-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white group"
      >
        <Image 
          src="/google-logo.png" 
          alt="Google" 
          width={20} 
          height={20}
          className="group-hover:scale-110 transition-transform"
        />
        <span className="text-sm font-medium text-gray-700">
          {loading ? 'Đang kết nối...' : 'Đăng nhập với Google'}
        </span>
      </button>
    </>
  );
};