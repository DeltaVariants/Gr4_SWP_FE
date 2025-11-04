"use client";

import { withStaffAuth } from '@/hoc/withAuth';
import { Table } from '../components/Table';
import { useMemo, useState, useEffect } from 'react';
import bookingService from '@/application/services/bookingService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/presentation/components/ui/Notification';
import { Clock, RefreshCw, Filter, Calendar, User, Car, Battery, CheckCircle2 } from 'lucide-react';

function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    Booked: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    Queue: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    Checked: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    Completed: 'bg-gray-100 text-gray-600 ring-1 ring-gray-300',
    Cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
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

export default withStaffAuth(function ReservationsPage() {
  const [q, setQ] = useState('');
  const [data, setData] = useState<any[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('active'); // active, all
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { showToast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const loadData = async () => {
    setLoading(true);
    try {
      let stationID = (user as any)?.stationId || (user as any)?.stationName;
      if (!stationID && typeof window !== 'undefined') {
        try {
          const meRes = await fetch('/api/auth/me', { cache: 'no-store' });
          const mePayload = await meRes.json().catch(() => ({}));
          if (meRes.ok && mePayload?.success && mePayload.data) {
            stationID = 
              mePayload.data.stationId || 
              mePayload.data.StationID || 
              mePayload.data.stationID || 
              mePayload.data.StationId ||
              mePayload.data.stationName ||
              mePayload.data.StationName;
            
            if (stationID) {
              console.log('[reservations] Found stationID:', stationID);
            } else {
              console.log('[reservations] No stationID found in user data');
            }
          }
        } catch (e) {
          console.error('[reservations] Error fetching /api/auth/me:', e);
        }
      }

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
      setData(rows);
    } catch (e: any) {
      showToast({ type: 'error', message: e?.message || 'Không thể load đặt chỗ' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated || (typeof window !== 'undefined' && localStorage.getItem('accessToken'))) {
      loadData();
    }
  }, [isAuthenticated, user]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadData();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, user]);

  const filtered = useMemo(() => {
    let items = data;
    
    // Filter by status
    if (filterStatus === 'active') {
      items = items.filter(d => !['Completed', 'Cancelled'].includes(d.status));
    }
    
    // Filter by search query
    const s = q.trim().toLowerCase();
    if (s) {
      items = items.filter(d =>
        (d.driver || '').toLowerCase().includes(s) || 
        (d.vehicle || '').toLowerCase().includes(s) || 
        (d.id || '').toLowerCase().includes(s)
      );
    }
    
    return items;
  }, [q, data, filterStatus]);

  // Count by status
  const activeCount = data.filter(d => !['Completed', 'Cancelled'].includes(d.status)).length;
  const queueCount = data.filter(d => d.status === 'Queue').length;
  const checkedCount = data.filter(d => d.status === 'Checked').length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-700 font-medium mb-1">Đang hoạt động</div>
              <div className="text-3xl font-bold text-blue-900">{activeCount}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-amber-700 font-medium mb-1">Đang chờ</div>
              <div className="text-3xl font-bold text-amber-900">{queueCount}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-emerald-700 font-medium mb-1">Đã check-in</div>
              <div className="text-3xl font-bold text-emerald-900">{checkedCount}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Controls */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filterStatus === 'active'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Đang hoạt động
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filterStatus === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                placeholder="Tìm theo tên, xe, ID..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-10 w-full sm:w-64 pl-10 pr-4 rounded-lg border-2 border-gray-200 text-black placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
            <button
              onClick={() => loadData()}
              disabled={loading}
              className="h-10 w-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`h-10 px-3 rounded-lg flex items-center gap-2 font-medium text-sm transition-all ${
                autoRefresh
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
              title="Tự động làm mới (30s)"
            >
              <Clock className="w-4 h-4" />
              {autoRefresh ? 'Auto' : 'Manual'}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading && data.length === 0 ? (
        <div className="p-12 bg-white rounded-xl shadow-sm text-center border border-gray-100">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải danh sách đặt chỗ...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 bg-white rounded-xl shadow-sm text-center border border-gray-100">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Không có đặt chỗ nào</p>
        </div>
      ) : (
        <Table columns={columns} data={filtered} />
      )}
    </div>
  );
});
