"use client";

import { withStaffAuth } from '@/hoc/withAuth';
import { Table } from '../components/Table';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/presentation/hooks/useBookings';
import { useToast } from '@/presentation/components/ui/Notification';
import { Clock, RefreshCw, Filter, Calendar, User, Car, Battery, CheckCircle2, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

function StatusBadge({ value }: { value: string }) {
  // Backend returns: Pending, Cancelled, Completed (PascalCase)
  // Note: "Confirmed" exists in enum but is never returned to frontend (immediately becomes "Completed")
  const valueLower = value.toLowerCase();
  const map: Record<string, { style: string; text: string }> = {
    pending: { 
      style: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200', 
      text: 'Pending' 
    },
    cancelled: { 
      style: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200', 
      text: 'Cancelled' 
    },
    completed: { 
      style: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', 
      text: 'Completed' 
    },
    // Handle "confirmed" if it somehow appears (shouldn't happen)
    confirmed: { 
      style: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200', 
      text: 'Confirmed' 
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
  const [filterStatus, setFilterStatus] = useState<string>('all'); // completed, cancelled, all (pending hidden if not used)
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // 10 items per page
  const { showToast } = useToast();
  const { user, loading: authLoading } = useAuth();

  // Get stationId from user profile - resolve from stationName if needed
  const [stationId, setStationId] = useState<string | undefined>(
    (user as any)?.stationId || (user as any)?.StationId || (user as any)?.stationID
  );
  
  // Resolve stationID from stationName if not available
  useEffect(() => {
    const resolveStationId = async () => {
      // If stationId is already a valid GUID, use it
      if (stationId && /^[0-9a-f-]{36}$/i.test(stationId)) {
        return;
      }
      
      // If user has stationName but no valid stationId, try to resolve it
      const stationName = user?.stationName;
      if (stationName && !stationId) {
        try {
          const { getStationIdByName } = await import('@/application/services/Hoang/stationService');
          const resolvedId = await getStationIdByName(stationName);
          if (resolvedId) {
            console.log('[Reservations] Resolved stationID from stationName:', resolvedId);
            setStationId(resolvedId);
          }
        } catch (e) {
          console.error('[Reservations] Error resolving stationID from name:', e);
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
    
    if (user && !authLoading) {
      resolveStationId();
    }
  }, [user, stationId, authLoading]);
  
  // Debug log
  useEffect(() => {
    console.log('[Reservations] User and stationId check:', {
      hasUser: !!user,
      userId: user?.userId,
      stationId,
      stationName: user?.stationName,
      authLoading,
      userKeys: user ? Object.keys(user) : []
    });
  }, [user, stationId, authLoading]);

  // Use custom hook to fetch bookings - ONLY when user is loaded and has stationId
  // Pass undefined if not ready to prevent premature API calls
  const { bookings, loading, error, refetch, updateStatus } = useBookings(
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
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      console.log('[Reservations] Cancelling booking:', bookingId);
      // Backend expects lowercase "cancelled" but frontend type uses PascalCase
      await updateStatus(bookingId, 'Cancelled');
      showToast({ type: 'success', message: 'Booking cancelled successfully!' });
      // Refetch to update the list
      await refetch();
      // Reset to page 1 if current page becomes empty
      setCurrentPage(1);
    } catch (err: any) {
      console.error('[Reservations] Failed to cancel booking:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to cancel booking';
      showToast({ type: 'error', message: errorMessage });
    }
  }, [updateStatus, refetch, showToast]);

  // Handle check-in (redirect to check-in page)
  // Flow mới: Đi thẳng đến check-in, không cần confirm trước
  const handleCheckIn = useCallback((bookingId: string) => {
    router.push(`/check-in?bookingId=${bookingId}`);
  }, [router]);

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
        // Backend returns: Pending, Cancelled, Completed (PascalCase)
        // Note: "Confirmed" exists in enum but is never returned (immediately becomes "Completed")
        const statusLower = (row.status || '').toLowerCase();
        const isPending = statusLower === 'pending';
        const isCompleted = statusLower === 'completed'; // Booking đã completed (có subscription) - SwapTransaction đã được tạo
        const isCancelled = statusLower === 'cancelled';

        return (
          <div className="flex items-center gap-2">
            {/* Pending: Staff không xử lý pending bookings (chỉ customer tự xử lý thanh toán) */}
            {isPending && (
              <span className="text-xs text-amber-600 font-medium">
                ⏳ Waiting for payment/subscription
              </span>
            )}

            {/* Completed: Booking đã completed (có subscription) - SwapTransaction đã được tạo tự động
                → Hiển thị nút "Continue Swap" để staff complete swap transaction */}
            {isCompleted && (
              <>
                <button
                  onClick={() => handleCheckIn(row.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                >
                  <Battery className="w-3.5 h-3.5" />
                  Continue Swap
                </button>
                <button
                  onClick={() => handleCancelBooking(row.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-red-500 hover:bg-red-600 shadow-sm"
                  title="Cancel booking"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
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
  ], [handleCancelBooking, handleCheckIn]);

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
      
      // Backend BookingDTOs fields (PascalCase):
      // - BookingID, UserName, VehicleName, StationName, BatteryType, PlanName, BookingTime, CreatedAt, Status
      const status = (b as any).Status || (b as any).status || b.bookingStatus || 'Pending';
      
      // Extract driver name - Backend returns UserName (PascalCase)
      const driverName = (b as any).UserName || (b as any).userName || (b as any).customerName || (b as any).driverName || (b as any).fullName || '—';
      
      // Extract vehicle info - Backend returns VehicleName (tên xe), not license plate
      // Note: Backend BookingDTOs doesn't include LicensePlate, only VehicleName
      const vehicleInfo = (b as any).VehicleName || (b as any).vehicleName || (b as any).vehiclePlate || (b as any).licensePlate || (b as any).vehicleId || (b as any).plateNumber || '—';
      
      // Extract booking ID - Backend returns BookingID (PascalCase)
      const bookingId = (b as any).BookingID || b.bookingID || (b as any).id || (b as any).bookingId;
      
      if (!bookingId) {
        console.error('[Reservations] No ID found for booking:', b);
      }
      
      // Get booking time - Backend returns BookingTime (PascalCase, DateTime)
      const bookingTimeStr = (b as any).BookingTime || (b as any).bookingTime || (b as any).time || (b as any).bookingHour || '';
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
      
      // Format booking time for display
      let displayTime = '--';
      if (bookingTimeStr) {
        try {
          const date = new Date(bookingTimeStr);
          if (!isNaN(date.getTime())) {
            // Format: "YYYY-MM-DD HH:mm" or "DD/MM/YYYY HH:mm"
            displayTime = date.toLocaleString('vi-VN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            });
          }
        } catch (e) {
          console.warn('[Reservations] Failed to format bookingTime:', bookingTimeStr);
        }
      }
      
      return {
        id: bookingId,
        time: displayTime,
        driver: driverName,
        vehicle: vehicleInfo, // VehicleName from backend (tên xe)
        battery: (b as any).BatteryType || b.batteryType || '—', // Backend returns BatteryType (PascalCase)
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

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [q, filterStatus]);

  const filtered = useMemo(() => {
    let items = data;
    
    // Filter by status tab - Backend returns: Pending, Cancelled, Completed
    // Note: "Confirmed" exists in enum but is never returned to frontend
    if (filterStatus === 'pending') {
      items = items.filter(d => d.status.toLowerCase() === 'pending');
    } else if (filterStatus === 'completed') {
      items = items.filter(d => d.status.toLowerCase() === 'completed');
    } else if (filterStatus === 'cancelled') {
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

  // Count by status (case-insensitive) - Backend returns: Pending, Cancelled, Completed
  // Note: "Pending" may not appear if users always have subscription before booking
  const pendingCount = data.filter(d => d.status.toLowerCase() === 'pending').length;
  const completedCount = data.filter(d => d.status.toLowerCase() === 'completed').length;
  const cancelledCount = data.filter(d => d.status.toLowerCase() === 'cancelled').length;

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

  // Show loading if auth is still loading or no stationId yet
  const isInitializing = authLoading || !stationId;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className={`grid grid-cols-1 ${pendingCount > 0 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
        {/* Only show Pending card if there are pending bookings */}
        {pendingCount > 0 && (
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
        )}

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-emerald-700 font-medium mb-1">Completed</div>
              <div className="text-3xl font-bold text-emerald-900">{completedCount}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <Battery className="w-6 h-6" />
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
            {/* Only show Pending filter if there are pending bookings */}
            {pendingCount > 0 && (
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
            )}
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filterStatus === 'completed'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Completed
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
  );
});
