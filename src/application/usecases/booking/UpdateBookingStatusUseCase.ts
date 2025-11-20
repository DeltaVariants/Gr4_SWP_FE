/**
 * Update Booking Status Use Case
 * Business logic for updating booking status
 */

import { IBookingRepository } from '@/domain/repositories/Hoang/IBookingRepository';

export class UpdateBookingStatusUseCase {
  constructor(private bookingRepository: IBookingRepository) {}

  async execute(bookingId: string, status: string): Promise<void> {
    if (!bookingId || bookingId.trim().length === 0) {
      throw new Error('Booking ID is required');
    }

    if (!status || status.trim().length === 0) {
      throw new Error('Status is required');
    }
 
    // Validate status values (accept both uppercase and lowercase)
    // Backend expects lowercase: "completed" or "cancelled"
    const statusLower = status.toLowerCase();
    const validStatuses = ['pending', 'confirmed', 'booked', 'queue', 'checked', 'completed', 'cancelled'];
    if (!validStatuses.includes(statusLower)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    try {
      // Repository will convert to lowercase automatically, but we pass the original status
      // to maintain consistency with the Booking type
      await this.bookingRepository.updateStatus(bookingId, status as any);
      console.log('[UpdateBookingStatusUseCase] Status updated:', { bookingId, status, statusLower });
    } catch (error: any) {
      console.error('[UpdateBookingStatusUseCase] Update failed:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update booking status';
      throw new Error(errorMessage);
    }
  }
}
