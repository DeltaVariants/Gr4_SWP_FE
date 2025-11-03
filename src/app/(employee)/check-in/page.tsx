'use client';


import { withStaffAuth } from '@/hoc/withAuth';
import { Suspense } from 'react';
import CheckInContent from './spa';

export default withStaffAuth(function CheckInPage() {
  return (
    <Suspense fallback={<div className="bg-white rounded-xl shadow p-6 max-w-3xl">Loading...</div>}>
      <CheckInContent />
    </Suspense>
  );
});
