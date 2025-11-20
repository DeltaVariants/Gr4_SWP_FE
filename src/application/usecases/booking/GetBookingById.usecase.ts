import { IBookingRepository } from "@/domain/repositories/IBookingRepository";
import { BookingDTO } from "@/dto";

export async function getBookingByIdUseCase(
  bookingRepository: IBookingRepository,
  bookingId: string
): Promise<BookingDTO> {
  if (!bookingId) {
    throw new Error("Booking ID is required");
  }

  return await bookingRepository.getBookingById(bookingId);
}
