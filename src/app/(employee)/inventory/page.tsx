"use client";
import { Table } from '@/presentation/components/ui/staff/Table';
import { useMemo, useState, useEffect } from 'react';
import batteryService from '@/services/batteryService';

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

// client-side state - initially empty; we will load from backend
const initialData: any[] = [];

const STATUS_OPTIONS = [
  { label: 'All statuses', value: '' },
  { label: 'Full', value: 'Full' },
  { label: 'Charging', value: 'Charging' },
  { label: 'Faulty', value: 'Faulty' },
];

export default function InventoryPage() {
  const [status, setStatus] = useState<string>('');
  const [q, setQ] = useState<string>('');
  const [data, setData] = useState<any[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await batteryService.getAllBatteries();
        // Map backend DTOs to table rows (defensive mapping)
        const rows = (list || []).map((b: any) => ({
          id: b.batteryID || b.id || b.BatteryID || b.BatteryCode || b.code || '—',
          type: b.batteryType || b.type || b.model || b.BatteryType || b.Type || '—',
          status: b.status || b.Status || b.batteryStatus || 'Unknown',
          raw: b,
        }));
        if (mounted) setData(rows);
      } catch (e: any) {
        console.error('Load batteries error:', e);
        if (mounted) setError(e?.message || 'Failed to load batteries');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    let items = data || [];
    if (status) items = items.filter((d) => d.status === status);
    const s = q.trim().toLowerCase();
    if (s) {
      items = items.filter((d) => (d.id || '').toLowerCase().includes(s) || (d.type || '').toLowerCase().includes(s));
    }
    return items;
  }, [status, q, data]);
  return (
    <div>
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
      {loading ? (
        <div className="p-6 bg-white rounded-xl shadow-sm text-center">Loading batteries...</div>
      ) : error ? (
        <div className="p-6 bg-rose-50 text-rose-700 rounded-xl shadow-sm">{error}</div>
      ) : (
        <Table columns={columns} data={filtered} empty={<span className="text-sm text-gray-500">No batteries match your filters</span>} />
      )}
    </div>
  );
}
