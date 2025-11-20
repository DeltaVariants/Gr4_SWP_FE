'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import NewPasswordLayout from '../components/newpassword/NewPasswordLayout';

function NewPasswordContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  return <NewPasswordLayout email={email} />;
}

export default function NewPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <NewPasswordContent />
    </Suspense>
  );
}