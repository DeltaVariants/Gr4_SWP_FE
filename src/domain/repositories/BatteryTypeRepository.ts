import { BatteryType } from "../entities/BatteryType";

/**
 * Repository Interface cho Battery Type
 * Định nghĩa các phương thức để truy xuất dữ liệu Battery Type
 */
export interface IBatteryTypeRepository {
  /**
   * Lấy tất cả battery types
   * @returns Promise<BatteryType[]>
   */
  getAll(): Promise<BatteryType[]>;

  /**
   * Lấy battery type theo ID
   * @param batteryTypeId - ID của battery type
   * @returns Promise<BatteryType | null>
   */
  getById(batteryTypeId: string): Promise<BatteryType | null>;
}
