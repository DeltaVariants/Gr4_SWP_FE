/**
 * Booking DTO - Phản ánh response từ API
 * Dùng cho client sử dụng
 */
export interface BookingDTO {
  bookingID: string;
  userName: string;
  vehicleName: string;
  stationName: string;
  batteryType: string;
  planName: string; // 'pay-per-swap' | 'basic' | subscription names
  bookingTime: string; // ISO date string
  createdAt: string; // ISO date string
  status: "pending" | "cancelled" | "completed";
}

/**
 * Create Booking Request DTO
 */
export interface CreateBookingRequest {
  userID: string;
  vehicleID: string;
  stationID: string;
  batteryTypeID: string;
  bookingDays: number;
  bookingMonth: number;
  bookingYear: number;
  bookingHour: number;
  bookingMinute: number;
}

/**
 * Update Booking Status Request DTO
 */
export interface UpdateBookingStatusRequest {
  bookingID: string;
  status: "pending" | "cancelled" | "completed";
}

/**
 * Booking Response DTO (single booking)
 */
export interface BookingResponse {
  success: boolean;
  message: string;
  data: BookingDTO;
}

/**
 * Bookings List Response DTO
 */
export interface BookingListResponse {
  success: boolean;
  message: string;
  data: BookingDTO[];
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}
