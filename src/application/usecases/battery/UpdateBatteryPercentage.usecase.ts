import {
  UpdateBatteryParams,
  UpdateBatteryResponse,
} from "@/domain/dto/Battery/BatteryDTO";
import { IBatteryRepository } from "@/domain/repositories/BatteryRepository";

/**
 * Use Case: Update phần trăm pin
 *
 * Business Logic:
 * - Validate batteryID và currentPercentage
 * - Update currentPercentage của pin
 * - Logging activity
 *
 * @param batteryRepository - Repository để cập nhật pin
 * @param batteryID - ID của pin cần update
 * @param currentPercentage - Phần trăm pin mới (0-100)
 * @returns Promise<UpdateBatteryResponse>
 * @throws Error nếu validation fail
 */
export async function updateBatteryPercentageUseCase(
  batteryRepository: IBatteryRepository,
  batteryID: string,
  currentPercentage: number
): Promise<UpdateBatteryResponse> {
  // Validate inputs
  if (!batteryID || batteryID.trim() === "") {
    throw new Error("Battery ID is required and cannot be empty");
  }

  if (currentPercentage < 0 || currentPercentage > 100) {
    throw new Error("Current percentage must be between 0 and 100");
  }

  try {
    const params: UpdateBatteryParams = {
      batteryID,
      currentPercentage,
    };

    console.log(
      `[UseCase] Updating battery ${batteryID} percentage to ${currentPercentage}%`
    );

    const result = await batteryRepository.update(params);

    console.log(
      `[UseCase] Successfully updated battery ${batteryID} percentage`
    );

    return result;
  } catch (error) {
    console.error(
      `[UseCase] Failed to update battery ${batteryID} percentage:`,
      error
    );
    throw error;
  }
}
