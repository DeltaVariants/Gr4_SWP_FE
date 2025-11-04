import { stationRepositoryAPI } from "@/infrastructure/repositories/StationRepositoryAPI.impl";
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from '@/lib/api';

export const fetchAllStations = createAsyncThunk(
  "stations/fetchAll",
  async () => {
    try {
      const stations = await stationRepositoryAPI.getAll();
      return stations;
    } catch (error) {
      throw error;
    }
  }
);

/**
 * Get all stations
 * GET /api/stations
 */
export async function getAllStations() {
  try {
    console.log('[StationService] API Request:', {
      method: 'GET',
      endpoint: '/stations'
    });
    
    const response = await api.get('/stations');
    
    console.log('[StationService] API Response:', {
      status: response.status,
      dataType: typeof response.data,
      hasData: !!response.data?.data,
      rawKeys: Object.keys(response.data || {})
    });
    
    // Try different response structures
    const results = response.data?.data || response.data || [];
    console.log('[StationService] Parsed results:', {
      count: Array.isArray(results) ? results.length : 'not array',
      firstItem: Array.isArray(results) && results.length > 0 ? results[0] : null
    });
    
    return Array.isArray(results) ? results : [];
  } catch (error: any) {
    console.error('[StationService] ❌ GET stations API error:', error);
    console.error('[StationService] Error details:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status
    });
    return [];
  }
}

/**
 * Get station ID by name
 * Tìm station ID (GUID) từ tên station bằng cách lấy tất cả stations và filter client-side
 */
export async function getStationIdByName(stationName: string): Promise<string | null> {
  try {
    console.log('[StationService] 🔍 Searching for station:', stationName);
    console.log('[StationService] Calling GET /api/stations...');
    
    const stations = await getAllStations();
    
    console.log('[StationService] Got', stations?.length || 0, 'total stations');
    
    if (stations && stations.length > 0) {
      // Debug: Log first few stations
      console.log('[StationService] Sample stations (first 3):', 
        stations.slice(0, 3).map((s: any) => ({
          id: s.id || s.stationId || s.stationID,
          name: s.name || s.stationName || s.Name || s.StationName,
        }))
      );
      
      // Tìm station match chính xác tên (case-insensitive, trim whitespace)
      const normalizedSearchName = stationName.toLowerCase().trim();
      const exactMatch = stations.find((s: any) => {
        const possibleNames = [
          s.name, s.stationName, s.Name, s.StationName
        ].filter(Boolean);
        
        return possibleNames.some(name => 
          name?.toLowerCase().trim() === normalizedSearchName
        );
      });
      
      if (exactMatch) {
        const id = exactMatch.id || exactMatch.stationId || exactMatch.stationID;
        if (id) {
          console.log('[StationService] ✅ Found exact match:', {
            id,
            name: exactMatch.name || exactMatch.stationName || exactMatch.Name,
            station: exactMatch
          });
          return id;
        }
      }
      
      // Tìm partial match (tên chứa search string)
      const partialMatch = stations.find((s: any) => {
        const possibleNames = [
          s.name, s.stationName, s.Name, s.StationName
        ].filter(Boolean);
        
        return possibleNames.some(name => 
          name?.toLowerCase().includes(normalizedSearchName)
        );
      });
      
      if (partialMatch) {
        const id = partialMatch.id || partialMatch.stationId || partialMatch.stationID;
        if (id) {
          console.log('[StationService] ⚠️ Found partial match:', {
            id,
            name: partialMatch.name || partialMatch.stationName,
            searchedFor: stationName
          });
          return id;
        }
      }
    }
    
    console.warn('[StationService] ❌ No station found for:', stationName);
    console.warn('[StationService] Available station names:', 
      stations?.slice(0, 5).map((s: any) => 
        s.name || s.stationName || s.Name || s.StationName
      )
    );
    return null;
  } catch (error) {
    console.error('[StationService] ❌ Error getting station ID:', error);
    if (error instanceof Error) {
      console.error('[StationService] Error details:', error.message);
    }
    return null;
  }
}
