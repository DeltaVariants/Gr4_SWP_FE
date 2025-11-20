/**
 * Get Available Batteries Use Case
 * Get available batteries at station for swap
 */

import { batteryRepository } from '@/infrastructure/repositories/Hoang/BatteryRepository';
import { Battery } from '@/domain/dto/Hoang/Battery';

export interface GetAvailableBatteriesInput {
  stationId: string;
  batteryType?: string;
  minCharge?: number;
}

export class GetAvailableBatteriesUseCase {
  async execute(input: GetAvailableBatteriesInput): Promise<Battery[]> {
    try {
      let batteries: Battery[];

      if (input.batteryType) {
        // Get batteries by type
        batteries = await batteryRepository.getAvailable(input.stationId, input.batteryType);
      } else {
        // Get all batteries and filter by status
        const allBatteries = await batteryRepository.getByStation(input.stationId);
        batteries = allBatteries.filter((b) => b.status === 'Available');
      }

      // Filter by minimum charge if specified
      if (input.minCharge !== undefined) {
        batteries = batteries.filter((b) => b.currentCharge >= input.minCharge!);
      }

      // Sort by charge level (highest first)
      batteries.sort((a, b) => b.currentCharge - a.currentCharge);

      console.log('[GetAvailableBatteriesUseCase] ✅ Found batteries:', batteries.length);

      return batteries;
    } catch (error: any) {
      console.error('[GetAvailableBatteriesUseCase] ❌ Error:', error);
      throw new Error(error.message || 'Không thể lấy danh sách pin');
    }
  }
}

export const getAvailableBatteriesUseCase = new GetAvailableBatteriesUseCase();
