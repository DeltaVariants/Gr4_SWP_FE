'use client';

import { RegisterBanner } from './RegisterBanner';
import { RegisterForm } from './RegisterForm';

const RegisterLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E6F4FE] p-4">
      <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        <RegisterBanner />
        <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export { RegisterLayout };