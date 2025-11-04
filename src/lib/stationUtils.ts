/**
 * Utility functions for working with station data
 */

import { User } from '@/application/services/authService';

/**
 * Get station name from user object
 * Returns the station name if available, otherwise returns a fallback message
 */
export function getStationName(user: User | null): string {
  if (!user) return 'Chưa có trạm';
  
  // Ưu tiên stationName, sau đó mới đến stationId
  if (user.stationName) {
    return user.stationName;
  }
  
  // Nếu chỉ có stationId và nó là GUID, thì hiển thị "Trạm #..."
  if (user.stationId && /^[0-9a-f-]{36}$/i.test(user.stationId)) {
    return `Trạm #${user.stationId.slice(0, 8)}`;
  }
  
  // Nếu stationId là tên thì dùng luôn
  if (user.stationId) {
    return user.stationId;
  }
  
  return 'Chưa có trạm';
}

/**
 * Check if user has a valid station ID (GUID format)
 */
export function hasValidStationId(user: User | null): boolean {
  if (!user?.stationId) return false;
  return /^[0-9a-f-]{36}$/i.test(user.stationId);
}

/**
 * Get station ID for API calls
 * Returns null if no valid station ID is found
 */
export function getStationIdForApi(user: User | null): string | null {
  if (!user) return null;
  
  // Nếu có stationId và nó là GUID thì dùng
  if (user.stationId && /^[0-9a-f-]{36}$/i.test(user.stationId)) {
    return user.stationId;
  }
  
  return null;
}

/**
 * Get station ID for API calls (async version)
 * Automatically fetches station ID from backend if only name is available
 */
export async function getStationIdForApiAsync(user: User | null): Promise<string | null> {
  if (!user) return null;
  
  // Nếu có stationId và nó là GUID thì dùng luôn
  if (user.stationId && /^[0-9a-f-]{36}$/i.test(user.stationId)) {
    return user.stationId;
  }
  
  // Nếu có stationName, thử fetch stationId từ API
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
  
  // Fallback: nếu stationId là tên (không phải GUID), thử dùng nó để search
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
export function getStationDisplay(user: User | null): {
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
