/**
 * Booking Domain Entity
 * Định nghĩa entity cho booking/reservation
 * Format Leader: userName, vehicleName, stationName, status (lowercase)
 */

export interface Booking {
  bookingID: string;
  userName: string;        // ✅ Leader format - từ backend UserName
  vehicleName: string;     // ✅ Leader format - từ backend VehicleName
  stationName: string;     // ✅ Leader format - từ backend StationName
  batteryType: string;
  planName: string;        // ✅ Leader format - từ backend PlanName
  bookingTime: string;     // ISO date string
  createdAt: string;       // ISO date string
  status: "pending" | "cancelled" | "completed";  // ✅ Leader format - lowercase
}

export interface CheckInData {
  bookingId: string;
  vehicleId: string;
  notes?: string;
}

export interface SwapData {
  bookingId: string;
  oldBatteryId: string;
  newBatteryId: string;
  notes?: string;
}

export interface CreateBookingData {
  customerId: string;
  customerName: string;
  stationId: string;
  vehicleId: string;
  batteryType: string;
  bookingTime: string;
}
