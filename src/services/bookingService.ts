// bookingService: calls Next.js proxy routes which forward to backend Booking endpoints
const API = {
  getAllOfStation: '/api/booking/get-all',
  updateStatus: '/api/booking/update-status',
};

const bookingService = {
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
        const meRes = await fetch('/api/auth/me', { cache: 'no-store' });
        const mePayload = await meRes.json().catch(() => ({}));
        if (meRes.ok && mePayload?.success && mePayload.data) {
          finalStationID = mePayload.data.stationId || mePayload.data.StationID || mePayload.data.stationID || mePayload.data.StationId;
        }
      } catch (e) {
        // ignore; we'll fall back to calling global endpoint which may return 403 for Staff
      }
    }

    // If không có stationID, gọi endpoint không có query để proxy tự fallback theo stationName
    const url = finalStationID
      ? `${API.getAllOfStation}?stationID=${encodeURIComponent(finalStationID)}`
      : `${API.getAllOfStation}`;
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

    const body = JSON.stringify({ bookingID, bookingStatus });
  const res = await fetch(API.updateStatus, { method: 'PUT', headers, body, credentials: 'same-origin' });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(payload?.message || 'Failed to update booking status');
    }
    return payload;
  },
};

export default bookingService;
