/**
 * Booking Repository Interface
 * Định nghĩa contract cho booking operations
 */

import { Booking, CheckInData, SwapData, CreateBookingData } from '../entities/Booking';

export interface IBookingRepository {
  /**
   * Get all bookings for a station
   */
  getByStation(stationId: string): Promise<Booking[]>;

  /**
   * Get all bookings for a customer
   */
  getByCustomer(customerId: string): Promise<Booking[]>;

  /**
   * Get booking by ID
   */
  getById(bookingId: string): Promise<Booking>;

  /**
   * Create new booking
   */
  create(data: CreateBookingData): Promise<Booking>;

  /**
   * Check in a booking
   */
  checkIn(data: CheckInData): Promise<Booking>;

  /**
   * Complete battery swap
   */
  completeSwap(data: SwapData): Promise<Booking>;

  /**
   * Update booking status
   */
  updateStatus(bookingId: string, status: Booking['bookingStatus']): Promise<Booking>;

  /**
   * Confirm booking (Pending -> Booked)
   */
  confirm(bookingId: string): Promise<Booking>;

  /**
   * Cancel booking
   */
  cancel(bookingId: string): Promise<void>;

  /**
   * Search booking by ID, customer name, or vehicle plate
   */
  searchBooking(searchTerm: string): Promise<Booking | null>;

  /**
   * Update booking status (legacy - alias for updateStatus)
   */
  updateBookingStatus(bookingId: string, status: string): Promise<void>;
}
