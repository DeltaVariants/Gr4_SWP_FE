"use client";

import Image from "next/image";

export const LoginBanner = () => {
  return (
    <div className="hidden md:flex w-1/2 bg-gradient-to-b from-indigo-600 to-indigo-800 text-white flex-col items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="w-28 h-28 mx-auto mb-6 flex items-center justify-center rounded-full bg-white p-4">
          <Image
            src="/logo/eSwap_Logo_1.png"
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
  );
};
