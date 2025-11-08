import { Vehicle } from "../entities/Vehicle";

export interface IVehicleRepository {
  /**
   * Lấy danh sách xe của người dùng
   */
  getAll(): Promise<Vehicle[]>;

  /**
   * Lấy thông tin xe theo ID
   */
  getById(vehicleId: string): Promise<Vehicle | null>;
}
