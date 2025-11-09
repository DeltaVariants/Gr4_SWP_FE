/**
 * Update Booking Status Use Case
 * Business logic for updating booking status
 */

import { IBookingRepository } from '@/domain/repositories/IBookingRepository';

export class UpdateBookingStatusUseCase {
  constructor(private bookingRepository: IBookingRepository) {}

  async execute(bookingId: string, status: string): Promise<void> {
    if (!bookingId || bookingId.trim().length === 0) {
      throw new Error('Booking ID is required');
    }

    if (!status || status.trim().length === 0) {
      throw new Error('Status is required');
    }

    // Validate status values
    const validStatuses = ['Pending', 'Confirmed', 'Booked', 'Queue', 'Checked', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    try {
      await this.bookingRepository.updateBookingStatus(bookingId, status);
      console.log('[UpdateBookingStatusUseCase] Status updated:', { bookingId, status });
    } catch (error: any) {
      console.error('[UpdateBookingStatusUseCase] Update failed:', error);
      throw new Error(error?.message || 'Failed to update booking status');
    }
  }
}
