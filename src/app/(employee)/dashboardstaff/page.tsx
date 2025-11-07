"use client";
import { StatCard } from '@/presentation/components/ui/staff/StatCard';
import { Table } from '@/presentation/components/ui/staff/Table';
import Link from 'next/link';
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

const initialData: any[] = [];

export default function StaffDashboard() {
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
        // Pass stationId when available; some backend endpoints require station-scoped requests
        let stationID = (user as any)?.stationId;
        // If user object doesn't have stationId yet, try to get it from /api/auth/me
        if (!stationID && typeof window !== 'undefined') {
          try {
            const meRes = await fetch('/api/auth/me', { cache: 'no-store' });
            const mePayload = await meRes.json().catch(() => ({}));
            // backend shape may vary; try multiple possible paths
            const src = mePayload?.data ?? mePayload?.user ?? mePayload ?? {};
            const candidate = src?.data ?? src; // sometimes payload.data.data
            stationID =
              candidate?.stationId || candidate?.StationID || candidate?.stationID || candidate?.StationId ||
              candidate?.station || candidate?.station_id || candidate?.Station || candidate?.Station_Id || undefined;
            if (!stationID && process.env.NODE_ENV === 'development') {
              // surface payload for debugging in dev
              // eslint-disable-next-line no-console
              console.log('[dashboardstaff] /api/auth/me payload:', mePayload);
            }
          } catch (e) {
            // ignore network/parse errors
          }
        }

        // Không có stationID vẫn tiếp tục: proxy sẽ tự fallback theo stationName nếu có
        const list = await bookingService.getAllBookingOfStation(stationID);
        const rows = (list || []).map((b: any) => ({
          id: b.bookingID || b.id || b.BookingID || b.bookingId,
          name: b.customerName || b.username || b.customer || b.driver || '—',
          plate: b.vehicleId || b.vehicle || b.plate || '—',
          eta: b.bookingTime || b.time || b.bookingHour || '--',
          status: b.bookingStatus || b.status || 'Booked',
          raw: b,
        }));
        if (mounted) setData(rows);
      } catch (e: any) {
        showToast({ type: 'error', message: e?.message || 'Không thể load dữ liệu' });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    // Only load when auth state is known; if not authenticated yet, skip and let AuthProvider refresh
    if (isAuthenticated || (typeof window !== 'undefined' && localStorage.getItem('accessToken'))) {
      load();
    }
    return () => { mounted = false; };
  }, [showToast, user, isAuthenticated]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter(d =>
      (d.name || '').toLowerCase().includes(s) || (d.plate || '').toLowerCase().includes(s) || (d.id || '').toLowerCase().includes(s)
    );
  }, [q, data]);
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
