'use client';

import Image from 'next/image';
import { ProfileCard } from './ProfileCard';

export const ProfileLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E6F4FE] p-4">
      <div className="flex w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Banner */}
        <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-[#0062FF] to-[#89B6FF] text-white p-8 flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold">Your Profile</h2>
            <p className="mt-2 text-sm opacity-90">Quản lý thông tin cá nhân, liên hệ và vai trò tài khoản.</p>
          </div>
          <div className="relative h-48 mt-6">
            <Image src="/profile-illustration.svg" alt="Profile" fill className="object-contain" />
          </div>
        </div>

        {/* Content */}
        <div className="w-full md:w-3/5 p-8">
          <h1 className="text-2xl font-semibold mb-6">Hồ sơ</h1>
          <ProfileCard />
        </div>
      </div>
    </div>
  );
};
