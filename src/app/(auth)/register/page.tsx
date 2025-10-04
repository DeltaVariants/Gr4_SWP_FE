'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  // validate từng field
  const validateField = (name: string, value: string) => {
    let error = '';
    if (name === 'email') {
      if (!value) error = 'Email is required';
      else if (!value.endsWith('@gmail.com')) error = 'Email must be a valid @gmail.com';
    }
    if (name === 'password') {
      if (!value) error = 'Password is required';
      else if (value.length < 6) error = 'Password must be at least 6 characters';
    }
    if (name === 'confirmPassword') {
      if (!value) error = 'Please confirm your password';
      else if (value !== formData.password) error = 'Passwords do not match';
    }
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    Object.keys(formData).forEach((key) => {
      newErrors[key] = validateField(key, (formData as any)[key]);
    });
    setErrors(newErrors);
    if (Object.values(newErrors).some((error) => error)) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    alert('Register success (fake)');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E6F4FE] p-4">
      <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        
        {/* Cột trái */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-b from-[#295E9C] to-[#1C4078] text-white flex-col items-center justify-center p-8 relative">
          
       
          <button 
            onClick={() => router.back()} //Nút Back trong cột trái
            className="absolute top-4 left-4 text-white p-2 rounded-full hover:bg-white/20 transition"
          >
            
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-center max-w-sm">
            <div className="w-28 h-28 mx-auto mb-6 flex items-center justify-center rounded-full bg-white p-4">
              <Image
                src="/logo.png"
                alt="eSwap Logo"
                width={200}
                height={200}
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-semibold mb-4">Join Us Today!</h1>
            <p className="text-base opacity-90 leading-relaxed">
              Create your eSwap account and start managing your EV solutions 
              with ease. Seamless technology at your fingertips.
            </p>
          </div>
        </div>

        {/* Cột phải */}
        <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
              Create an Account
            </h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Fill in your details to sign up
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
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
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Re-enter your password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#295E9C] text-white py-2 rounded-md font-medium hover:bg-[#1C4078] transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Sign Up'}
              </button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-[#0062FF] hover:text-[#0055E0]">
                  Sign In
                </Link>
              </p>

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
