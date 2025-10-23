"use client";
import { StaffShell } from '@/presentation/components/layouts/StaffShell';
import { Table } from '@/presentation/components/ui/staff/Table';
import { useMemo, useState } from 'react';

function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    Full: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    Charging: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    Faulty: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    Reserved: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${map[value] || 'bg-gray-50 text-gray-600 ring-1 ring-gray-200'}`}>
      {value}
    </span>
  );
}

const columns = [
  { key: 'id', header: 'Battery ID' },
  { key: 'type', header: 'Type' },
  { key: 'status', header: 'Status', render: (row: any) => <StatusBadge value={row.status} /> },
  { key: 'actions', header: '', render: (row: any) => (
    <div className="flex gap-2">
      <button className="text-xs px-3 py-1.5 rounded-md bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100">Mark Faulty</button>
      <button className="text-xs px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100">In Service</button>
    </div>
  ) },
];

const data = [
  { id: 'BAT-0001', type: '60V-26Ah', status: 'Full' },
  { id: 'BAT-0002', type: '48V-20Ah', status: 'Charging' },
  { id: 'BAT-0003', type: '60V-26Ah', status: 'Faulty' },
];

const STATUS_OPTIONS = [
  { label: 'All statuses', value: '' },
  { label: 'Full', value: 'Full' },
  { label: 'Charging', value: 'Charging' },
  { label: 'Faulty', value: 'Faulty' },
];

export default function InventoryPage() {
  const [status, setStatus] = useState<string>('');
  const [q, setQ] = useState<string>('');

  const filtered = useMemo(() => {
    let items = data;
    if (status) items = items.filter((d) => d.status === status);
    const s = q.trim().toLowerCase();
    if (s) {
      items = items.filter((d) => d.id.toLowerCase().includes(s) || d.type.toLowerCase().includes(s));
    }
    return items;
  }, [status, q]);
  return (
    <StaffShell title="Battery Inventory">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">Track battery availability and status</div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 rounded-md border-gray-300 text-sm text-black"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.label} value={o.value}>{o.label}</option>
            ))}
          </select>
          <input
            placeholder="Search by ID or type"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-9 w-56 rounded-md border-gray-300 text-black placeholder:text-gray-500 focus:border-[#0062FF] focus:ring-[#0062FF]"
          />
        </div>
      </div>
      <Table columns={columns} data={filtered} empty={<span className="text-sm text-gray-500">No batteries match your filters</span>} />
    </StaffShell>
  );
}
