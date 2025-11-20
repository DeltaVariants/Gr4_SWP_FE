"use client";

import Image from 'next/image';
import { ProfileCard } from './ProfileCard';
import { User } from 'lucide-react';

export const ProfileLayout = () => {
  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">Personal Profile</h1>
          <p className="text-sm text-black mt-1">Manage your account information, security, and contact details</p>
        </div>

        <div className="bg-gradient-to-r from-white to-slate-50 rounded-xl shadow-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="col-span-1 flex flex-col items-center md:items-start">
              <div className="w-36 h-36 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg text-white text-3xl font-bold">
                <User className="w-10 h-10" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">Your Information</h2>
              <p className="mt-1 text-sm text-black">Update your profile, change password, and customize your personal information.</p>
            </div>

            <div className="col-span-2">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <ProfileCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
