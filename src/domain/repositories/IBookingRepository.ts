import { BookingDTO, CreateBookingRequest, BookingResponse } from "@/dto";

export interface IBookingRepository {
  createBooking(request: CreateBookingRequest): Promise<BookingDTO>;
  getBookingById(bookingId: string): Promise<BookingDTO>;
  getAllBookingOfUser(userId: string): Promise<BookingDTO[]>;
  updateBookingStatus(bookingId: string, status: string): Promise<BookingDTO>;
}
