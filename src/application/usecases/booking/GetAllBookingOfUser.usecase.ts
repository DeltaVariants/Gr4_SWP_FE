import { IBookingRepository } from "@/domain/repositories/IBookingRepository";
import { BookingDTO } from "@/dto";

export async function getAllBookingOfUserUseCase(
  bookingRepository: IBookingRepository,
  userId: string
): Promise<BookingDTO[]> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  return await bookingRepository.getAllBookingOfUser(userId);
}
