/**
 * BatterySlot Repository Interface
 * Định nghĩa contract cho battery slot operations
 */

import {
  BatterySlot,
  CreateBatterySlotData,
  UpdateBatterySlotData,
} from '../entities/BatterySlot';

export interface IBatterySlotRepository {
  /**
   * Get battery slot by ID
   */
  getById(id: string): Promise<BatterySlot>;

  /**
   * Get battery slots by station
   */
  getByStation(stationID: string): Promise<BatterySlot[]>;

  /**
   * Create new battery slot
   */
  create(data: CreateBatterySlotData): Promise<BatterySlot>;

  /**
   * Update battery slot
   */
  update(id: string, data: UpdateBatterySlotData): Promise<BatterySlot>;

  /**
   * Delete battery slot
   */
  delete(id: string): Promise<void>;
}
