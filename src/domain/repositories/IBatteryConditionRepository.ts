/**
 * BatteryCondition Repository Interface
 * Định nghĩa contract cho battery condition operations
 */

import {
  BatteryCondition,
  CreateBatteryConditionData,
  UpdateBatteryConditionData,
} from '../entities/BatteryCondition';

export interface IBatteryConditionRepository {
  /**
   * Get all battery condition logs
   */
  getAll(): Promise<BatteryCondition[]>;

  /**
   * Get battery condition by ID
   */
  getById(id: string): Promise<BatteryCondition>;

  /**
   * Get battery conditions by station
   */
  getByStation(stationName: string): Promise<BatteryCondition[]>;

  /**
   * Get battery conditions by battery ID
   */
  getByBattery(batteryID: string): Promise<BatteryCondition[]>;

  /**
   * Create new battery condition log
   */
  create(data: CreateBatteryConditionData): Promise<BatteryCondition>;

  /**
   * Update battery condition
   */
  update(id: string, data: UpdateBatteryConditionData): Promise<BatteryCondition>;
}
