/**
 * Confirm Booking Use Case
 * Employee confirms a pending booking
 */

import { bookingRepository } from '@/infrastructure/repositories/BookingRepository';
import { Booking } from '@/domain/entities/Booking';

export class ConfirmBookingUseCase {
  async execute(bookingId: string): Promise<Booking> {
    try {
      // Directly confirm booking without validation
      // Backend will handle status validation
      const confirmedBooking = await bookingRepository.confirm(bookingId);

      console.log('[ConfirmBookingUseCase] ✅ Booking confirmed:', confirmedBooking);

      return confirmedBooking;
    } catch (error: any) {
      console.error('[ConfirmBookingUseCase] ❌ Error:', error);
      throw new Error(error.message || 'Không thể xác nhận booking');
    }
  }
}

export const confirmBookingUseCase = new ConfirmBookingUseCase();
