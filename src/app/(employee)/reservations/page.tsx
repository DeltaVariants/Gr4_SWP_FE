"use client";
import { Table } from '@/presentation/components/ui/staff/Table';
import { useMemo, useState, useEffect } from 'react';
import bookingService from '@/services/bookingService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/presentation/components/ui/Notification';

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

const initialData: any[] = [];

export default function ReservationsPage() {
  const [q, setQ] = useState('');
  const [data, setData] = useState<any[]>(initialData);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        let stationID = (user as any)?.stationId;
        if (!stationID && typeof window !== 'undefined') {
          try {
            const meRes = await fetch('/api/auth/me', { cache: 'no-store' });
            const mePayload = await meRes.json().catch(() => ({}));
            if (meRes.ok && mePayload?.success && mePayload.data) {
              stationID = mePayload.data.stationId || mePayload.data.StationID || mePayload.data.stationID || mePayload.data.StationId;
            }
          } catch (e) {}
        }

        // Không có stationID vẫn tiếp tục: proxy sẽ tự fallback theo stationName nếu có
        const list = await bookingService.getAllBookingOfStation(stationID);
        const rows = (list || []).map((b: any) => ({
          id: b.bookingID || b.id || b.BookingID || b.bookingId,
          time: b.bookingTime || b.time || b.bookingHour || '--',
          driver: b.customerName || b.username || b.customer || b.driver || '—',
          vehicle: b.vehicleId || b.vehicle || b.plate || '—',
          battery: b.batteryType || b.batteryTypeName || '—',
          status: b.bookingStatus || b.status || 'Booked',
          raw: b,
        }));
        if (mounted) setData(rows);
      } catch (e: any) {
        showToast({ type: 'error', message: e?.message || 'Không thể load đặt chỗ' });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (isAuthenticated || (typeof window !== 'undefined' && localStorage.getItem('accessToken'))) {
      load();
    }
    return () => { mounted = false; };
  }, [showToast, user, isAuthenticated]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter(d =>
      (d.driver || '').toLowerCase().includes(s) || (d.vehicle || '').toLowerCase().includes(s) || (d.id || '').toLowerCase().includes(s)
    );
  }, [q, data]);

  return (
    <div>
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
      {loading ? (
        <div className="p-6 bg-white rounded-xl shadow-sm text-center">Loading reservations...</div>
      ) : (
        <Table columns={columns} data={filtered} />
      )}
    </div>
  );
}
