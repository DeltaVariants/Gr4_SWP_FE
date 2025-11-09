/**
 * Battery Repository Implementation
 * Implements IBatteryRepository using API calls
 */

import { IBatteryRepository } from '@/domain/repositories/IBatteryRepository';
import { Battery, BatteryInventory, UpdateBatteryStatusData } from '@/domain/entities/Battery';
import api from '@/lib/api';

export class BatteryRepository implements IBatteryRepository {
  private readonly basePath = '/Batteries';

  async getByStation(stationId: string): Promise<Battery[]> {
    const response = await api.get(`${this.basePath}/station/${stationId}/Batteries`);
    const rawData = response.data.data || response.data;
    
    // Map backend fields to frontend Battery interface
    // Backend uses: batteryStatus, batteryTypeName, batteryID (camelCase with lowercase status value)
    // Frontend expects: status, batteryType, batteryId
    const data = Array.isArray(rawData) ? rawData.map((b: any) => {
      // Map status: "available" -> "Available", "in-use" -> "In-Use", etc.
      let mappedStatus = 'Unknown';
      if (b.batteryStatus) {
        const statusLower = b.batteryStatus.toLowerCase();
        if (statusLower === 'available') mappedStatus = 'Available';
        else if (statusLower === 'in-use' || statusLower === 'inuse') mappedStatus = 'In-Use';
        else if (statusLower === 'charging') mappedStatus = 'Charging';
        else if (statusLower === 'maintenance') mappedStatus = 'Maintenance';
        else if (statusLower === 'damaged' || statusLower === 'faulty') mappedStatus = 'Damaged';
      }
      
      return {
        ...b,
        batteryId: b.batteryID || b.batteryId,
        batteryCode: b.batteryCode || b.batteryID || b.batteryId,
        batteryType: b.batteryTypeName || b.batteryType || 'Unknown',
        status: mappedStatus,
        stationId: b.lastStationID || b.stationId || stationId,
        // Keep original fields for reference
        batteryTypeID: b.batteryTypeID,
        currentLocation: b.currentLocation,
        batteryStatus: b.batteryStatus,
        soH: b.soH,
        currentPercentage: b.currentPercentage,
      };
    }) : [];
    
    console.log('[BatteryRepository] Mapped batteries:', {
      total: data.length,
      sample: data[0] ? {
        id: data[0].batteryId,
        type: data[0].batteryType,
        status: data[0].status
      } : null,
      statusBreakdown: {
        available: data.filter(b => b.status === 'Available').length,
        charging: data.filter(b => b.status === 'Charging').length,
        inUse: data.filter(b => b.status === 'In-Use').length,
        maintenance: data.filter(b => b.status === 'Maintenance').length,
        damaged: data.filter(b => b.status === 'Damaged').length,
      }
    });
    
    return data;
  }

  async getById(batteryId: string): Promise<Battery> {
    const response = await api.get(`${this.basePath}/${batteryId}`);
    return response.data.data || response.data;
  }

  async getInventory(stationId: string): Promise<BatteryInventory> {
    // Get all batteries for the station
    const allBatteries = await this.getByStation(stationId);
    
    // Filter out batteries with missing status
    const batteries = allBatteries.filter(b => b && b.status);
    
    console.log('[BatteryRepository] Inventory calculation:', {
      total: allBatteries.length,
      valid: batteries.length,
      invalid: allBatteries.length - batteries.length
    });
    
    // Calculate inventory from batteries
    const inventory: BatteryInventory = {
      total: batteries.length,
      available: batteries.filter(b => b.status === 'Available').length,
      inUse: batteries.filter(b => b.status === 'In-Use').length,
      charging: batteries.filter(b => b.status === 'Charging').length,
      maintenance: batteries.filter(b => b.status === 'Maintenance').length,
      damaged: batteries.filter(b => b.status === 'Damaged').length,
      byType: {}
    };
    
    // Group by battery type
    batteries.forEach(battery => {
      // Skip batteries without required fields
      if (!battery.batteryType || !battery.status) {
        console.warn('[BatteryRepository] Skipping battery with missing data:', battery);
        return;
      }
      
      if (!inventory.byType[battery.batteryType]) {
        inventory.byType[battery.batteryType] = {
          total: 0,
          available: 0,
          inUse: 0,
          charging: 0,
          maintenance: 0,
          damaged: 0
        };
      }
      
      const typeStats = inventory.byType[battery.batteryType];
      typeStats.total++;
      
      // Map status to lowercase key with camelCase for 'In-Use'
      const statusKey = battery.status === 'In-Use' 
        ? 'inUse' 
        : battery.status.toLowerCase() as keyof typeof typeStats;
      
      if (typeof typeStats[statusKey] === 'number') {
        (typeStats[statusKey] as number)++;
      }
    });
    
    return inventory;
  }

