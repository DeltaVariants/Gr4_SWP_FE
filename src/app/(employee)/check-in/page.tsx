import { Suspense } from 'react';
import { StaffShell } from '@/presentation/components/layouts/StaffShell';
import CheckInContent from './spa';

export default function CheckInPage() {
  return (
    <StaffShell title="Check-in / Verify">
      <Suspense fallback={<div className="bg-white rounded-xl shadow p-6 max-w-3xl">Loading...</div>}>
        <CheckInContent />
      </Suspense>
    </StaffShell>
  );
}
