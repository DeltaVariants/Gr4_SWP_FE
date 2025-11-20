import { BatteryListResponse } from "@/dto";
import {
  IBatteryRepository,
  GetBatteriesParams,
} from "@/domain/repositories/BatteryRepository";

export async function getAllBatteriesUseCase(
  batteryRepository: IBatteryRepository,
  params?: GetBatteriesParams
): Promise<BatteryListResponse> {
  // Có thể thêm validation hoặc business logic ở đây
  // Ví dụ: kiểm tra quyền truy cập, log activity, etc.

  return await batteryRepository.getAll(params);
}
