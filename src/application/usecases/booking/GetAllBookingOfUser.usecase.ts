import { IBookingRepository } from "@/domain/repositories/IBookingRepository";
import { Booking } from "@/domain/entities/Booking";

export async function getAllBookingOfUserUseCase(
  bookingRepository: IBookingRepository,
  userId: string
): Promise<Booking[]> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  return await bookingRepository.getAllBookingOfUser(userId);
}
