"use client";

import { withStaffAuth } from '@/hoc/withAuth';
import { StatCard } from '../components/StatCard';
import { Table } from '../components/Table';
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import bookingService from '@/application/services/bookingService';
import batteryService from '@/application/services/batteryService';
import reportsService from '@/application/services/reportsService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/presentation/components/ui/Notification';
import { Calendar, Battery, DollarSign, AlertTriangle, TrendingUp, Clock, RefreshCw, ArrowRight } from 'lucide-react';

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

export default withStaffAuth(function StaffDashboard() {
  const [q, setQ] = useState('');
  const [data, setData] = useState<any[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [batteries, setBatteries] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any>(null);
  const [transfers, setTransfers] = useState<any[]>([]);
  const { showToast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Load local transfers for today's swap count
  useEffect(() => {
    try {
      const raw = localStorage.getItem('localTransfers_v1');
      const list = raw ? JSON.parse(raw) : [];
      // Filter today's transfers
      const today = new Date().toDateString();
      const todayTransfers = list.filter((t: any) => {
        const transferDate = new Date(t.createdAt).toDateString();
        return transferDate === today;
      });
      setTransfers(todayTransfers);
    } catch (e) {
      setTransfers([]);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // Pass stationId when available; some backend endpoints require station-scoped requests
        let stationID = (user as any)?.stationId || (user as any)?.stationName;
        // If user object doesn't have stationId yet, try to get it from /api/auth/me
        if (!stationID && typeof window !== 'undefined') {
          try {
            const meRes = await fetch('/api/auth/me', { cache: 'no-store' });
            const mePayload = await meRes.json().catch(() => ({}));
            
            const src = mePayload?.data ?? mePayload?.user ?? mePayload ?? {};
            const candidate = src?.data ?? src; // sometimes payload.data.data
            stationID =
              candidate?.stationId || candidate?.StationID || candidate?.stationID || candidate?.StationId ||
              candidate?.stationName || candidate?.StationName ||
              candidate?.station || candidate?.station_id || candidate?.Station || candidate?.Station_Id || undefined;
            if (stationID) {
              console.log('[dashboardstaff] Found stationID:', stationID);
            } else if (process.env.NODE_ENV === 'development') {
              // surface payload for debugging in dev
              console.log('[dashboardstaff] No stationID found in /api/auth/me');
              console.log('[dashboardstaff] Available keys:', Object.keys(candidate));
            }
          } catch (e) {
            console.error('[dashboardstaff] Error fetching /api/auth/me:', e);
          }
        }

        // Load bookings
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

        // Load batteries
        try {
          const batteryList = await batteryService.getAllBatteries();
          if (mounted) setBatteries(batteryList || []);
        } catch (e) {
          console.error('Failed to load batteries:', e);
        }

        // TODO: Load revenue report - Currently disabled due to 403 permission
        // Backend requires Admin role for /reports/daily-revenue endpoint
        // Uncomment when backend grants Staff access
        /*
        try {
          const today = new Date().toISOString().split('T')[0];
          const revenueData = await reportsService.getRevenueReportInDay({ date: today });
          if (mounted) setRevenue(revenueData);
        } catch (e: any) {
          console.warn('[Dashboard] ⚠️ Could not load revenue data:', e?.message);
          if (mounted) setRevenue(null);
        }
        */

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

  // Calculate stats
  const activeReservations = data.filter(d => d.status === 'Booked').length;
  const queueCount = data.filter(d => d.status === 'Queue').length;
  const fullBatteries = batteries.filter(b => b.status === 'Full' || b.status === 'Available').length;
  const faultyBatteries = batteries.filter(b => b.status === 'Faulty').length;
  const todaySwaps = transfers.filter(t => t.status === 'Completed').length;
  const todayRevenue = revenue?.totalRevenue || revenue?.revenue || 0;

  return (
    <div className="space-y-6">
      {/* Hero Stats - Today's Performance */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Staff Dashboard</h2>
            <p className="text-blue-100">Tổng quan hoạt động hôm nay</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100 mb-1">Ngày</div>
            <div className="text-xl font-semibold">{new Date().toLocaleDateString('vi-VN')}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm text-blue-100">Swaps hôm nay</div>
            </div>
            <div className="text-4xl font-bold">{todaySwaps}</div>
          </div>

          {/* TODO: Revenue card - Hidden until backend grants Staff permission 
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm text-blue-100">Doanh thu</div>
            </div>
            <div className="text-4xl font-bold">{todayRevenue.toLocaleString()}</div>
          </div>
          */}

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <Battery className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm text-blue-100">Pin sẵn sàng</div>
            </div>
            <div className="text-4xl font-bold">{fullBatteries}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm text-blue-100">Pin lỗi</div>
            </div>
            <div className="text-4xl font-bold">{faultyBatteries}</div>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-blue-700 font-medium mb-1">Đang chờ đổi pin</div>
              <div className="text-3xl font-bold text-blue-900">{activeReservations}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <Link href="/reservations" className="text-sm text-blue-700 font-medium hover:text-blue-800 flex items-center gap-1">
            Xem chi tiết <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-amber-700 font-medium mb-1">Trong hàng đợi</div>
              <div className="text-3xl font-bold text-amber-900">{queueCount}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="text-sm text-amber-700">Avg wait: ~6 phút</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-emerald-700 font-medium mb-1">Tổng pin</div>
              <div className="text-3xl font-bold text-emerald-900">{batteries.length}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <Battery className="w-6 h-6" />
            </div>
          </div>
          <Link href="/inventory" className="text-sm text-emerald-700 font-medium hover:text-emerald-800 flex items-center gap-1">
            Quản lý kho <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Active Reservations / Queue */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Active Reservations / Queue
            </h3>
            <p className="text-sm text-gray-600 mt-1">Xem danh sách khách sắp đến hoặc đang chờ</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              placeholder="Tìm theo tên/biển số/mã đặt"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-10 w-64 rounded-lg border-2 border-gray-200 px-3 text-black placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
            <button className="h-10 w-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all">
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Không có đặt chỗ nào</p>
          </div>
        ) : (
          <Table columns={columns} data={filtered} />
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Link href="/reservations" className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">Check-in & Verify</div>
                <div className="text-sm text-gray-600">Xác minh đặt chỗ</div>
              </div>
            </div>
          </Link>

          <Link href="/swap" className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200 hover:shadow-lg transition-all">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Battery className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">Battery Swap</div>
                <div className="text-sm text-gray-600">Đổi pin cho khách</div>
              </div>
            </div>
          </Link>

          <Link href="/inventory" className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 hover:shadow-lg transition-all">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Battery className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">Inventory</div>
                <div className="text-sm text-gray-600">Quản lý kho pin</div>
              </div>
            </div>
          </Link>

          <Link href="/reports" className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-all">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">Reports</div>
                <div className="text-sm text-gray-600">Xem báo cáo</div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
});
