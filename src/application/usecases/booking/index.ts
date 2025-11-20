/**
 * Booking Use Cases
 * Export all configured booking use case instances
 */

import { bookingRepository } from '@/infrastructure/repositories/Hoang/BookingRepository';
import { GetBookingsByStationUseCase } from './GetBookingsByStationUseCase';
import { CheckInBookingUseCase } from './CheckInBookingUseCase';
import { CompleteSwapUseCase } from './CompleteSwapUseCase';
import { SearchBookingUseCase } from './SearchBookingUseCase';
import { UpdateBookingStatusUseCase } from './UpdateBookingStatusUseCase';

// Export configured use case instances (singleton)
export const getBookingsByStationUseCase = new GetBookingsByStationUseCase(bookingRepository);
export const checkInBookingUseCase = new CheckInBookingUseCase(bookingRepository);
export const completeSwapUseCase = new CompleteSwapUseCase(bookingRepository);
export const searchBookingUseCase = new SearchBookingUseCase(bookingRepository);
export const updateBookingStatusUseCase = new UpdateBookingStatusUseCase(bookingRepository);

// Export classes for testing or custom instantiation
export { 
  GetBookingsByStationUseCase, 
  CheckInBookingUseCase, 
  CompleteSwapUseCase,
  SearchBookingUseCase,
  UpdateBookingStatusUseCase,
};
