/**
 * Get Battery Inventory Use Case
 * Business logic for fetching battery inventory
 */

import { IBatteryRepository } from '@/domain/repositories/IBatteryRepository';
import { BatteryInventory } from '@/domain/entities/Battery';

export class GetBatteryInventoryUseCase {
  constructor(private batteryRepository: IBatteryRepository) {}

  async execute(stationId: string): Promise<BatteryInventory> {
    if (!stationId || stationId.trim().length === 0) {
      throw new Error('Station ID is required');
    }

    try {
      const inventory = await this.batteryRepository.getInventory(stationId);
      
      console.log('[GetBatteryInventoryUseCase] Inventory retrieved:', {
        total: inventory.total,
        available: inventory.available,
        inUse: inventory.inUse,
      });

      return inventory;
    } catch (error: any) {
      console.error('[GetBatteryInventoryUseCase] Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch battery inventory');
    }
  }
}
