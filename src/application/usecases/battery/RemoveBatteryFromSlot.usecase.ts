import {
  UpdateBatteryParams,
  UpdateBatteryResponse,
} from "@/domain/entities/Battery";
import { IBatteryRepository } from "@/domain/repositories/BatteryRepository";

/**
 * Use Case: Tháo pin ra khỏi slot
 *
 * Business Logic:
 * - Validate batteryID
 * - Gọi API với batteryID mà không có parameters khác
 * - Điều này sẽ tháo pin ra khỏi slot hiện tại
 * - Logging activity
 *
 * @param batteryRepository - Repository để cập nhật pin
 * @param batteryID - ID của pin cần tháo
 * @returns Promise<UpdateBatteryResponse>
 * @throws Error nếu validation fail
 */
export async function removeBatteryFromSlotUseCase(
  batteryRepository: IBatteryRepository,
  batteryID: string
): Promise<UpdateBatteryResponse> {
  // Validate input
  if (!batteryID || batteryID.trim() === "") {
    throw new Error("Battery ID is required and cannot be empty");
  }

  try {
    // Gọi update với chỉ batteryID, không có batterySlotID và currentPercentage
    // Điều này sẽ tháo pin ra khỏi slot
    const params: UpdateBatteryParams = {
      batteryID,
    };

    console.log(`[UseCase] Removing battery ${batteryID} from slot`);

    const result = await batteryRepository.update(params);

    console.log(
      `[UseCase] Successfully removed battery ${batteryID} from slot`
    );

    return result;
  } catch (error) {
    console.error(
      `[UseCase] Failed to remove battery ${batteryID} from slot:`,
      error
    );
    throw error;
  }
}
