/**
 * IBookingRepository Interface
 * Defines contract for booking data access operations
 */

import { Booking, CheckInData, SwapData, CreateBookingData } from '@/domain/dto/Hoang/Booking';

export interface IBookingRepository {
  getByStation(stationId: string): Promise<Booking[]>;
  getByCustomer(customerId: string): Promise<Booking[]>;
  getById(bookingId: string): Promise<Booking>;
  create(data: CreateBookingData): Promise<Booking>;
  checkIn(data: CheckInData): Promise<Booking>;
  completeSwap(data: SwapData): Promise<Booking>;
  updateStatus(
    bookingId: string,
    status: Booking['bookingStatus']
  ): Promise<{ booking: Booking; swapTransactionId?: string }>;
  confirm(bookingId: string): Promise<{ booking: Booking; swapTransactionId?: string }>;
  cancel(bookingId: string): Promise<void>;
  searchBooking(searchTerm: string): Promise<Booking | null>;
  updateBookingStatus(bookingId: string, status: string): Promise<void>;
}

