"use client";
import { Table } from '@/presentation/components/ui/staff/Table';
import { useMemo, useState, useEffect } from 'react';
import { useToast } from '@/presentation/components/ui/Notification/ToastProvider';
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

function UpdateActions({ row, onOpen }: { row: Record<string, unknown>; onOpen: (r: Record<string, unknown>) => void }) {
  return (
    <div className="flex gap-2">
      <button onClick={() => onOpen(row)} className="text-xs px-3 py-1.5 rounded-md bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100">Mark Faulty</button>
      <button onClick={() => onOpen(row)} className="text-xs px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100">In Service</button>
    </div>
  );
}

// NOTE: columns need access to onOpen handler so they are defined inside the component

const initialData: Record<string, unknown>[] = [];

const STATUS_OPTIONS = [
  { label: 'All statuses', value: '' },
  { label: 'Full', value: 'Full' },
  { label: 'Charging', value: 'Charging' },
  { label: 'Faulty', value: 'Faulty' },
];

export default function InventoryPage() {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [q, setQ] = useState<string>('');
  const [data, setData] = useState<Record<string, unknown>[]>(initialData);
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
        function getFirstString(obj: Record<string, unknown>, keys: string[], fallback = '—') {
          for (const k of keys) {
            const v = obj[k];
            if (typeof v === 'string' && v) return v;
            if (typeof v === 'number') return String(v);
          }
          return fallback;
        }

        const rows = (list || []).map((b: Record<string, unknown>) => ({
          id: getFirstString(b, ['batteryID', 'id', 'BatteryID', 'BatteryCode', 'code']),
          type: getFirstString(b, ['batteryType', 'type', 'model', 'BatteryType', 'Type']),
          status: getFirstString(b, ['status', 'Status', 'batteryStatus'], 'Unknown'),
          raw: b,
        }));
        if (mounted) setData(rows);
        } catch (e: unknown) {
        console.error('Load batteries error:', e);
        if (mounted) {
          const msg = (e && typeof e === 'object' && 'message' in (e as Record<string, unknown>)) ? String((e as Record<string, unknown>)['message']) : 'Failed to load batteries';
          setError(msg);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    let items = data || [];
    if (status) items = items.filter((d) => String((d as Record<string, unknown>)['status']) === status);
    const s = q.trim().toLowerCase();
    if (s) {
      items = items.filter((d) => (String((d as Record<string, unknown>)['id'] || '')).toLowerCase().includes(s) || (String((d as Record<string, unknown>)['type'] || '')).toLowerCase().includes(s));
    }
    return items;
  }, [status, q, data]);

  // columns are created here so they can close over handlers like onOpen
  const onOpen = (row: Record<string, unknown>) => {
    setSelected(row);
  setNewStatus(String(row['status'] || '') || '');
    setReason('');
    setModalOpen(true);
  };

  const columnsLocal = [
    { key: 'id', header: 'Battery ID' },
    { key: 'type', header: 'Type' },
  { key: 'status', header: 'Status', render: (row: Record<string, unknown>) => <StatusBadge value={String(row['status'] || '')} /> },
    { key: 'actions', header: '', render: (row: Record<string, unknown>) => (
      <UpdateActions row={row} onOpen={onOpen} />
    ) },
  ];

  const handleConfirm = async () => {
    if (!selected) return;
  const id = String((selected as Record<string, unknown>)['id'] || (selected as Record<string, unknown>)['batteryID'] || (String(((selected as Record<string, unknown>)['raw'] as Record<string, unknown>)?.['batteryID'] || '') || ''));
    const payload = { batteryId: id, status: newStatus, reason: reason || undefined };
    try {
      toast.showToast({ message: 'Updating battery status...', type: 'info' });
      await batteryService.updateBatteryStatus(payload);
      // optimistic update locally
  setData((prev) => prev.map((r) => (String(r['id']) === String(selected?.['id']) ? { ...(r as Record<string, unknown>), status: newStatus, reason } : r)));
      setModalOpen(false);
      toast.showToast({ message: 'Battery status updated', type: 'success' });
    } catch (e: unknown) {
      console.error('Update battery status error', e);
      const msg = (e && typeof e === 'object' && 'message' in (e as Record<string, unknown>)) ? String((e as Record<string, unknown>)['message']) : 'Failed to update status';
      toast.showToast({ message: msg, type: 'error' });
    }
  };
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
        <>
          <Table columns={columnsLocal} data={filtered} empty={<span className="text-sm text-gray-500">No batteries match your filters</span>} />

          {/* Modal: Update Battery Status */}
          {modalOpen && selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
              <div className="relative bg-white rounded-xl p-6 w-[420px] shadow-lg">
                <h3 className="text-lg font-semibold">Update Battery Status</h3>
                <div className="mt-3 text-sm text-gray-600">Battery: <span className="font-medium">{String(selected?.['id'] || '')}</span></div>
                <div className="mt-4">
                  <label className="block text-xs text-gray-600">Choose new status</label>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="mt-2 w-full h-9 rounded-md border-gray-200">
                    <option value="">-- select --</option>
                    <option value="Full">Full</option>
                    <option value="Charging">Charging</option>
                    <option value="Faulty">Faulty</option>
                  </select>
                </div>
                <div className="mt-4">
                  <label className="block text-xs text-gray-600">Reason / Notes (optional)</label>
                  <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter a short reason or notes" className="mt-2 w-full rounded-md border-gray-200 p-2 text-sm h-20" />
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-md bg-gray-100">Cancel</button>
                  <button onClick={handleConfirm} className="px-4 py-2 rounded-md bg-blue-600 text-white">Confirm</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
