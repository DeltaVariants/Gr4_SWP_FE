'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
}

export const PasswordInput = ({
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <label
        htmlFor="password"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Password
      </label>
      <input
        type={showPassword ? 'text' : 'password'}
        id="password"
        name="password"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder="Enter your password"
        className={`w-full px-3 py-2 pr-10 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF] ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        disabled={disabled}
        className={`absolute right-3 top-8 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <Image
          src={showPassword ? '/eye-off.svg' : '/eye.svg'}
          alt={showPassword ? 'Hide password' : 'Show password'}
          width={20}
          height={20}
        />
      </button>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};