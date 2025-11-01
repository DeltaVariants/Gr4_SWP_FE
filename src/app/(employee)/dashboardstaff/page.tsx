"use client";
import { StatCard } from '@/presentation/components/ui/staff/StatCard';
import { Table } from '@/presentation/components/ui/staff/Table';
import Link from 'next/link';
import { useMemo, useState } from 'react';

function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    Booked: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    Queue: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    Checked: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${map[value] || 'bg-gray-50 text-gray-600 ring-1 ring-gray-200'}`}>
      {value}
    </span>
  );
}

const columns = [
  { key: 'name', header: 'Customer' },
  { key: 'plate', header: 'Plate' },
  { key: 'eta', header: 'ETA' },
  { key: 'status', header: 'Status', render: (row: any) => <StatusBadge value={row.status} /> },
  {
    key: 'actions',
    header: '',
    render: (row: any) => (
      <a
        href={`/check-in?reservationId=${row.id}`}
        className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[#0062FF] hover:bg-[#0052d6] shadow-sm"
      >
        Check-in
      </a>
    ),
  },
];

const data = [
  { id: 'r1', name: 'Nguyen A', plate: '59A-123.45', eta: '09:20', status: 'Booked' },
  { id: 'r2', name: 'Tran B', plate: '60B-678.90', eta: '09:35', status: 'Queue' },
  { id: 'r3', name: 'Le C', plate: '51C-246.80', eta: '09:50', status: 'Booked' },
  { id: 'r4', name: 'Pham D', plate: '50F-112.21', eta: '10:05', status: 'Queue' },
];

export default function StaffDashboard() {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter(d =>
      d.name.toLowerCase().includes(s) || d.plate.toLowerCase().includes(s) || d.id.toLowerCase().includes(s)
    );
  }, [q]);
  return (
    <div>
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Active Reservations"
          value={data.filter(d => d.status === 'Booked').length}
          footer={'+3 today'}
          titleClassName="text-gray-900"
          valueClassName="text-[#0B5FFF] font-bold"
          footerClassName="text-gray-500"
        />
        <StatCard
          title="Queue"
          value={data.filter(d => d.status === 'Queue').length}
          footer={'Avg wait 6m'}
          titleClassName="text-gray-900"
          valueClassName="text-amber-600 font-bold"
          footerClassName="text-gray-500"
        />
        <StatCard
          title="Batteries Full"
          value={28}
          footer={'+9 since morning'}
          titleClassName="text-gray-900"
          valueClassName="text-emerald-600 font-bold"
          footerClassName="text-gray-500"
        />
      </div>

      {/* Active Reservations / Queue */}
      <div className="mb-6 bg-white/95 backdrop-blur rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-bold text-gray-900">Active Reservations / Queue</div>
            <div className="text-sm text-gray-600">Xem danh sách khách sắp đến hoặc đang chờ</div>
          </div>
          <div className="flex items-center gap-2">
            <input
              placeholder="Tìm theo tên/biển số/mã đặt"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-9 w-64 rounded-md border-gray-300 text-black placeholder:text-gray-500 focus:border-[#0062FF] focus:ring-[#0062FF]"
            />
            <button className="h-9 px-3 rounded-md border text-sm">Filter</button>
          </div>
        </div>
        <Table columns={columns} data={filtered} />
      </div>

      {/* Quick actions for the flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Link href="/reservations" className="group block bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-5 hover:shadow transition">
          <div className="font-semibold text-gray-900 mb-1">Check-in Driver / Verify</div>
          <div className="text-sm text-gray-600">Xác minh thông tin đặt chỗ khi khách đến</div>
        </Link>
        <Link href="/swap" className="group block bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-5 hover:shadow transition">
          <div className="font-semibold text-gray-900 mb-1">Start Battery Swap</div>
          <div className="text-sm text-gray-600">Bắt đầu quy trình thay pin sau khi xác thực</div>
        </Link>
        <Link href="/swap" className="group block bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-5 hover:shadow transition">
          <div className="font-semibold text-gray-900 mb-1">Scan Battery IDs</div>
          <div className="text-sm text-gray-600">Quét pin In/Out để cập nhật hệ thống</div>
        </Link>
        <Link href="/swap" className="group block bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-5 hover:shadow transition">
          <div className="font-semibold text-gray-900 mb-1">Confirm Swap Completion</div>
          <div className="text-sm text-gray-600">Xác nhận hoàn tất, ghi nhận giao dịch</div>
        </Link>
      </div>
    </div>
  );
}
