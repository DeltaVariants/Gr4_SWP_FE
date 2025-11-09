/**
 * BatteryType Repository Interface
 * Định nghĩa contract cho battery type operations
 */

import {
  BatteryType,
  CreateBatteryTypeData,
  UpdateBatteryTypeData,
} from '../entities/BatteryType';

export interface IBatteryTypeRepository {
  /**
   * Get all battery types
   */
  getAll(): Promise<BatteryType[]>;

  /**
   * Get battery type by model name
   */
  getByModelName(modelName: string): Promise<BatteryType>;

  /**
   * Create new battery type
   */
  create(data: CreateBatteryTypeData): Promise<BatteryType>;

  /**
   * Update battery type
   */
  update(id: string, data: UpdateBatteryTypeData): Promise<BatteryType>;

  /**
   * Delete battery type
   */
  delete(id: string): Promise<void>;
}
