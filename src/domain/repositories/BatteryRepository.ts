import {
  BatteryListResponse,
  UpdateBatteryParams,
  UpdateBatteryResponse,
} from "../entities/Battery";

export interface GetBatteriesParams {
  pageNumber?: number;
  pageSize?: number;
  createDate?: string; // ISO date-time string
  typeName?: string;
  vehicleId?: string;
}

export interface IBatteryRepository {
  /**
   * Lấy danh sách pin với phân trang và filters
   */
  getAll(params?: GetBatteriesParams): Promise<BatteryListResponse>;

  /**
   * Update thông tin pin (percentage hoặc slot)
   */
  update(params: UpdateBatteryParams): Promise<UpdateBatteryResponse>;

  // Có thể thêm các phương thức khác sau này:
  // getById(batteryId: string): Promise<Battery | null>;
  // delete(batteryId: string): Promise<void>;
}
