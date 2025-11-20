/**
 * Complete Swap Use Case
 * Business logic for completing battery swap
 */

import { IBookingRepository } from '@/domain/repositories/Hoang/IBookingRepository';
import { Booking, SwapData } from '@/domain/dto/Hoang/Booking';

export class CompleteSwapUseCase {
  constructor(private bookingRepository: IBookingRepository) {}

  async execute(data: SwapData): Promise<Booking> {
    // Validation
    if (!data.bookingId || data.bookingId.trim().length === 0) {
      throw new Error('Booking ID is required');
    }

    if (!data.oldBatteryId || data.oldBatteryId.trim().length === 0) {
      throw new Error('Old battery ID is required');
    }

    if (!data.newBatteryId || data.newBatteryId.trim().length === 0) {
      throw new Error('New battery ID is required');
    }

    if (data.oldBatteryId === data.newBatteryId) {
      throw new Error('Old and new battery must be different');
    }

    try {
      const booking = await this.bookingRepository.completeSwap(data);
      
      console.log('[CompleteSwapUseCase] Swap completed:', {
        bookingId: booking.bookingID,
        oldBattery: data.oldBatteryId,
        newBattery: data.newBatteryId,
        status: booking.bookingStatus,
      });

      return booking;
    } catch (error: any) {
      console.error('[CompleteSwapUseCase] Error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Booking or battery not found');
      }
      
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid swap data');
      }
      
      throw new Error(error.response?.data?.message || 'Battery swap failed');
    }
  }
}
