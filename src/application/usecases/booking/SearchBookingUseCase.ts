/**
 * Search Booking Use Case
 * Business logic for searching booking by ID, customer name, or vehicle plate
 */

import { IBookingRepository } from '@/domain/repositories/IBookingRepository';
import { Booking } from '@/domain/entities/Booking';

export class SearchBookingUseCase {
  constructor(private bookingRepository: IBookingRepository) {}

  async execute(searchTerm: string): Promise<Booking | null> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new Error('Search term is required');
    }

    try {
      const booking = await this.bookingRepository.searchBooking(searchTerm.trim());
      
      if (!booking) {
        console.log('[SearchBookingUseCase] No booking found for:', searchTerm);
        return null;
      }

      console.log('[SearchBookingUseCase] Booking found:', booking.bookingID);
      return booking;
    } catch (error: any) {
      console.error('[SearchBookingUseCase] Search failed:', error);
      throw new Error(error?.message || 'Failed to search booking');
    }
  }
}
