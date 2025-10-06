'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateEmail = (email: string) => /^[^\s@]+@gmail\.com$/.test(email);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let newErrors: typeof errors = {};

    // tra email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid Gmail address';
    }

    // tra password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);

    // lỗi thì không submit
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    // pha ke delay và API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('Login data:', formData);

    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let fieldError = '';

    if (name === 'email') {
      if (!value) fieldError = 'Email is required';
      else if (!validateEmail(value)) fieldError = 'Please enter a valid Gmail address';
    }

    if (name === 'password') {
      if (!value) fieldError = 'Password is required';
      else if (value.length < 6) fieldError = 'Password must be at least 6 characters';
    }

    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E6F4FE] p-4">
      <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Cột trái */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-b from-[#295E9C] to-[#1C4078] text-white flex-col items-center justify-center p-8">
          <div className="text-center max-w-sm">
            <div className="w-28 h-28 mx-auto mb-6 flex items-center justify-center rounded-full bg-white p-4">
              <Image
                src="/logo.png"
                alt="Logo"
                width={200}
                height={200}
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-semibold mb-4">Welcome Back!</h1>
            <p className="text-base opacity-90 leading-relaxed text-center">
              Login to access your account and continue using our services.
            </p>
          </div>
        </div>

        {/* Cột phải */}
        <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
          <div className="w-full max-w-sm md:w-[368px] md:h-[533px] flex flex-col justify-center">
            <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
              Sign In
            </h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Enter your credentials to access your account
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter Gmail"
                  className={`w-full px-3 py-2 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF] ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
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
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your password"
                  className={`w-full px-3 py-2 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF] ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <Image
                    src={showPassword ? '/eye-off.svg' : '/eye.svg'}
                    alt={showPassword ? 'Hide password' : 'Show password'}
                    width={20}
                    height={20}
                  />
                </button>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
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

              {/*Sign in */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#295E9C] text-white py-2 rounded-md font-medium hover:bg-[#1C4078] transition-colors disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

              {/* Sign up */}
              <p className="text-center text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  href="/register"
                  className="font-medium text-[#0062FF] hover:text-[#0055E0]"
                >
                  Sign Up
                </Link>
              </p>

              {/* Google login */}
              <div className="flex items-center my-4">
                <div className="flex-1 h-px bg-gray-300" />
                <span className="px-2 text-sm text-gray-500">Or continue with</span>
                <div className="flex-1 h-px bg-gray-300" />
              </div>
              <button
                type="button"
                className="w-full flex items-center justify-center border border-gray-300 rounded-md py-2 hover:bg-gray-50 transition-colors"
              >
                <Image src="/google-logo.png" alt="Google" width={40} height={40} />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Google
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
