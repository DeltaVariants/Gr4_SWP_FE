import { StaffShell } from '@/presentation/components/layouts/StaffShell';
import { StatCard } from '@/presentation/components/ui/staff/StatCard';

export default function ReportsPage() {
  return (
    <StaffShell title="Daily Summary">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Swaps" value={36} />
        <StatCard title="Revenue" value={'$3,820'} />
        <StatCard title="Faulty Batteries" value={2} />
        <StatCard title="Alerts" value={3} />
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="font-semibold mb-3">Charts</div>
        <div className="h-64 bg-gray-50 rounded" />
      </div>
    </StaffShell>
  );
}
