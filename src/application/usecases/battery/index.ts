/**
 * Battery Use Cases
 * Export all configured battery use case instances
 */

import { batteryRepository } from '@/infrastructure/repositories/Hoang/BatteryRepository';
import { GetBatteriesByStationUseCase } from './GetBatteriesByStationUseCase';
import { GetBatteryInventoryUseCase } from './GetBatteryInventoryUseCase';
import { UpdateBatteryStatusUseCase } from './UpdateBatteryStatusUseCase';

// Export configured use case instances (singleton)
export const getBatteriesByStationUseCase = new GetBatteriesByStationUseCase(batteryRepository);
export const getBatteryInventoryUseCase = new GetBatteryInventoryUseCase(batteryRepository);
export const updateBatteryStatusUseCase = new UpdateBatteryStatusUseCase(batteryRepository);

// Export classes for testing or custom instantiation
export { GetBatteriesByStationUseCase, GetBatteryInventoryUseCase, UpdateBatteryStatusUseCase };
