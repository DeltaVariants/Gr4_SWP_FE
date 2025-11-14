import {
  Booking,
  CreateBookingRequest,
  BookingResponse,
} from "@/domain/entities/Booking";

export interface IBookingRepository {
  createBooking(request: CreateBookingRequest): Promise<Booking>;
  getBookingById(bookingId: string): Promise<Booking>;
  getAllBookingOfUser(userId: string): Promise<Booking[]>;
  updateBookingStatus(bookingId: string, status: string): Promise<Booking>;
}
