// batteryService: Use axios for consistent API calls
import api from '@/lib/api';

// Call backend API directly using axios instance
export const batteryService = {
  async getAllBatteries() {
    try {
      // Try /batteries first (plural)
      let response;
      try {
        response = await api.get('/batteries');
      } catch (err: any) {
        // Fallback to /battery (singular) if 404
        if (err?.response?.status === 404) {
          console.log('[batteryService] /batteries not found, trying /battery');
          response = await api.get('/battery');
        } else {
          throw err;
        }
      }
      
      const data = response.data;
      
      console.log('[batteryService] getAllBatteries response:', {
        responseType: Array.isArray(data) ? 'array' : typeof data,
        count: Array.isArray(data) ? data.length : 0,
        sample: Array.isArray(data) && data.length > 0 ? data[0] : null
      });
      
      // Handle different response formats
      if (Array.isArray(data)) return data;
      if (data?.data && Array.isArray(data.data)) return data.data;
      return data?.result || [];
    } catch (error: any) {
      console.error('[batteryService] Failed to fetch batteries:', error);
      throw new Error(error?.response?.data?.message || error?.message || 'Failed to fetch batteries');
    }
  },
  async getAllBatterySlotsByStationID(stationID: string) {
    try {
      const response = await api.get('/battery/slots', {
        params: { stationID }
      });
      
      const data = response.data;
      return data?.data || data || [];
    } catch (error: any) {
      console.error('[batteryService] Battery slots failed:', {
        stationID,
        error: error?.response?.data || error?.message
      });
      throw new Error(error?.response?.data?.message || error?.message || 'Failed to fetch battery slots');
    }
  },

  async getAllBatteryConditionLogsByStation(stationName: string) {
    try {
      const response = await api.get('/battery/condition', {
        params: { stationName }
      });
      
      const data = response.data;
      return data?.data || data || [];
    } catch (error: any) {
      console.error('[batteryService] Failed to fetch battery condition logs:', error);
      throw new Error(error?.response?.data?.message || error?.message || 'Failed to fetch battery condition logs');
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
      const response = await api.patch('/battery/status', payload);
      const data = response.data;
      return data?.data || data;
    } catch (error: any) {
      console.error('[batteryService] Failed to update battery status:', error);
      throw new Error(error?.response?.data?.message || error?.message || 'Failed to update battery status');
    }
  }
};

export default batteryService;

