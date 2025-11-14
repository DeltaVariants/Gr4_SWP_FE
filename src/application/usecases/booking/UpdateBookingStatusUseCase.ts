/**
 * Update Booking Status Use Case
 * Business logic for updating booking status
 */

import { IBookingRepository } from '@/domain/repositories/IBookingRepository';
import { Booking } from '@/domain/entities/Booking';

export class UpdateBookingStatusUseCase {
  constructor(private bookingRepository: IBookingRepository) {}

  async execute(bookingId: string, status: Booking['status']): Promise<void> {
    if (!bookingId || bookingId.trim().length === 0) {
      throw new Error('Booking ID is required');
    }

    if (!status || status.trim().length === 0) {
      throw new Error('Status is required');
    }
 
    // Validate status values - Leader format: "pending" | "cancelled" | "completed"
    const validStatuses: Booking['status'][] = ['pending', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    try {
      await this.bookingRepository.updateStatus(bookingId, status);
      console.log('[UpdateBookingStatusUseCase] Status updated:', { bookingId, status });
    } catch (error: any) {
      console.error('[UpdateBookingStatusUseCase] Update failed:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update booking status';
      throw new Error(errorMessage);
    }
  }
}