  async updateStatus(data: UpdateBatteryStatusData): Promise<Battery> {
    // ⚠️ IMPORTANT: Backend does NOT have /api/Batteries/{id} PATCH endpoint
    // Based on Swagger, we need to use /api/battery-condition-logs instead
    
    console.log('[BatteryRepository] ⚠️ Backend does not support direct battery status update');
    console.log('[BatteryRepository] Available APIs:', {
      conditionLogs: 'POST /api/battery-condition-logs (create log)',
      patchLog: 'PATCH /api/battery-condition-logs/{id} (update log)',
      note: 'No endpoint to update batteryStatus directly'
    });
    
    // Map frontend status to backend condition
    const statusMap: Record<string, string> = {
      'Available': 'available',
      'In-Use': 'in-use',
      'Charging': 'charging',
      'Maintenance': 'maintenance',
      'Damaged': 'damaged',
      'Faulty': 'damaged',
    };
    
    const backendStatus = statusMap[data.status] || data.status.toLowerCase();
    
    console.log('[BatteryRepository] Attempting to update via condition log:', {
      batteryId: data.batteryId,
      newStatus: backendStatus,
      notes: data.notes
    });
    
    try {
      const payload = {
        batteryID: data.batteryId,
        conditionStatus: backendStatus,
        notes: data.notes || `Status changed to ${data.status}`,
        recordedAt: new Date().toISOString(),
      };
      
      console.log('[BatteryRepository] 📤 Sending payload:', payload);
      
      // Create battery condition log (this might trigger status update in backend)
      const response = await api.post('/battery-condition-logs', payload);
      
      console.log('[BatteryRepository] ✅ Condition log created:', response.data);
      console.log('[BatteryRepository] 🔍 Check if backend updated batteryStatus to:', backendStatus);
      
      // Return optimistic update since backend doesn't return updated battery
      return {
        batteryId: data.batteryId,
        batteryCode: data.batteryId,
        batteryType: 'Unknown',
        status: data.status,
        stationId: '',
      } as Battery;
      
    } catch (error: any) {
      console.error('[BatteryRepository] ❌ Failed to create condition log:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message
      });
      
      throw new Error(
        error?.response?.status === 404 
          ? 'Battery not found or endpoint not available'
          : error?.response?.status === 403
          ? 'Permission denied - Staff role may not have access'
          : 'Failed to update battery status. Backend does not support this operation.'
      );
    }
  }

  async getAvailable(stationId: string, batteryType: string): Promise<Battery[]> {
    // Use the correct endpoint: GET /api/Batteries/station/{stationID}/Batteries
    const response = await api.get(`${this.basePath}/station/${stationId}/Batteries`);
    const data = response.data.data || response.data;
    // Filter by battery type if provided
    const batteries = Array.isArray(data) ? data : [];
    return batteryType 
      ? batteries.filter((b: Battery) => b.batteryType === batteryType)
      : batteries;
  }
}

// Export singleton instance
export const batteryRepository = new BatteryRepository();
