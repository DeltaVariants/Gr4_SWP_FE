// Use the Next.js proxy route to avoid CORS in browser
export const batteryService = {
  async getAllBatteries() {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    // If client has access token in localStorage, forward it to the proxy so the proxy can forward to backend
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }

    const res = await fetch('/api/battery/get-all', { headers });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(payload?.message || 'Failed to fetch batteries');
    }
    // Our proxy returns { success: true, data }
    const data = payload?.data;
    if (Array.isArray(data)) return data;
    // if backend returned nested structure, try common fields
    if (data && Array.isArray(data.data)) return data.data;
    return data?.result || [];
  },
  async getAllBatterySlotsByStationID(stationID: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {}

    const url = `/api/battery/slots?stationID=${encodeURIComponent(stationID)}`;
    const res = await fetch(url, { headers, credentials: 'same-origin' });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload?.message || 'Failed to fetch battery slots');
    return payload?.data || payload || [];
  },

  async getAllBatteryConditionLogsByStation(stationName: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {}

    const url = `/api/battery/condition?stationName=${encodeURIComponent(stationName)}`;
    const res = await fetch(url, { headers, credentials: 'same-origin' });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload?.message || 'Failed to fetch battery condition logs');
    return payload?.data || payload || [];
  },

  async updateBatteryStatus(payload: any) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {}

    const res = await fetch('/api/battery/update-status', { method: 'POST', headers, body: JSON.stringify(payload), credentials: 'same-origin' });
    const payloadRes = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payloadRes?.message || 'Failed to update battery status');
    return payloadRes?.data || payloadRes;
  }
};

export default batteryService;
