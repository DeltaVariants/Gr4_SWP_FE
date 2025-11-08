import { Vehicle } from "@/domain/entities/Vehicle";
import { IVehicleRepository } from "@/domain/repositories/VehicleRepository";

/**
 * Use Case: Lấy tất cả xe của người dùng
 *
 * Business Logic:
 * - Lấy danh sách xe từ repository
 * - Có thể thêm filtering, sorting nếu cần
 * - Log activity cho audit trail
 *
 * @param vehicleRepository - Repository để truy xuất dữ liệu xe
 * @returns Promise<Vehicle[]> - Danh sách xe
 */
export async function getAllVehiclesUseCase(
  vehicleRepository: IVehicleRepository
): Promise<Vehicle[]> {
  // Business logic có thể thêm ở đây:
  // - Kiểm tra quyền truy cập
  // - Filtering theo điều kiện business
  // - Logging
  // - Caching strategy

  try {
    const vehicles = await vehicleRepository.getAll();

    // Log thành công (có thể thêm logging service)
    console.log(`[UseCase] Successfully fetched ${vehicles.length} vehicles`);

    return vehicles;
  } catch (error) {
    // Log lỗi
    console.error("[UseCase] Failed to fetch vehicles:", error);
    throw error;
  }
}
