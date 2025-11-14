/**
 * BookingDTO - Backend Response Format
 * Map trực tiếp từ backend C# BookingDTOs
 * PascalCase để match với backend response
 */

export interface BookingDTO {
  BookingID?: string;
  UserName?: string;        // PascalCase - từ backend User.Username
  VehicleName?: string;     // PascalCase - từ backend Vehicle.VehicleName
  StationName?: string;     // PascalCase - từ backend Station.StationName
  BatteryType?: string;
  PlanName?: string;
  BookingTime?: string;     // ISO date string
  CreatedAt?: string;       // ISO date string
  Status?: string;          // "pending" | "confirmed" | "cancelled" | "completed" (lowercase từ enum)
}

/**
 * CreateBookingDTO - Request format để tạo booking
 */
export interface CreateBookingDTO {
  UserID: string;
  VehicleID: string;
  StationID: string;
  BatteryTypeID: string;
  BookingDays: number;
  BookingMonth: number;
  BookingYear: number;
  BookingHour: number;
  BookingMinute: number;
}

/**
 * UpdateBookingDTO - Request format để update booking status
 */
export interface UpdateBookingDTO {
  BookingID: string;
  BookingStatus: string;  // "completed" | "cancelled" (lowercase)
}

