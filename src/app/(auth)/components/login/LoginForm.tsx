'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { EmailInput } from './EmailInput';
import { PasswordInput } from './PasswordInput';
import { RememberForgot } from './RememberForgot';
import { SocialLogin } from './SocialLogin';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
}

export const LoginForm = () => {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [apiError, setApiError] = useState<string>('');

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError('');
    
    // Validation
    const newErrors: LoginFormErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Call login from AuthContext (normalize input)
    const result = await login({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    });

    if (!result.success && result.message) {
      setApiError(result.message);
    }
    // If successful, AuthContext will automatically redirect
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear errors when user is typing
    if (errors[name as keyof LoginFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let fieldError = '';

    if (name === 'email') {
      if (!value) fieldError = 'Email is required';
      else if (!validateEmail(value)) fieldError = 'Please enter a valid email address';
    }

    if (name === 'password') {
      if (!value) fieldError = 'Password is required';
      else if (value.length < 6) fieldError = 'Password must be at least 6 characters';
    }

    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  return (
    <div className="w-full max-w-sm md:w-[368px] md:h-[533px] flex flex-col justify-center">
      <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
        Sign In
      </h2>
      <p className="text-sm text-gray-600 text-center mb-6">
        Enter your credentials to access your account
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {apiError}
          </div>
        )}

        <EmailInput
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
          disabled={loading}
        />

        <PasswordInput
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
          disabled={loading}
        />

        <RememberForgot
          rememberMe={formData.rememberMe}
          onRememberChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#295E9C] text-white py-3 rounded-md font-medium hover:bg-[#1C4078] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Signing in...
            </div>
          ) : (
            'Sign In'
          )}
        </button>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-[#0062FF] hover:text-[#0055E0] transition-colors"
          >
            Sign up now
          </Link>
        </p>

        <SocialLogin />
      </form>
    </div>
  );
};