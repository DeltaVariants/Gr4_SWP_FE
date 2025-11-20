/**
 * Station ID Resolver
 * Fetch Station ID (GUID) from Station Name
 */

import api from '@/lib/api';

// Cache để tránh fetch nhiều lần
const stationCache = new Map<string, string>();

/**
 * Get Station ID (GUID) from Station Name
 * Caches result to avoid multiple API calls
 */
export async function getStationIdFromName(stationName: string): Promise<string | null> {
  if (!stationName || stationName.trim() === '') {
    return null;
  }

  // Check cache first
  if (stationCache.has(stationName)) {
    return stationCache.get(stationName) || null;
  }

  try {
    console.log(`[StationResolver] Fetching ID for station: "${stationName}"`);
    
    // Fetch all stations
    const response = await api.get('/station');
    const stations = response.data?.data || response.data || [];
    
    // Find station by name (case-insensitive)
    const station = stations.find((s: any) => {
      const name = s.stationName || s.StationName || s.name || s.Name;
      return name?.toLowerCase().trim() === stationName.toLowerCase().trim();
    });

    if (station) {
      const stationId = station.stationID || station.stationId || station.id || station.ID;
      
      if (stationId) {
        console.log(`[StationResolver] Found ID for "${stationName}": ${stationId}`);
        // Cache the result
        stationCache.set(stationName, stationId);
        return stationId;
      }
    }

    console.warn(`[StationResolver] Station not found: "${stationName}"`);
    return null;
  } catch (error) {
    console.error('[StationResolver] Error fetching station ID:', error);
    return null;
  }
}

/**
 * Clear station cache (useful when stations are updated)
 */
export function clearStationCache() {
  stationCache.clear();
}
