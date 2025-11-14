import { IBookingRepository } from "@/domain/repositories/IBookingRepository";
import { Booking } from "@/domain/entities/Booking";

export async function getBookingByIdUseCase(
  bookingRepository: IBookingRepository,
  bookingId: string
): Promise<Booking> {
  if (!bookingId) {
    throw new Error("Booking ID is required");
  }

  return await bookingRepository.getBookingById(bookingId);
}
