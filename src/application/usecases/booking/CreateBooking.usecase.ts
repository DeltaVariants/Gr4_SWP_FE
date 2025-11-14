import { IBookingRepository } from "@/domain/repositories/IBookingRepository";
import { Booking, CreateBookingRequest } from "@/domain/entities/Booking";

export async function createBookingUseCase(
  bookingRepository: IBookingRepository,
  request: CreateBookingRequest
): Promise<Booking> {
  // Validate request
  if (!request.userID) {
    throw new Error("User ID is required");
  }
  if (!request.vehicleID) {
    throw new Error("Vehicle ID is required");
  }
  if (!request.stationID) {
    throw new Error("Station ID is required");
  }
  if (!request.batteryTypeID) {
    throw new Error("Battery Type ID is required");
  }
  if (
    !request.bookingDays ||
    request.bookingDays < 1 ||
    request.bookingDays > 31
  ) {
    throw new Error("Invalid booking day");
  }
  if (
    !request.bookingMonth ||
    request.bookingMonth < 1 ||
    request.bookingMonth > 12
  ) {
    throw new Error("Invalid booking month");
  }
  if (!request.bookingYear || request.bookingYear < 2000) {
    throw new Error("Invalid booking year");
  }
  if (request.bookingHour < 0 || request.bookingHour > 23) {
    throw new Error("Invalid booking hour");
  }
  if (request.bookingMinute < 0 || request.bookingMinute > 59) {
    throw new Error("Invalid booking minute");
  }

  // Additional business logic: check if booking time is in the future
  const bookingDate = new Date(
    request.bookingYear,
    request.bookingMonth - 1,
    request.bookingDays,
    request.bookingHour,
    request.bookingMinute
  );

  const now = new Date();
  if (bookingDate < now) {
    throw new Error("Booking time must be in the future");
  }

  // Call repository to create booking
  return await bookingRepository.createBooking(request);
}
