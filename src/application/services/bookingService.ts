// bookingService: calls Next.js proxy routes which forward to backend Booking endpoints
const API = {
  getAll: '/api/bookings',
  getAllOfStation: '/api/booking/get-all',
  updateStatus: '/api/booking/update-status',
};

// Simple cache (5 minutes TTL)
let bookingsCache: { data: any[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const bookingService = {
  /**
   * Get all bookings (with cache)
   */
  async getAllBookings(query?: string, forceRefresh = false) {
    // Check cache
    if (!forceRefresh && bookingsCache && Date.now() - bookingsCache.timestamp < CACHE_TTL) {
      return bookingsCache.data;
    }

    const headers: Record<string, string> = {};
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {}

    const url = query ? `${API.getAll}?${query}` : API.getAll;
    const res = await fetch(url, { method: 'GET', headers, credentials: 'same-origin' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to fetch bookings');
    }
    
    const bookings = data?.data || data;
    
    // Update cache
    bookingsCache = { data: bookings, timestamp: Date.now() };
    
    return bookings;
  },

  /**
   * Clear cache (call after creating/updating booking)
   */
  clearCache() {
    bookingsCache = null;
  },

  /**
   * Tìm booking bằng mã booking, tên khách, hoặc biển số xe
   * @param searchTerm - Mã booking / Tên khách hàng / Biển số xe
   */
  async searchBooking(searchTerm: string) {
    try {
      const allBookings = await this.getAllBookings();
      const normalized = searchTerm.trim().toLowerCase();
      
      const booking = allBookings.find((b: any) => {
        // 1. Tìm theo mã booking/reservation
        const codes = [
          b.bookingCode, b.BookingCode,
          b.reservationCode, b.ReservationCode,
          b.code, b.Code,
          b.bookingID, b.BookingID, b.id,
        ];
        
        for (const code of codes) {
          if (code && String(code).trim().toLowerCase() === normalized) {
            return true;
          }
        }
        
        // 2. Tìm theo tên khách hàng (partial match)
        const names = [
          b.customerName, b.CustomerName,
          b.username, b.userName, b.UserName,
          b.driverName, b.DriverName,
        ];
        
        for (const name of names) {
          if (name && String(name).trim().toLowerCase().includes(normalized)) {
            return true;
          }
        }
        
        // 3. Tìm theo biển số xe (partial match)
        const vehicles = [
          b.vehiclePlate, b.VehiclePlate,
          b.licensePlate, b.LicensePlate,
          b.vehicleId, b.VehicleId,
          b.vehicle, b.Vehicle,
          b.plateNumber, b.PlateNumber,
        ];
        
        for (const vehicle of vehicles) {
          if (vehicle && String(vehicle).trim().toLowerCase().includes(normalized)) {
            return true;
          }
        }
        
        return false;
      });
      
      return booking || null;
    } catch (error) {
      console.error('[BookingService] Search error:', error);
      return null;
    }
  },

  /**
   * @deprecated Use searchBooking() instead for more flexible search
   */
  async getBookingByCode(bookingCode: string) {
    return this.searchBooking(bookingCode);
  },

  async getAllBookingOfStation(stationID?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    let finalStationID = stationID;

    // If caller didn't provide stationID, try to obtain it from /api/auth/me (use server session/cookie)
    if (!finalStationID && typeof window !== 'undefined') {
      try {
        const meRes = await fetch('/api/auth/me', { cache: 'no-store', headers });
        const mePayload = await meRes.json().catch(() => ({}));
        if (meRes.ok && mePayload?.success && mePayload.data) {
          // Try stationId first, then stationName as fallback
          finalStationID = 
            mePayload.data.stationId || 
            mePayload.data.StationID || 
            mePayload.data.stationID || 
            mePayload.data.StationId ||
            mePayload.data.stationName ||
            mePayload.data.StationName;
          
          if (process.env.NODE_ENV === 'development' && finalStationID) {
            console.log('[bookingService] Retrieved stationID from /api/auth/me:', finalStationID);
          }
        }
      } catch (e) {
        console.error('[bookingService] Error fetching /api/auth/me:', e);
      }
    }

    if (!finalStationID) {
      // Avoid calling global GetAllBooking (Admin-only). Require stationID for staff flows.
      console.error('[bookingService] No stationID found. Cannot fetch bookings.');
      throw new Error('stationID is required to fetch bookings for staff');
    }

    const url = `${API.getAllOfStation}?stationID=${encodeURIComponent(finalStationID)}`;
    const res = await fetch(url, { headers, credentials: 'same-origin' });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(payload?.message || 'Failed to fetch bookings');
    }
    return payload?.data || payload || [];
  },

  // For verifying reservation: get bookings of a user (customer)
  async getAllBookingOfUser(query?: Record<string,string>) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {}

    const qs = query ? '?' + new URLSearchParams(query).toString() : '';
    const res = await fetch(`/api/booking/get-user${qs}`, { headers, credentials: 'same-origin' });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(payload?.message || 'Failed to fetch user bookings');
    }
    return payload?.data || payload || [];
  },

  async updateBookingStatus(bookingID: string, bookingStatus: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }

    const body = JSON.stringify({ id: bookingID, bookingStatus });
    const res = await fetch(API.updateStatus, { method: 'PUT', headers, body, credentials: 'same-origin' });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(payload?.message || 'Failed to update booking status');
    }
    
    // Clear cache after update
    this.clearCache();
    
    return payload;
  },
};

export default bookingService;
