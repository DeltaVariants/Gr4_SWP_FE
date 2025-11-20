/**
 * Get Batteries By Station Use Case
 * Business logic for fetching batteries by station
 */

import { IBatteryRepository } from '@/domain/repositories/Hoang/IBatteryRepository';
import { Battery } from '@/domain/dto/Hoang/Battery';

export class GetBatteriesByStationUseCase {
  constructor(private batteryRepository: IBatteryRepository) {}

  async execute(stationId: string): Promise<Battery[]> {
    if (!stationId || stationId.trim().length === 0) {
      throw new Error('Station ID is required');
    }

    try {
      const batteries = await this.batteryRepository.getByStation(stationId);
      
      console.log(`[GetBatteriesByStationUseCase] Found ${batteries.length} batteries for station ${stationId}`);
      
      return batteries;
    } catch (error: any) {
      console.error('[GetBatteriesByStationUseCase] Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch batteries');
    }
  }
}
