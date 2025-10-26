'use client';

import Image from 'next/image';
import { ProfileCard } from './ProfileCard';

export const ProfileLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E6F4FE] p-4">
      <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Banner (giữ phong cách giống LoginBanner) */}
        <div className="hidden md:flex md:w-2/5 bg-gradient-to-b from-[#295E9C] to-[#1C4078] text-white p-6 flex-col justify-between min-h-[420px]">
          <div>
            <h2 className="text-lg font-semibold">Your Profile</h2>
            <p className="mt-1 text-xs opacity-90">Quản lý thông tin cá nhân của bạn một cách gọn gàng và nhất quán.</p>
          </div>
          <div className="relative h-48 mt-6">
            <Image src="/profile-illustration.svg" alt="Profile" fill className="object-contain" />
          </div>
        </div>

        {/* Content (kích thước gọn như login form) */}
        <div className="w-full md:w-3/5 p-8 flex items-center justify-center">
          <div className="w-full max-w-md">
            <h1 className="text-xl font-semibold text-gray-900 text-center mb-2">Hồ sơ</h1>
            <p className="text-sm text-gray-600 text-center mb-6">Thông tin tài khoản và liên hệ</p>
            <ProfileCard />
          </div>
        </div>
      </div>
    </div>
  );
};
