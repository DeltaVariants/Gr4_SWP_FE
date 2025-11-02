"use client";
import { useEffect, useMemo, useState } from 'react';
import { StatCard } from '@/presentation/components/ui/staff/StatCard';
import { Table } from '@/presentation/components/ui/staff/Table';

const LOCAL_TRANSFERS_KEY = 'localTransfers_v1';

export default function ReportsPage() {
  const [transfers, setTransfers] = useState<Record<string, unknown>[]>([]);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_TRANSFERS_KEY);
      const list = raw ? JSON.parse(raw) : [];
      setTransfers(list as Record<string, unknown>[]);
    } catch (e) { setTransfers([]); }
  }, []);

  const filtered = useMemo(() => {
    let items = transfers.slice();
  if (statusFilter) items = items.filter((t) => (String((t as Record<string, unknown>)['status'] || '')).toLowerCase() === statusFilter.toLowerCase());
    const s = q.trim().toLowerCase();
  if (s) items = items.filter((t) => (String((t as Record<string, unknown>)['transferId'] || '')).toLowerCase().includes(s) || (String((t as Record<string, unknown>)['oldBatteryId'] || '')).toLowerCase().includes(s) || (String((t as Record<string, unknown>)['newBatteryId'] || '')).toLowerCase().includes(s));
    return items;
  }, [transfers, q, statusFilter]);

  const columns = [
    { key: 'transferId', header: 'Transfer ID' },
    { key: 'oldBatteryId', header: 'Old Battery' },
    { key: 'newBatteryId', header: 'New Battery' },
    { key: 'status', header: 'Status' },
    { key: 'createdAt', header: 'Time', render: (r: Record<string, unknown>) => new Date((r['createdAt'] as string) || (r['created'] as string) || Date.now()).toLocaleString() },
    { key: 'details', header: 'Details', render: (r: Record<string, unknown>) => (
      <div className="text-sm text-gray-700">
        {(r['exception'] as Record<string, unknown>) ? (
          <div>
            <div className="font-medium text-rose-600">{String((r['exception'] as Record<string, unknown>)['type'] || '')}</div>
            <div className="text-xs text-gray-600">{String((r['exception'] as Record<string, unknown>)['reason'] || '')}</div>
          </div>
        ) : (
          <div className="text-xs text-gray-500">—</div>
        )}
      </div>
    ) },
  ];

  return (
    <div className="max-w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Local Swaps Logged" value={transfers.length} />
        <StatCard title="Completed" value={transfers.filter(t => t.status === 'Completed').length} />
        <StatCard title="Exceptions" value={transfers.filter(t => t.status === 'Exception' || t.status === 'Cancelled').length} />
        <StatCard title="Alerts" value={transfers.filter(t => t.status === 'Exception').length} />
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="font-bold text-lg text-[#0062FF]">Event Log</div>
          <div className="flex items-center gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-md border-gray-300 text-sm text-black">
              <option value="">All statuses</option>
              <option value="Completed">Completed</option>
              <option value="Exception">Exception</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 w-56 rounded-md border-gray-300 text-black placeholder:text-gray-500" />
          </div>
        </div>

        <Table columns={columns} data={filtered} empty={<span className="text-sm text-gray-500">No events recorded yet</span>} />
      </div>
    </div>
  );
}
