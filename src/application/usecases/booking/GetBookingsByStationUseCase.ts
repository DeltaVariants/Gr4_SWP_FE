/**
 * Get Bookings By Station Use Case
 * Business logic for fetching bookings by station
 */

import { IBookingRepository } from '@/domain/repositories/IBookingRepository';
import { Booking } from '@/domain/entities/Booking';

export class GetBookingsByStationUseCase {
  constructor(private bookingRepository: IBookingRepository) {}

  async execute(stationId: string): Promise<Booking[]> {
    if (!stationId || stationId.trim().length === 0) {
      throw new Error('Station ID is required');
    }

    try {
      const bookings = await this.bookingRepository.getByStation(stationId);
      
      console.log(`[GetBookingsByStationUseCase] Found ${bookings.length} bookings for station ${stationId}`);
      
      return bookings;
    } catch (error: any) {
      console.error('[GetBookingsByStationUseCase] Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }
}
