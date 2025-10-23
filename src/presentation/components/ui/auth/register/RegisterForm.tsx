'use client';'use client';
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { NameInput } from "./NameInput";
import { EmailInput } from "../login/EmailInput";
import { PasswordInput } from "../login/PasswordInput";
import { ConfirmPasswordInput } from "./ConfirmPasswordInput";
import { PhoneInput } from "./PhoneInput";
import { SocialLogin } from "../login/SocialLogin";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
}

export const RegisterForm = () => {
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(0);

  const validateField = (field: string, value: string) => {
    let error = "";
    if (field === "name") {
      if (!value.trim()) error = "Tên là bắt buộc";
      else if (value.trim().length < 2) error = "Tên phải có ít nhất 2 ký tự";
      else if (value.trim().length > 50) error = "Tên không được quá 50 ký tự";
    }
    if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) error = "Email là bắt buộc";
      else if (!emailRegex.test(value)) error = "Vui lòng nhập địa chỉ email hợp lệ";
    }
    if (field === "password") {
      if (!value) error = "Mật khẩu là bắt buộc";
      else if (value.length < 6) error = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (field === "confirmPassword") {
      if (!value) error = "Vui lòng xác nhận mật khẩu";
      else if (value !== formData.password) error = "Mật khẩu xác nhận không khớp";
    }
    if (field === "phoneNumber") {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (value && !phoneRegex.test(value)) error = "Số điện thoại phải có 10-11 chữ số";
    }
    return error;
  };

  const handleChange = (field: keyof RegisterFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    setApiError("");
  };

  const validateAll = () => {
    const newErrors: Record<string, string> = {};
    Object.entries(formData).forEach(([k, v]) => {
      if (typeof v === "string") newErrors[k] = validateField(k, v);
    });
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (!validateAll()) return;

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
      });

      if (!result.success) {
        setApiError(result.message || "Đăng ký thất bại");
        return;
      }

      setSuccess(true);
      let countdown = 3;
      setRedirectCountdown(countdown);
      const interval = setInterval(() => {
        countdown -= 1;
        setRedirectCountdown(countdown);
        if (countdown <= 0) {
          clearInterval(interval);
          window.location.href = "/login?registered=true";
        }
      }, 1000);
    } catch (err: any) {
      setApiError(err.message || "Đăng ký thất bại");
    }
  };

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">Create an Account</h2>
      <p className="text-sm text-gray-600 text-center mb-6">Fill in your details to sign up</p>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Đăng ký thành công!</p>
              <p className="text-sm">Chuyển hướng đến trang đăng nhập trong {redirectCountdown} giây...</p>
            </div>
          </div>
        </div>
      )}

      {apiError && !success && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{apiError}</p>
            </div>
          </div>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <NameInput value={formData.name} onChange={handleChange("name")} onBlur={() => {}} error={errors.name} disabled={loading || success} />
        <EmailInput value={formData.email} onChange={handleChange("email")} onBlur={() => {}} error={errors.email} disabled={loading || success} />
        <PhoneInput value={formData.phoneNumber || ""} onChange={handleChange("phoneNumber")} onBlur={() => {}} error={errors.phoneNumber} disabled={loading || success} />
        <PasswordInput value={formData.password} onChange={handleChange("password")} onBlur={() => {}} error={errors.password} disabled={loading || success} />
        <ConfirmPasswordInput value={formData.confirmPassword} onChange={handleChange("confirmPassword")} onBlur={() => {}} error={errors.confirmPassword} disabled={loading || success} />

        <button
          type="submit"
          disabled={loading || success}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </div>
          ) : success ? (
            "Account Created!"
          ) : (
            "Create Account"
          )}
        </button>

        <div className="text-center mt-4">
          <SocialLogin />
        </div>

        <div className="text-center text-sm text-gray-600">
          Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Sign in here</Link>
        </div>
      </form>
    </div>
  );
};