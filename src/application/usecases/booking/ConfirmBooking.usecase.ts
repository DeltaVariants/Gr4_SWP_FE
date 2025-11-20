/**
 * Confirm Booking Use Case
 * Employee confirms a pending booking
 * Backend automatically creates SwapTransaction with status="initiated" when status="completed"
 */

import { bookingRepository } from '@/infrastructure/repositories/Hoang/BookingRepository';
import { Booking } from '@/domain/dto/Hoang/Booking';

export interface ConfirmBookingResult {
  booking: Booking;
  swapTransactionId?: string;
}

export class ConfirmBookingUseCase {
  async execute(bookingId: string): Promise<ConfirmBookingResult> {
    try {
      // Backend will handle status validation and create SwapTransaction
      const result = await bookingRepository.confirm(bookingId);

      console.log('[ConfirmBookingUseCase] ✅ Booking confirmed:', {
        bookingId,
        swapTransactionId: result.swapTransactionId
      });

      return result;
    } catch (error: any) {
      console.error('[ConfirmBookingUseCase] ❌ Error:', error);
      throw new Error(error.message || 'Không thể xác nhận booking');
    }
  }
}

export const confirmBookingUseCase = new ConfirmBookingUseCase();
