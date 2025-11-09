/**
 * Check In Booking Use Case
 * Business logic for checking in a booking
 */

import { IBookingRepository } from '@/domain/repositories/IBookingRepository';
import { Booking, CheckInData } from '@/domain/entities/Booking';

export class CheckInBookingUseCase {
  constructor(private bookingRepository: IBookingRepository) {}

  async execute(data: CheckInData): Promise<Booking> {
    // Validation
    if (!data.bookingId || data.bookingId.trim().length === 0) {
      throw new Error('Booking ID is required');
    }

    if (!data.vehicleId || data.vehicleId.trim().length === 0) {
      throw new Error('Vehicle ID is required');
    }

    try {
      const booking = await this.bookingRepository.checkIn(data);
      
      console.log('[CheckInBookingUseCase] Check-in successful:', {
        bookingId: booking.bookingID,
        vehicleId: booking.vehicleId,
        status: booking.bookingStatus,
      });

      return booking;
    } catch (error: any) {
      console.error('[CheckInBookingUseCase] Error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Booking not found');
      }
      
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid check-in data');
      }
      
      throw new Error(error.response?.data?.message || 'Check-in failed');
    }
  }
}
