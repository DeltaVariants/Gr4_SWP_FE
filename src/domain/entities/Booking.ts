/**
 * Booking Entity - Phản ánh cấu trúc database
 */
export interface Booking {
  booking_id: string; // PK
  driver_id: string; // FK
  vehicle_id: string; // FK
  station_id: string; // FK
  subscription_id: string; // FK
  preferred_time: string; // DATETIME
  created_at: string; // DATETIME
  battery_type: string; // VARCHAR(50)
  status: "pending" | "cancelled" | "completed"; // ENUM, DEFAULT 'pending'
}
