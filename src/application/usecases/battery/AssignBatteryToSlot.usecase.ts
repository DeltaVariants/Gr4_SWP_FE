import {
  UpdateBatteryParams,
  UpdateBatteryResponse,
} from "@/domain/entities/Battery";
import { IBatteryRepository } from "@/domain/repositories/BatteryRepository";

/**
 * Use Case: Gắn pin vào slot với phần trăm charge
 *
 * Business Logic:
 * - Validate batteryID, batterySlotID và currentPercentage
 * - Gọi API với đầy đủ parameters để gắn pin vào slot
 * - Logging activity
 *
 * @param batteryRepository - Repository để cập nhật pin
 * @param batteryID - ID của pin cần gắn
 * @param batterySlotID - ID của slot cần gắn pin vào
 * @param currentPercentage - Phần trăm pin (0-100)
 * @returns Promise<UpdateBatteryResponse>
 * @throws Error nếu validation fail
 */
export async function assignBatteryToSlotUseCase(
  batteryRepository: IBatteryRepository,
  batteryID: string,
  batterySlotID: string,
  currentPercentage: number
): Promise<UpdateBatteryResponse> {
  // Validate inputs
  if (!batteryID || batteryID.trim() === "") {
    throw new Error("Battery ID is required and cannot be empty");
  }

  if (!batterySlotID || batterySlotID.trim() === "") {
    throw new Error("Battery Slot ID is required and cannot be empty");
  }

  if (currentPercentage < 0 || currentPercentage > 100) {
    throw new Error("Current percentage must be between 0 and 100");
  }

  try {
    const params: UpdateBatteryParams = {
      batteryID,
      batterySlotID,
      currentPercentage,
    };

    console.log(
      `[UseCase] Assigning battery ${batteryID} to slot ${batterySlotID} with ${currentPercentage}%`
    );

    const result = await batteryRepository.update(params);

    console.log(
      `[UseCase] Successfully assigned battery ${batteryID} to slot ${batterySlotID}`
    );

    return result;
  } catch (error) {
    console.error(
      `[UseCase] Failed to assign battery ${batteryID} to slot:`,
      error
    );
    throw error;
  }
}
