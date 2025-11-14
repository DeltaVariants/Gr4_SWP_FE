import { IBookingRepository } from "@/domain/repositories/IBookingRepository";
import { Booking } from "@/domain/entities/Booking";

export async function updateBookingStatusUseCase(
  bookingRepository: IBookingRepository,
  bookingId: string,
  status: "pending" | "cancelled" | "completed"
): Promise<Booking> {
  if (!bookingId) {
    throw new Error("Booking ID is required");
  }
  if (!status) {
    throw new Error("Status is required");
  }

  const validStatuses = ["pending", "cancelled", "completed"];
  if (!validStatuses.includes(status)) {
    throw new Error(
      "Invalid status. Must be: pending, cancelled, or completed"
    );
  }

  return await bookingRepository.updateBookingStatus(bookingId, status);
}
