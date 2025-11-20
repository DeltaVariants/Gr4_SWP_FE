import { Vehicle } from "@/domain/entities/Vehicle";

/**
 * Use Case: Chọn xe hiện tại để hiển thị
 *
 * Business Logic:
 * - Validate xe được chọn
 * - Có thể lưu lựa chọn vào localStorage
 * - Log activity
 *
 * @param vehicle - Xe được chọn
 * @returns Promise<Vehicle> - Xe đã được chọn
 * @throws Error nếu vehicle không hợp lệ
 */
export async function selectVehicleUseCase(
  vehicle: Vehicle | null
): Promise<Vehicle | null> {
  // Validate input
  if (!vehicle) {
    console.log("[UseCase] Clearing vehicle selection");
    // Clear selection from localStorage nếu cần
    if (typeof window !== "undefined") {
      localStorage.removeItem("selectedVehicleId");
    }
    return null;
  }

  // Validate vehicle object
  if (!vehicle.vehicleID) {
    throw new Error("Invalid vehicle: missing vehicleID");
  }

  try {
    // Lưu selection vào localStorage để persist khi reload
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedVehicleId", vehicle.vehicleID);
    }

    console.log(
      `[UseCase] Selected vehicle: ${vehicle.vehicleName} (${vehicle.vehicleID})`
    );

    return vehicle;
  } catch (error) {
    console.error("[UseCase] Failed to select vehicle:", error);
    throw error;
  }
}

/**
 * Use Case: Lấy xe đã chọn trước đó từ localStorage
 *
 * @returns string | null - ID của xe đã chọn hoặc null
 */
export function getLastSelectedVehicleIdUseCase(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("selectedVehicleId");
  }
  return null;
}
