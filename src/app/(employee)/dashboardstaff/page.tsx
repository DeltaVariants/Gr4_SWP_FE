"use client";

import { withStaffAuth } from '@/hoc/withAuth';
import { StatCard } from '../components/StatCard';
import { Table } from '../components/Table';
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import bookingService from '@/application/services/bookingService';
import reportsService from '@/application/services/reportsService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/presentation/components/ui/Notification';
import { useBatteries } from '@/presentation/hooks/useBatteries';
import { Calendar, Battery, DollarSign, AlertTriangle, TrendingUp, Clock, RefreshCw, ArrowRight } from 'lucide-react';

function StatusBadge({ value }: { value: string }) {
  const statusLower = (value || '').toLowerCase();
  
  const map: Record<string, { style: string; label: string }> = {
    pending: { 
      style: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
      label: '⏳ Pending'
    },
    booked: { 
      style: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
      label: '📅 Booked'
    },
    queue: { 
      style: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
      label: '⏱ Queue'
    },
    checked: { 
      style: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
      label: '✓ Checked In'
    },
  };
  
  const config = map[statusLower] || { 
    style: 'bg-gray-50 text-gray-600 ring-1 ring-gray-200',
    label: value
  };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.style}`}>
      {config.label}
    </span>
  );
}

const columns = [
  { key: 'name', header: 'Customer' },
  { key: 'date', header: 'Date' },
  { key: 'time', header: 'Time' },
  { key: 'status', header: 'Status', render: (row: any) => <StatusBadge value={row.status} /> },
];

const initialData: any[] = [];

export default withStaffAuth(function StaffDashboard() {
  const [q, setQ] = useState('');
  const [data, setData] = useState<any[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [revenue, setRevenue] = useState<any>(null);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // 10 items per page
  const { showToast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  // Get stationId from user
  const stationId = user?.stationId;
  
  // Use useBatteries hook (same as Inventory page) to get station-specific batteries
  const { batteries, inventory } = useBatteries(stationId);

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
        
        // Debug: log first booking to see available fields
        if (list && list.length > 0) {
          console.log('[dashboardstaff] Sample booking:', list[0]);
          console.log('[dashboardstaff] Available fields:', Object.keys(list[0]));
        }
        
        const rows = (list || []).map((b: any) => {
          // Extract customer name - try many possible field names
          const customerName = b.customerName || b.CustomerName || 
                               b.username || b.userName || b.UserName ||
                               b.fullName || b.FullName ||
                               b.customer || b.Customer ||
                               b.driver || b.Driver ||
                               b.user?.name || b.user?.fullName ||
                               b.Customer?.FullName || b.User?.FullName ||
                               '—';
          
          // Format date and time from bookingTime
          const bookingTimeStr = b.bookingTime || b.BookingTime || b.time || b.bookingHour || '';
          let dateStr = '--';
          let timeStr = '--';
          
          if (bookingTimeStr) {
            try {
              const dt = new Date(bookingTimeStr);
              // Format: DD/MM/YYYY
              dateStr = dt.toLocaleDateString('vi-VN');
              // Format: HH:mm
              timeStr = dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            } catch (e) {
              console.warn('[dashboardstaff] Failed to parse date:', bookingTimeStr);
            }
          }
          
          return {
            id: b.bookingID || b.id || b.BookingID || b.bookingId,
            name: customerName,
            date: dateStr,
            time: timeStr,
            status: b.bookingStatus || b.status || 'Booked',
            raw: b,
          };
        });
        
        if (mounted) setData(rows);

        // NOTE: Batteries now loaded via useBatteries hook (same as Inventory page)
        
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
        showToast({ type: 'error', message: e?.message || 'Failed to load data' });
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
      (d.name || '').toLowerCase().includes(s) || 
      (d.date || '').toLowerCase().includes(s) || 
      (d.time || '').toLowerCase().includes(s) ||
      (d.id || '').toLowerCase().includes(s)
    );
  }, [q, data]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [q]);

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    return filtered.slice(startIdx, endIdx);
  }, [filtered, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Calculate stats
  const activeReservations = data.filter(d => d.status === 'Booked').length;
  const queueCount = data.filter(d => d.status === 'Queue').length;
  
  // Use inventory data from useBatteries hook (same as Inventory page)
  // This ensures consistency between Dashboard and Inventory
  const fullBatteries = inventory?.available || 0;
  const faultyBatteries = inventory?.damaged || 0;
  const totalBatteries = inventory?.total || batteries.length;
  
  const todaySwaps = transfers.filter(t => t.status === 'Completed').length;
  const todayRevenue = revenue?.totalRevenue || revenue?.revenue || 0;
  
  console.log('[dashboardstaff] Stats:', {
    fullBatteries,
    faultyBatteries,
    totalBatteries,
    batteriesCount: batteries.length,
    activeReservations,
    queueCount,
    todaySwaps
  });

  return (
    <div className="space-y-6">
      {/* Hero Stats - Today's Performance */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Staff Dashboard</h2>
            <p className="text-blue-100">Today's Operations Overview</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100 mb-1">Date</div>
            <div className="text-xl font-semibold">{new Date().toLocaleDateString('vi-VN')}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm text-blue-100">Today's Swaps</div>
            </div>
            <div className="text-4xl font-bold">{todaySwaps}</div>
          </div>

          {/* TODO: Revenue card - Hidden until backend grants Staff permission 
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm text-blue-100">Revenue</div>
            </div>
            <div className="text-4xl font-bold">{todayRevenue.toLocaleString()}</div>
          </div>
          */}

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <Battery className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm text-blue-100">Ready Batteries</div>
            </div>
            <div className="text-4xl font-bold">{fullBatteries}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm text-blue-100">Faulty Batteries</div>
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
              <div className="text-sm text-blue-700 font-medium mb-1">Waiting for Swap</div>
              <div className="text-3xl font-bold text-blue-900">{activeReservations}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <Link href="/reservations" className="text-sm text-blue-700 font-medium hover:text-blue-800 flex items-center gap-1">
            View Details <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-amber-700 font-medium mb-1">In Queue</div>
              <div className="text-3xl font-bold text-amber-900">{queueCount}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="text-sm text-amber-700">Avg wait: ~6 mins</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-emerald-700 font-medium mb-1">Total Batteries</div>
              <div className="text-3xl font-bold text-emerald-900">{totalBatteries}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <Battery className="w-6 h-6" />
            </div>
          </div>
          <Link href="/inventory" className="text-sm text-emerald-700 font-medium hover:text-emerald-800 flex items-center gap-1">
            Manage Inventory <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* All Bookings */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Booking History
            </h3>
            <p className="text-sm text-gray-600 mt-1">All station bookings (total: {data.length})</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              placeholder="Search by name, date, time..."
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
            <p className="text-gray-600">Loading data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No bookings found</p>
          </div>
        ) : (
          <>
            <Table columns={columns} data={paginatedData} />
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-9 px-3 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                      // Show first page, last page, current page, and pages around current
                      const showPage = 
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1);
                      
                      const showEllipsis = 
                        (page === currentPage - 2 && currentPage > 3) ||
                        (page === currentPage + 2 && currentPage < totalPages - 2);
                      
                      if (showEllipsis) {
                        return <span key={page} className="px-2 text-gray-500">...</span>;
                      }
                      
                      if (!showPage) return null;
                      
                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`h-9 w-9 rounded-lg text-sm font-medium transition-all ${
                            page === currentPage
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-9 px-3 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
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
                <div className="text-sm text-gray-600">Verify reservations</div>
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
                <div className="text-sm text-gray-600">Swap batteries for customers</div>
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
                <div className="text-sm text-gray-600">Manage battery inventory</div>
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
                <div className="text-sm text-gray-600">View reports</div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
});
