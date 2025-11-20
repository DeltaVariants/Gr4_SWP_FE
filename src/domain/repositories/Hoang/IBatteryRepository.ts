/**
 * IBatteryRepository Interface
 * Defines contract for battery data access operations
 */

import { Battery, BatteryInventory, UpdateBatteryStatusData } from '@/domain/dto/Hoang/Battery';

export interface IBatteryRepository {
  getByStation(stationId: string): Promise<Battery[]>;
  getById(batteryId: string): Promise<Battery>;
  getByVehicle(vehicleId: string): Promise<Battery | null>;
  getInventory(stationId: string): Promise<BatteryInventory>;
  updateStatus(data: UpdateBatteryStatusData): Promise<Battery>;
  getAvailable(stationId: string, batteryType: string): Promise<Battery[]>;
}

