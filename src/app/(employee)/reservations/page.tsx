"use client";

import { withStaffAuth } from '@/hoc/withAuth';
import { Table } from '../components/Table';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/presentation/hooks/useBookings';
import { useToast } from '@/presentation/components/ui/Notification';
import { Clock, RefreshCw, Filter, Calendar, User, Car, Battery, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

function StatusBadge({ value }: { value: string }) {
  const valueLower = value.toLowerCase();
  const map: Record<string, { style: string; text: string }> = {
    pending: { 
      style: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200', 
      text: 'Pending' 
    },
    booked: { 
      style: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200', 
      text: 'Waiting' 
    },
    queue: { 
      style: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200', 
      text: 'Queue' 
    },
    checked: { 
      style: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', 
      text: 'Checked In' 
    },
    completed: { 
      style: 'bg-gray-100 text-gray-600 ring-1 ring-gray-300', 
      text: 'Completed' 
    },
    cancelled: { 
      style: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200', 
      text: 'Cancelled' 
    },
  };
  const config = map[valueLower] || { 
    style: 'bg-gray-50 text-gray-600 ring-1 ring-gray-200', 
    text: value 
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.style}`}>
      {config.text}
    </span>
  );
}

export default withStaffAuth(function ReservationsPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('pending'); // pending, waiting, checked-in, cancelled, all
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const { showToast } = useToast();
  const { user, loading: authLoading } = useAuth();

  // Get stationId from user profile (backend now includes this in /api/auth/me)
  const stationId = (user as any)?.stationId || (user as any)?.StationId || (user as any)?.stationID;
  
  // Debug log
  useEffect(() => {
    console.log('[Reservations] User and stationId check:', {
      hasUser: !!user,
      userId: user?.userId,
      stationId,
      authLoading,
      userKeys: user ? Object.keys(user) : []
    });
  }, [user, stationId, authLoading]);

  // Use custom hook to fetch bookings - ONLY when user is loaded and has stationId
  // Pass undefined if not ready to prevent premature API calls
  const { bookings, loading, error, refetch, updateStatus, confirm } = useBookings(
    (!authLoading && stationId) ? stationId : undefined
  );

  // Show error toast if any
  useEffect(() => {
    if (error) {
      showToast({ type: 'error', message: error.message || 'Failed to load bookings' });
    }
  }, [error, showToast]);

  // Handle cancel booking
  const handleCancelBooking = useCallback(async (bookingId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy booking này?')) return;
    
    try {
      console.log('[Reservations] Cancelling booking:', bookingId);
      // Backend expects lowercase "cancelled" status
      await updateStatus(bookingId, 'cancelled');
      showToast({ type: 'success', message: 'Đã hủy booking thành công!' });
      // Refetch to update the list
      await refetch();
    } catch (err: any) {
      console.error('[Reservations] Failed to cancel booking:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể hủy booking';
      showToast({ type: 'error', message: errorMessage });
    }
  }, [updateStatus, refetch, showToast]);

  // Handle check-in (redirect to check-in page)
  const handleCheckIn = useCallback((bookingId: string) => {
    router.push(`/check-in?reservationId=${bookingId}`);
  }, [router]);

  // Handle confirm booking - Confirm booking and navigate to check-in page
  const handleConfirmBooking = useCallback(async (bookingId: string) => {
    // Prevent multiple calls
    if (confirmingId === bookingId) {
      console.log('[Reservations] ⚠️ Already confirming this booking, skipping...');
      return;
    }
    
    try {
      console.log('[Reservations] Confirming booking:', bookingId);
      
      // Validate bookingId
      if (!bookingId || bookingId.trim().length === 0) {
        throw new Error('Booking ID is missing');
      }
      
      setConfirmingId(bookingId);
      
      // Confirm booking - Backend sẽ tự động tạo SwapTransaction với status="initiated"
      // PATCH /api/bookings/{id}?status=completed
      // Backend trả về SwapTransactionID trong response
      const result = await confirm(bookingId);
      
      console.log('[Reservations] ✅ Booking confirmed, swapTransactionId:', result.swapTransactionId);
      
      showToast({ 
        type: 'success', 
        message: 'Booking đã được xác nhận! Đang chuyển đến trang xác thực...' 
      });
      
      // Navigate to check-in page với bookingId
      // swapTransactionId sẽ được lưu trong URL hoặc state nếu cần
      router.push(`/check-in?bookingId=${bookingId}${result.swapTransactionId ? `&swapTransactionId=${result.swapTransactionId}` : ''}`);
    } catch (err: any) {
      console.error('[Reservations] Failed to confirm booking:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to confirm booking';
      showToast({ 
        type: 'error', 
        message: errorMessage
      });
      setConfirmingId(null); // Reset on error
    }
  }, [confirmingId, router, showToast, confirm]);

  // Define columns with dynamic action buttons
  const columns = useMemo(() => [
    { key: 'time', header: 'Time' },
    { key: 'driver', header: 'Customer' },
    { key: 'vehicle', header: 'License Plate' },
    { key: 'battery', header: 'Battery Type' },
    { key: 'status', header: 'Status', render: (row: any) => <StatusBadge value={row.status} /> },
    { 
      key: 'actions', 
      header: 'Actions', 
      render: (row: any) => {
        const statusLower = (row.status || '').toLowerCase();
        const isPending = statusLower === 'pending';
        const isWaiting = ['booked', 'queue'].includes(statusLower);
        const isChecked = ['checked', 'completed'].includes(statusLower);
        const isCancelled = statusLower === 'cancelled';

        return (
          <div className="flex items-center gap-2">
            {/* Pending: Show Confirm (go to check-in) + Cancel buttons */}
            {isPending && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleConfirmBooking(row.id);
                  }}
                  disabled={confirmingId === row.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {confirmingId === row.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Confirm & Check-in
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleCancelBooking(row.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-red-500 hover:bg-red-600 shadow-sm"
                >
                  Cancel
                </button>
              </>
            )}

            {/* Waiting (Booked/Queue): Show Check-in button */}
            {isWaiting && (
              <button
                onClick={() => handleCheckIn(row.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[#0062FF] hover:bg-[#0052d6] shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Check-in
              </button>
            )}

            {/* Checked/Completed: Show status text */}
            {isChecked && (
              <span className="text-xs text-emerald-600 font-medium">
                ✓ {statusLower === 'checked' ? 'Checked In' : 'Completed'}
              </span>
            )}

            {/* Cancelled: Show cancelled text */}
            {isCancelled && (
              <span className="text-xs text-rose-600 font-medium">
                ✗ Cancelled
              </span>
            )}
          </div>
        );
      }
    },
  ], [confirmingId, handleConfirmBooking, handleCancelBooking, handleCheckIn]);

  // Transform bookings to table data
  const data = useMemo(() => {
    console.log('[Reservations] Total bookings:', bookings.length);
    console.log('[Reservations] All bookings:', bookings);
    
    const rows = bookings.map((b) => {
      // Log first booking to see structure
      if (bookings.indexOf(b) === 0) {
        console.log('[Reservations] Sample booking data:', b);
        console.log('[Reservations] Available keys:', Object.keys(b));
      }
      
      // Support both 'status' and 'bookingStatus' field names from API
      const status = (b as any).status || b.bookingStatus || 'Booked';
      
      // Extract driver and vehicle info - try multiple possible field names
      const driverName = (b as any).customerName || (b as any).driverName || (b as any).userName || (b as any).fullName || '—';
      const vehiclePlate = (b as any).vehiclePlate || (b as any).licensePlate || (b as any).vehicleId || (b as any).plateNumber || '—';
      
      // Try different ID field names
      const bookingId = b.bookingID || (b as any).id || (b as any).BookingID || (b as any).bookingId;
      
      if (!bookingId) {
        console.error('[Reservations] No ID found for booking:', b);
      }
      
      // Get booking time for sorting
      const bookingTimeStr = (b as any).bookingTime || (b as any).BookingTime || (b as any).time || (b as any).bookingHour || '';
      let sortDate: Date | null = null;
      
      if (bookingTimeStr) {
        try {
          sortDate = new Date(bookingTimeStr);
        } catch (e) {
          console.warn('[Reservations] Failed to parse bookingTime:', bookingTimeStr);
        }
      }
      
      // Try createdAt or updatedAt as fallback for sorting
      if (!sortDate) {
        const createdAtStr = (b as any).createdAt || (b as any).CreatedAt || (b as any).created_at;
        const updatedAtStr = (b as any).updatedAt || (b as any).UpdatedAt || (b as any).updated_at;
        const fallbackDateStr = createdAtStr || updatedAtStr;
        if (fallbackDateStr) {
          try {
            sortDate = new Date(fallbackDateStr);
          } catch (e) {
            console.warn('[Reservations] Failed to parse createdAt/updatedAt:', fallbackDateStr);
          }
        }
      }
      
      return {
        id: bookingId,
        time: b.bookingTime || '--',
        driver: driverName,
        vehicle: vehiclePlate,
        battery: b.batteryType || '—',
        status,
        raw: b,
        sortDate: sortDate || new Date(0), // Use epoch if no date available (will sort last)
      };
    });
    
    // Sort by booking time (newest first)
    rows.sort((a, b) => {
      const dateA = a.sortDate.getTime();
      const dateB = b.sortDate.getTime();
      return dateB - dateA; // Descending order (newest first)
    });
    
    return rows;
  }, [bookings]);

  // Auto-refresh every 5 seconds to catch status changes
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      console.log('[Reservations] Auto-refreshing bookings...');
      refetch();
    }, 5000); // 5 seconds to see status changes quickly
    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  const filtered = useMemo(() => {
    let items = data;
    
    // Filter by status tab
    if (filterStatus === 'pending') {
      // Pending: status = Pending (not checked in)
      items = items.filter(d => d.status.toLowerCase() === 'pending');
    } else if (filterStatus === 'waiting') {
      // Waiting: status = Booked, Queue (confirmed, waiting to process)
      items = items.filter(d => ['booked', 'queue'].includes(d.status.toLowerCase()));
    } else if (filterStatus === 'checked-in') {
      // Checked in: status = Checked, Completed
      items = items.filter(d => ['checked', 'completed'].includes(d.status.toLowerCase()));
    } else if (filterStatus === 'cancelled') {
      // Cancelled: status = Cancelled
      items = items.filter(d => d.status.toLowerCase() === 'cancelled');
    }
    // 'all' shows everything
    
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

  // Count by status (case-insensitive)
  const pendingCount = data.filter(d => d.status.toLowerCase() === 'pending').length;
  const waitingCount = data.filter(d => ['booked', 'queue'].includes(d.status.toLowerCase())).length;
  const checkedCount = data.filter(d => ['checked', 'completed'].includes(d.status.toLowerCase())).length;
  const cancelledCount = data.filter(d => d.status.toLowerCase() === 'cancelled').length;

  // Show loading if auth is still loading or no stationId yet
  const isInitializing = authLoading || !stationId;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-amber-700 font-medium mb-1">Pending</div>
              <div className="text-3xl font-bold text-amber-900">{pendingCount}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-indigo-700 font-medium mb-1">Waiting</div>
              <div className="text-3xl font-bold text-indigo-900">{waitingCount}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white">
              <User className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-emerald-700 font-medium mb-1">Checked In</div>
              <div className="text-3xl font-bold text-emerald-900">{checkedCount}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-5 border border-rose-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-rose-700 font-medium mb-1">Cancelled</div>
              <div className="text-3xl font-bold text-rose-900">{cancelledCount}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center text-white">
              <User className="w-6 h-6 line-through" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Controls */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filterStatus === 'pending'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('waiting')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filterStatus === 'waiting'
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Waiting
            </button>
            <button
              onClick={() => setFilterStatus('checked-in')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filterStatus === 'checked-in'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Checked In
            </button>
            <button
              onClick={() => setFilterStatus('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filterStatus === 'cancelled'
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Cancelled
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filterStatus === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                placeholder="Search by name, plate, ID..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-10 w-full sm:w-64 pl-10 pr-4 rounded-lg border-2 border-gray-200 text-black placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
            <button
              onClick={() => refetch()}
              disabled={loading}
              className="h-10 w-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all disabled:opacity-50"
              title="Refresh"
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
              title="Auto refresh (5s)"
            >
              <Clock className="w-4 h-4" />
              {autoRefresh ? 'Auto' : 'Manual'}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {(isInitializing || (loading && data.length === 0)) ? (
        <div className="p-12 bg-white rounded-xl shadow-sm text-center border border-gray-100">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">
            {isInitializing ? 'Initializing...' : 'Loading bookings...'}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 bg-white rounded-xl shadow-sm text-center border border-gray-100">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No bookings found</p>
        </div>
      ) : (
        <Table columns={columns} data={filtered} />
      )}
    </div>
  );
});
