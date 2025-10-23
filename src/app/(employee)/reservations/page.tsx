"use client";
import { StaffShell } from '@/presentation/components/layouts/StaffShell';
import { Table } from '@/presentation/components/ui/staff/Table';
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
  { key: 'time', header: 'Time' },
  { key: 'driver', header: 'Driver' },
  { key: 'vehicle', header: 'Vehicle' },
  { key: 'battery', header: 'Battery Type' },
  { key: 'status', header: 'Status', render: (row: any) => <StatusBadge value={row.status} /> },
  { key: 'actions', header: '' , render: (row: any) => (
    <a
  href={`/check-in?reservationId=${row.id}`}
      className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[#0062FF] hover:bg-[#0052d6] shadow-sm"
    >
      Check-in
    </a>
  )},
];

const data = [
  { id: 'r1', time: '09:20', driver: 'Nguyen A', vehicle: 'Yamaha', battery: '48V-20Ah', status: 'Booked' },
  { id: 'r2', time: '09:35', driver: 'Tran B', vehicle: 'Honda', battery: '60V-26Ah', status: 'Queue' },
];

export default function ReservationsPage() {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter(d =>
      d.driver.toLowerCase().includes(s) || d.vehicle.toLowerCase().includes(s) || d.id.toLowerCase().includes(s)
    );
  }, [q]);
  return (
    <StaffShell title="Reservations / Queue">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">Upcoming reservations</div>
        <div className="flex items-center gap-2">
          <input
            placeholder="Search name or plate"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-9 w-56 rounded-md border-gray-300 text-black placeholder:text-gray-500 focus:border-[#0062FF] focus:ring-[#0062FF]"
          />
          <button className="h-9 px-3 rounded-md border text-sm">Filter</button>
        </div>
      </div>
      <Table columns={columns} data={filtered} />
    </StaffShell>
  );
}
