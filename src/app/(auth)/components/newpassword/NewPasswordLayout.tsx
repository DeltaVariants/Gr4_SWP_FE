'use client';

import NewPasswordBanner from './NewPasswordBanner';
import NewPasswordForm from './NewPasswordForm';

interface NewPasswordLayoutProps {
  email: string;
}

export default function NewPasswordLayout({ email }: NewPasswordLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E6F4FE] p-4">
      <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        <NewPasswordBanner />
        <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
          <NewPasswordForm email={email} />
        </div>
      </div>
    </div>
  );
}