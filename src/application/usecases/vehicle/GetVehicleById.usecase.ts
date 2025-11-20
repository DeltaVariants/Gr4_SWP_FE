import { Vehicle } from "@/domain/entities/Vehicle";
import { IVehicleRepository } from "@/domain/repositories/VehicleRepository";

/**
 * Use Case: Lấy thông tin chi tiết một xe theo ID
 *
 * Business Logic:
 * - Validate vehicleId
 * - Lấy thông tin xe từ repository
 * - Kiểm tra quyền sở hữu (nếu cần)
 *
 * @param vehicleRepository - Repository để truy xuất dữ liệu xe
 * @param vehicleId - ID của xe cần lấy thông tin
 * @returns Promise<Vehicle | null> - Thông tin xe hoặc null nếu không tìm thấy
 * @throws Error nếu vehicleId không hợp lệ
 */
export async function getVehicleByIdUseCase(
  vehicleRepository: IVehicleRepository,
  vehicleId: string
): Promise<Vehicle | null> {
  // Validate input
  if (!vehicleId || vehicleId.trim() === "") {
    throw new Error("Vehicle ID is required and cannot be empty");
  }

  try {
    const vehicle = await vehicleRepository.getById(vehicleId);

    if (!vehicle) {
      console.warn(`[UseCase] Vehicle with ID ${vehicleId} not found`);
      return null;
    }

    // Business logic có thể thêm:
    // - Kiểm tra user có quyền xem xe này không
    // - Enrich data với thông tin từ các service khác
    // - Logging access

    console.log(`[UseCase] Successfully fetched vehicle ${vehicleId}`);

    return vehicle;
  } catch (error) {
    console.error(`[UseCase] Failed to fetch vehicle ${vehicleId}:`, error);
    throw error;
  }
}
