export { createBookingUseCase } from "./CreateBooking.usecase";
export { getBookingByIdUseCase } from "./GetBookingById.usecase";
export { getAllBookingOfUserUseCase } from "./GetAllBookingOfUser.usecase";
// Note: updateBookingStatusUseCase function is available but we export class instance instead
// export { updateBookingStatusUseCase } from "./UpdateBookingStatus.usecase";

// Export classes for use cases that need instantiation
export { GetBookingsByStationUseCase } from "./GetBookingsByStationUseCase";
export { UpdateBookingStatusUseCase } from "./UpdateBookingStatusUseCase";

// Export instantiated use cases (singleton pattern)
import { bookingRepository } from "@/infrastructure/repositories/Hoang/BookingRepository";
import { GetBookingsByStationUseCase } from "./GetBookingsByStationUseCase";
import { UpdateBookingStatusUseCase } from "./UpdateBookingStatusUseCase";

export const getBookingsByStationUseCase = new GetBookingsByStationUseCase(bookingRepository);
export const updateBookingStatusUseCase = new UpdateBookingStatusUseCase(bookingRepository);
