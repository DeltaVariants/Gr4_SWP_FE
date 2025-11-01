import { StatCard } from '@/presentation/components/ui/staff/StatCard';

export default function ReportsPage() {
  return (
    <div className="max-w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Swaps" value={36} />
        <StatCard title="Revenue" value={'$3,820'} />
        <StatCard title="Faulty Batteries" value={2} />
        <StatCard title="Alerts" value={3} />
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="font-bold text-lg text-[#0062FF] mb-3">Charts</div>
        <div className="h-64 bg-[#f5f5f5] rounded flex items-center justify-center">
          <span className="text-gray-400">No chart data yet</span>
        </div>
      </div>
    </div>
  );
}
