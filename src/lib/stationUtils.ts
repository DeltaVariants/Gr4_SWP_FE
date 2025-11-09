/**
 * Utility functions for working with station data
 */

import { AuthUser } from '@/domain/entities/Auth';

/**
 * Get station name from user object
 * Returns the station name if available, otherwise returns a fallback message
 */
export function getStationName(user: AuthUser | null): string {
  if (!user) return 'No station assigned';
  
  // Prioritize stationName, then stationId
  if (user.stationName) {
    return user.stationName;
  }
  
  // If only stationId is available and it's a GUID, display "Station #..."
  if (user.stationId && /^[0-9a-f-]{36}$/i.test(user.stationId)) {
    return `Station #${user.stationId.slice(0, 8)}`;
  }
  
  // If stationId is a name, use it directly
  if (user.stationId) {
    return user.stationId;
  }
  
  return 'No station assigned';
}

/**
 * Check if user has a valid station ID (GUID format)
 */
export function hasValidStationId(user: AuthUser | null): boolean {
  if (!user?.stationId) return false;
  return /^[0-9a-f-]{36}$/i.test(user.stationId);
}

/**
 * Get station ID for API calls
 * Returns null if no valid station ID is found
 */
export function getStationIdForApi(user: AuthUser | null): string | null {
  if (!user) return null;
  
  // If stationId exists and is a GUID, use it
  if (user.stationId && /^[0-9a-f-]{36}$/i.test(user.stationId)) {
    return user.stationId;
  }
  
  return null;
}

/**
 * Get station ID for API calls (async version)
 * Automatically fetches station ID from backend if only name is available
 */
export async function getStationIdForApiAsync(user: AuthUser | null): Promise<string | null> {
  if (!user) return null;
  
  // If stationId exists and is a GUID, use it directly
  if (user.stationId && /^[0-9a-f-]{36}$/i.test(user.stationId)) {
    return user.stationId;
  }
  
  // If stationName is available, try to fetch stationId from API
  if (user.stationName) {
    try {
      const { getStationIdByName } = await import('@/application/services/stationService');
      const stationId = await getStationIdByName(user.stationName);
      
      if (stationId) {
        console.log('[StationUtils] Fetched stationId:', stationId, 'for name:', user.stationName);
        // Optionally cache in user object for next time
        return stationId;
      }
    } catch (error) {
      console.error('[StationUtils] Error fetching stationId:', error);
    }
  }
  
  // Fallback: if stationId is a name (not a GUID), try to use it for search
  if (user.stationId && !/^[0-9a-f-]{36}$/i.test(user.stationId)) {
    try {
      const { getStationIdByName } = await import('@/application/services/stationService');
      const stationId = await getStationIdByName(user.stationId);
      
      if (stationId) {
        console.log('[StationUtils] Fetched stationId:', stationId, 'from fallback name:', user.stationId);
        return stationId;
      }
    } catch (error) {
      console.error('[StationUtils] Error fetching stationId from fallback:', error);
    }
  }
  
  return null;
}

/**
 * Get station display info for UI
 */
export function getStationDisplay(user: AuthUser | null): {
  name: string;
  id: string | null;
  hasValidId: boolean;
} {
  return {
    name: getStationName(user),
    id: getStationIdForApi(user),
    hasValidId: hasValidStationId(user),
  };
}
