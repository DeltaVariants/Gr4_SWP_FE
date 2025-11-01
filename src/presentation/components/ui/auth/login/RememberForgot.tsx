'use client';

import Link from 'next/link';

interface RememberForgotProps {
  rememberMe: boolean;
  onRememberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RememberForgot = ({
  rememberMe,
  onRememberChange,
}: RememberForgotProps) => {
  return (
    <div className="flex items-center justify-between">
      <label className="flex items-center text-sm text-gray-600">
        <input
          type="checkbox"
          name="rememberMe"
          checked={rememberMe}
          onChange={onRememberChange}
          className="h-4 w-4 rounded border-gray-300 text-[#0062FF] focus:ring-[#0062FF]"
        />
        <span className="ml-2">Remember me</span>
      </label>
      <Link
        href="/forgotpassword"
        className="text-sm font-medium text-[#0062FF] hover:text-[#0055E0]"
      >
        Forgot password?
      </Link>
    </div>
  );
};