import { getAuthHeaders, handle401Error, is401Error } from '@/lib/authUtils';

// Use the Next.js proxy route to avoid CORS in browser
export const batteryService = {
  async getAllBatteries() {
    try {
      const headers = getAuthHeaders();
      const res = await fetch('/api/battery/get-all', { headers, credentials: 'include' });
      const payload = await res.json().catch(() => ({}));
      
      // Handle 401 Unauthorized - token expired or invalid
      if (res.status === 401) {
        handle401Error();
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
      
      if (!res.ok) {
        throw new Error(payload?.message || payload?.error || 'Failed to fetch batteries');
      }
      
      // Our proxy returns { success: true, data }
      const data = payload?.data;
      if (Array.isArray(data)) return data;
      // if backend returned nested structure, try common fields
      if (data && Array.isArray(data.data)) return data.data;
      return data?.result || [];
    } catch (error) {
      if (is401Error(error)) {
        handle401Error(error);
      }
      throw error;
    }
  },
  async getAllBatterySlotsByStationID(stationID: string) {
    try {
      const headers = getAuthHeaders();
      const url = `/api/battery/slots?stationID=${encodeURIComponent(stationID)}`;
      const res = await fetch(url, { headers, credentials: 'same-origin' });
      const payload = await res.json().catch(() => ({}));
      
      if (res.status === 401) {
        handle401Error();
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
      
      if (!res.ok) {
        console.error('[batteryService] Battery slots failed:', {
          status: res.status,
          stationID,
          response: payload
        });
        throw new Error(payload?.message || payload?.error || `HTTP ${res.status}: Failed to fetch battery slots`);
      }
      
      return payload?.data || payload || [];
    } catch (error) {
      if (is401Error(error)) {
        handle401Error(error);
      }
      throw error;
    }
  },

  async getAllBatteryConditionLogsByStation(stationName: string) {
    try {
      const headers = getAuthHeaders();
      const url = `/api/battery/condition?stationName=${encodeURIComponent(stationName)}`;
      const res = await fetch(url, { headers, credentials: 'same-origin' });
      const payload = await res.json().catch(() => ({}));
      
      if (res.status === 401) {
        handle401Error();
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
      
      if (!res.ok) throw new Error(payload?.message || 'Failed to fetch battery condition logs');
      return payload?.data || payload || [];
    } catch (error) {
      if (is401Error(error)) {
        handle401Error(error);
      }
      throw error;
    }
  },

  /**
   * Return array of battery IDs for a given station.
   * Tries slots endpoint first, then falls back to global batteries list.
   */
  async getBatteryIdsByStation(stationID?: string) {
    try {
      // Try slots for the station first
      if (stationID) {
        try {
          const slots = await this.getAllBatterySlotsByStationID(stationID);
          if (Array.isArray(slots) && slots.length > 0) {
            const ids = slots
              .map((s: any) => s.batteryID || s.id || s.BatteryID || s.BatteryCode || s.code)
              .filter(Boolean);
            if (ids.length) return ids as string[];
          }
        } catch (e) {
          // ignore and fall back to global list
          console.warn('[batteryService] getBatteryIdsByStation: slots lookup failed, falling back', e);
        }
      }

      // Fallback: get all batteries and extract IDs
      const all = await this.getAllBatteries();
      if (Array.isArray(all) && all.length > 0) {
        return all
          .map((b: any) => b.batteryID || b.id || b.BatteryID || b.BatteryCode || b.code)
          .filter(Boolean) as string[];
      }
      return [];
    } catch (error) {
      throw error;
    }
  },

  async updateBatteryStatus(payload: any) {
    try {
      const headers = getAuthHeaders();
      const res = await fetch('/api/battery/update-status', { 
        method: 'POST', 
        headers, 
        body: JSON.stringify(payload), 
        credentials: 'same-origin' 
      });
      const payloadRes = await res.json().catch(() => ({}));
      
      if (res.status === 401) {
        handle401Error();
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
      
      if (!res.ok) throw new Error(payloadRes?.message || 'Failed to update battery status');
      return payloadRes?.data || payloadRes;
    } catch (error) {
      if (is401Error(error)) {
        handle401Error(error);
      }
      throw error;
    }
  }
};

export default batteryService;
