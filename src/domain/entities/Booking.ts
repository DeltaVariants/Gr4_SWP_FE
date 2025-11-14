export interface Booking {
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

export interface BookingResponse {
  success: boolean;
  message: string;
  data: Booking;
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}
