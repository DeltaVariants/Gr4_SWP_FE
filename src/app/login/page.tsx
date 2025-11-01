"use client";

import React, { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempted with:", { username, password });
  };

  return (
    <div className="min-h-screen w-full bg-[#EBEFFF] flex flex-col lg:flex-row">
      {/* Left Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center lg:justify-start px-8 lg:pl-[122px] lg:pr-8 py-8 lg:py-0">
        <div className="w-full max-w-[367px]">
          {/* Welcome Message */}
          <h1 className="text-[#1A1A1A] font-bold text-base lg:text-base leading-[19.36px] mb-[24px] lg:mb-[43px] text-center lg:text-left">
            Welcome Back!
          </h1>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-[20px] lg:space-y-[30px]"
          >
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-black text-base mb-[8px] font-normal leading-[19.36px]"
              >
                Username:
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-[34px] px-[16px] border border-[#656ED3] rounded-[50px] bg-transparent focus:outline-none focus:border-[#656ED3] focus:ring-1 focus:ring-[#656ED3] text-base"
                placeholder=""
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-black text-base mb-[8px] font-normal leading-[19.36px]"
              >
                Password:
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[34px] px-[16px] border border-[#656ED3] rounded-[50px] bg-transparent focus:outline-none focus:border-[#656ED3] focus:ring-1 focus:ring-[#656ED3] text-base"
                placeholder=""
              />
            </div>

            {/* Login Button */}
            <div className="pt-[24px] lg:pt-[42px]">
              <button
                type="submit"
                className="w-full h-[34px] lg:h-[34px] bg-[#656ED3] text-[#AFB3FF] font-medium text-base rounded-[50px] hover:bg-[#5865C7] hover:text-white active:bg-[#4f5bb8] transition-all duration-200 leading-[19.36px] shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                Login
              </button>
            </div>
          </form>

          {/* Register Link */}
          <p className="text-black text-base text-center mt-[32px] lg:mt-[54px] font-normal leading-[19.36px]">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-[#656ED3] hover:underline">
              Register
            </a>
          </p>

          {/* Social Media Icons */}
          <div className="flex justify-center space-x-[9px] mt-[24px] lg:mt-[31px]">
            <button className="w-[24.22px] h-[24.07px] flex items-center justify-center hover:opacity-75 transition-opacity">
              <FacebookIcon />
            </button>
            <button className="w-[21.88px] h-[21.88px] flex items-center justify-center hover:opacity-75 transition-opacity">
              <GoogleIcon />
            </button>
            <button className="w-[24.22px] h-[24.22px] flex items-center justify-center hover:opacity-75 transition-opacity">
              <AppleIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Background */}
      <div className="hidden lg:block lg:w-[438px] bg-[#AFB3FF] relative overflow-hidden">
        {/* Decorative circles positioned according to Figma */}
        <div className="absolute bottom-[-189px] left-[-252px] w-[503.51px] h-[462.92px] bg-[#AFB3FF] rounded-full"></div>
        <div className="absolute bottom-[-221px] left-[-287px] w-[542.6px] h-[498.86px] bg-[#838CF1] rounded-full"></div>

        {/* White card with image - positioned to overlap both panels */}
        <div className="absolute top-[37px] left-[-35px] w-[470px] h-[590px] bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-purple-100 via-blue-100 to-purple-200 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-sm">Welcome Image</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Social Media Icon Components (matching Figma dimensions)
function FacebookIcon() {
  return (
    <svg
      width="24.22"
      height="24.07"
      viewBox="0 0 24.22 24.07"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24.22 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.298v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H16.05c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.832 23.027 24.22 18.062 24.22 12.073z"
        fill="#656ED3"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="21.88"
      height="21.88"
      viewBox="0 0 21.88 21.88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.6355 8.9815H20.88V8.94H10.94V12.94H17.2715C16.452 15.336 14.379 16.94 11.82 16.94C8.506 16.94 5.82 14.254 5.82 10.94C5.82 7.626 8.506 4.94 11.82 4.94C13.352 4.94 14.742 5.596 15.749 6.869L18.456 4.162C16.795 2.501 14.49 1.44 11.82 1.44C6.297 1.44 1.82 5.917 1.82 11.44C1.82 16.963 6.297 21.44 11.82 21.44C17.343 21.44 21.82 16.963 21.82 11.44C21.82 10.613 21.751 9.803 21.6355 8.9815Z"
        fill="#656ED3"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      width="24.22"
      height="24.22"
      viewBox="0 0 24.22 24.22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.93 19.72C18.1 20.96 17.22 22.17 15.88 22.19C14.54 22.21 14.11 21.4 12.59 21.4C11.06 21.4 10.59 22.17 9.31997 22.21C8.00997 22.25 7.01997 20.9 6.17997 19.69C4.46997 17.22 3.15997 12.67 4.91997 9.61C5.78997 8.09 7.34997 7.13 9.03997 7.1C10.32 7.08 11.54 7.97 12.33 7.97C13.11 7.97 14.59 6.9 16.14 7.06C16.76 7.09 18.61 7.32 19.78 9.04C19.69 9.1 17.61 10.32 17.63 12.85C17.66 15.87 20.28 16.88 20.31 16.89C20.28 16.96 19.89 18.33 18.93 19.72ZM13.22 3.72C13.95 2.89 15.16 2.26 16.16 2.22C16.29 3.39 15.82 4.57 15.12 5.41C14.43 6.26 13.29 6.92 12.17 6.83C12.02 5.68 12.58 4.48 13.22 3.72Z"
        fill="#656ED3"
      />
    </svg>
  );
}
