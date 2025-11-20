export { getAllBatteriesUseCase } from "./GetAllBatteries.usecase";
export { updateBatteryPercentageUseCase } from "./UpdateBatteryPercentage.usecase";
export { removeBatteryFromSlotUseCase } from "./RemoveBatteryFromSlot.usecase";
export { assignBatteryToSlotUseCase } from "./AssignBatteryToSlot.usecase";

// Export classes for use cases that need instantiation
export { GetBatteriesByStationUseCase } from "./GetBatteriesByStationUseCase";
export { GetBatteryInventoryUseCase } from "./GetBatteryInventoryUseCase";
export { UpdateBatteryStatusUseCase } from "./UpdateBatteryStatusUseCase";

// Export instantiated use cases (singleton pattern)
import { batteryRepository } from "@/infrastructure/repositories/Hoang/BatteryRepository";
import { GetBatteriesByStationUseCase } from "./GetBatteriesByStationUseCase";
import { GetBatteryInventoryUseCase } from "./GetBatteryInventoryUseCase";
import { UpdateBatteryStatusUseCase } from "./UpdateBatteryStatusUseCase";

export const getBatteriesByStationUseCase = new GetBatteriesByStationUseCase(batteryRepository);
export const getBatteryInventoryUseCase = new GetBatteryInventoryUseCase(batteryRepository);
export const updateBatteryStatusUseCase = new UpdateBatteryStatusUseCase(batteryRepository);
