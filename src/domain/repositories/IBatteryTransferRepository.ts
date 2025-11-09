/**
 * BatteryTransfer Repository Interface
 * Định nghĩa contract cho battery transfer operations
 */

import {
  BatteryTransfer,
  CreateBatteryTransferData,
  UpdateBatteryTransferData,
} from '../entities/BatteryTransfer';

export interface IBatteryTransferRepository {
  /**
   * Get all battery transfers
   */
  getAll(): Promise<BatteryTransfer[]>;

  /**
   * Get battery transfer by ID
   */
  getById(id: string): Promise<BatteryTransfer>;

  /**
   * Get battery transfers by station (from or to)
   */
  getByStation(stationID: string): Promise<BatteryTransfer[]>;

  /**
   * Create new battery transfer
   */
  create(data: CreateBatteryTransferData): Promise<BatteryTransfer>;

  /**
   * Update battery transfer status
   */
  update(id: string, data: UpdateBatteryTransferData): Promise<BatteryTransfer>;
}
