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
    /**
     * Logic update battery status theo backend:
     * 
     * Backend enum: charging, available, faulty, occupied
     * 
     * 1. PATCH /api/batteries/{id}?CurrentPercentage=X
     *    - Chỉ update percentage và tự động set status:
     *      - >= 90 → available
     *      - < 90 → charging
     *    - KHÔNG check faulty battery (có thể dùng để chuyển từ faulty về available/charging)
     * 
     * 2. POST /api/battery-condition-logs
     *    - LUÔN set battery status = "faulty" (damaged)
     *    - Dùng để đánh dấu pin bị hỏng
     * 
     * Mapping frontend → backend:
     * - Available → available (dùng update percentage với % >= 90)
     * - Charging → charging (dùng update percentage với % < 90)
     * - Damaged → faulty (dùng condition log)
     * - In-Use → không có trong backend enum, có thể là occupied (không thể set trực tiếp)
     * - Maintenance → không có trong backend enum (không thể set trực tiếp)
     */
    
    const oldStatus = (data as any).oldStatus;
    
    console.log('[BatteryRepository] Updating battery status:', {
      batteryId: data.batteryId,
      oldStatus: oldStatus || 'unknown',
      newStatus: data.status
    });
    
    try {
      // Case 1: Chuyển từ Damaged về Available hoặc Charging
      if (oldStatus === 'Damaged' && (data.status === 'Available' || data.status === 'Charging')) {
        const percentage = data.status === 'Available' ? 90 : 50; // >= 90 = available, < 90 = charging
        
        console.log(`[BatteryRepository] 🔄 Damaged → ${data.status}: Using PATCH /batteries/{id}?CurrentPercentage=${percentage}`);
        
        // Backend route: api/batteries (baseURL đã có /api rồi, chỉ cần /batteries)
        const response = await api.patch(`/batteries/${data.batteryId}`, null, {
          params: {
            CurrentPercentage: percentage
          }
        });
        
        console.log('[BatteryRepository] ✅ Battery percentage updated, status should be', data.status);
        
        // Tạo condition log để ghi lại lịch sử
        try {
          const logPayload = {
            BatteryID: data.batteryId,
            Condition: data.status.toLowerCase(),
            Description: data.notes || `Status changed from Damaged to ${data.status}`
          };
          await api.post('/battery-condition-logs', logPayload);
          console.log('[BatteryRepository] ✅ Condition log created for history');
        } catch (logError) {
          // Log error nhưng không throw vì update percentage đã thành công
          console.warn('[BatteryRepository] ⚠️ Failed to create condition log (non-critical):', logError);
        }
        
        return {
          batteryId: data.batteryId,
          batteryCode: data.batteryId,
          batteryType: 'Unknown',
          status: data.status,
          stationId: '',
        } as Battery;
      }
      
      // Case 2: Chuyển từ Available ↔ Charging (dùng update percentage)
      if ((oldStatus === 'Available' || oldStatus === 'Charging') && 
          (data.status === 'Available' || data.status === 'Charging')) {
        const percentage = data.status === 'Available' ? 90 : 50;
        
        console.log(`[BatteryRepository] 🔄 ${oldStatus} → ${data.status}: Using PATCH /batteries/{id}?CurrentPercentage=${percentage}`);
        
        // Backend route: api/batteries (baseURL đã có /api rồi, chỉ cần /batteries)
        const response = await api.patch(`/batteries/${data.batteryId}`, null, {
          params: {
            CurrentPercentage: percentage
          }
        });
        
        console.log('[BatteryRepository] ✅ Battery status updated to', data.status);
        
        // Tạo condition log để ghi lại lịch sử
        try {
          const logPayload = {
            BatteryID: data.batteryId,
            Condition: data.status.toLowerCase(),
            Description: data.notes || `Status changed from ${oldStatus} to ${data.status}`
          };
          await api.post('/battery-condition-logs', logPayload);
          console.log('[BatteryRepository] ✅ Condition log created for history');
        } catch (logError) {
          console.warn('[BatteryRepository] ⚠️ Failed to create condition log (non-critical):', logError);
        }
        
        return {
          batteryId: data.batteryId,
          batteryCode: data.batteryId,
          batteryType: 'Unknown',
          status: data.status,
          stationId: '',
        } as Battery;
      }
      
      // Case 3: Chuyển về Damaged (dùng condition log - backend sẽ set thành faulty)
      if (data.status === 'Damaged' || data.status === 'Faulty') {
        console.log('[BatteryRepository] 📝 Setting status to Damaged: Using condition log');
        
        const payload = {
          BatteryID: data.batteryId,
          Condition: 'damaged',
          Description: data.notes || `Status changed to Damaged`
        };
        
        console.log('[BatteryRepository] 📤 Sending condition log payload:', payload);
        
        const response = await api.post('/battery-condition-logs', payload);
        
        console.log('[BatteryRepository] ✅ Condition log created, battery status set to faulty (damaged)');
        
        return {
          batteryId: data.batteryId,
          batteryCode: data.batteryId,
          batteryType: 'Unknown',
          status: 'Damaged',
          stationId: '',
        } as Battery;
      }
      
      // Case 4: Các trường hợp khác (In-Use, Maintenance) - Backend không hỗ trợ trực tiếp
      // Vẫn tạo condition log để ghi lại, nhưng backend sẽ set thành faulty
      console.log('[BatteryRepository] ⚠️ Status', data.status, 'not directly supported by backend, using condition log');
      
      const statusMap: Record<string, string> = {
        'Available': 'available',
        'In-Use': 'in-use',
        'Charging': 'charging',
        'Maintenance': 'maintenance',
        'Damaged': 'damaged',
        'Faulty': 'damaged',
      };
      
      const backendCondition = statusMap[data.status] || data.status.toLowerCase();
      
      const payload = {
        BatteryID: data.batteryId,
        Condition: backendCondition,
        Description: data.notes || `Status changed to ${data.status} (Note: Backend will set status to faulty)`
      };
      
      const response = await api.post('/battery-condition-logs', payload);
      
      console.log('[BatteryRepository] ⚠️ Condition log created, but backend set status to faulty');
      console.log('[BatteryRepository] 💡 To set status to', data.status, ', backend needs to support this status');
      
      // Trả về status mong muốn (frontend optimistic update)
      // Nhưng thực tế backend đã set thành faulty
      return {
        batteryId: data.batteryId,
        batteryCode: data.batteryId,
        batteryType: 'Unknown',
        status: data.status,
        stationId: '',
      } as Battery;
      
    } catch (error: any) {
      console.error('[BatteryRepository] ❌ Failed to update battery status:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message
      });
      
      throw new Error(
        error?.response?.status === 404 
          ? 'Battery not found or endpoint not available'
          : error?.response?.status === 403
          ? 'Permission denied - Staff role may not have access'
          : error?.response?.data?.message || error?.message || 'Failed to update battery status'
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
