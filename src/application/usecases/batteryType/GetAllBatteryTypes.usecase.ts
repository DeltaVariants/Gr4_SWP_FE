import { BatteryType } from "@/domain/entities/BatteryType";
import { IBatteryTypeRepository } from "@/domain/repositories/BatteryTypeRepository";

/**
 * Use Case: Lấy tất cả battery types
 *
 * Business Logic:
 * - Lấy danh sách battery types từ repository
 * - Có thể thêm filtering, sorting nếu cần
 * - Log activity cho audit trail
 *
 * @param batteryTypeRepository - Repository để truy xuất dữ liệu battery types
 * @returns Promise<BatteryType[]> - Danh sách battery types
 */
export async function getAllBatteryTypesUseCase(
  batteryTypeRepository: IBatteryTypeRepository
): Promise<BatteryType[]> {
  try {
    const batteryTypes = await batteryTypeRepository.getAll();

    // Log thành công
    console.log(
      `[UseCase] Successfully fetched ${batteryTypes.length} battery types`
    );

    return batteryTypes;
  } catch (error) {
    // Log lỗi
    console.error("[UseCase] Failed to fetch battery types:", error);
    throw error;
  }
}
