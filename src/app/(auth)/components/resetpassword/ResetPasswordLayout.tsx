'use client';

import { ResetPasswordBanner } from './ResetPasswordBanner';
import { ResetPasswordForm } from './ResetPasswordForm';

interface ResetPasswordLayoutProps {
  email: string;
}

export const ResetPasswordLayout = ({ email }: ResetPasswordLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E6F4FE] p-4">
      <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        <ResetPasswordBanner />
        <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
          <ResetPasswordForm email={email} />
        </div>
      </div>
    </div>
  );
};