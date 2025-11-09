/**
 * Battery Repository Interface
 * Định nghĩa contract cho battery operations
 */

import { Battery, BatteryInventory, UpdateBatteryStatusData } from '../entities/Battery';

export interface IBatteryRepository {
  /**
   * Get all batteries in a station
   */
  getByStation(stationId: string): Promise<Battery[]>;

  /**
   * Get battery by ID
   */
  getById(batteryId: string): Promise<Battery>;

  /**
   * Get battery inventory summary
   */
  getInventory(stationId: string): Promise<BatteryInventory>;

  /**
   * Update battery status
   */
  updateStatus(data: UpdateBatteryStatusData): Promise<Battery>;

  /**
   * Get available batteries by type
   */
  getAvailable(stationId: string, batteryType: string): Promise<Battery[]>;
}
